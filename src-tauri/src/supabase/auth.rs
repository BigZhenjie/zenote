use serde::{Serialize, Deserialize, ser::Serializer, de::Deserializer};
use serde_json::json;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{encode, Header, EncodingKey};
use chrono::{Utc, Duration};
use crate::supabase::supabase::initialize_supabase_client;

#[derive(Debug, Copy, Clone)]
pub enum StatusCode {
    Ok = 200,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    InternalServerError = 500,
}

impl Serialize for StatusCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_u16(*self as u16)
    }
}

impl<'de> Deserialize<'de> for StatusCode {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let value = u16::deserialize(deserializer)?;
        match value {
            200 => Ok(StatusCode::Ok),
            400 => Ok(StatusCode::BadRequest),
            401 => Ok(StatusCode::Unauthorized),
            404 => Ok(StatusCode::NotFound),
            500 => Ok(StatusCode::InternalServerError),
            _ => Err(serde::de::Error::custom("Invalid status code")),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Response<T = serde_json::Value> {
    status: StatusCode,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    email: String,
    exp: usize,
}

fn get_jwt_secret() -> Result<String, String> {
    dotenv::var("JWT_SECRET").map_err(|e| format!("Failed to read JWT_SECRET: {}", e))
}

#[tauri::command]
pub async fn check_if_email_exists(email: String) -> Result<Response<bool>, String> {
    let supabase_client = initialize_supabase_client().await;

    match supabase_client
        .select("users")
        .columns(["email"].to_vec())
        .eq("email", &email)
        .execute()
        .await {
            Ok(data) => {
                let exists = !data.is_empty();
                Ok(Response {
                    status: StatusCode::Ok,
                    data: Some(exists),
                    error: if exists { None } else { Some("Email does not exist".to_string()) },
                })
            },
            Err(e) => {
                Err(format!("Database query failed: {}", e))
            }
    }
}

fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2.hash_password(password.as_bytes(), &salt)
        .unwrap()
        .to_string()
}

fn verify_password(password: &str, password_hash: &str) -> bool {
    let parsed_hash = PasswordHash::new(password_hash).unwrap();
    Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok()
}

#[tauri::command]
pub async fn sign_up(
    email: String,
    password: String,
    first_name: String,
    last_name: String,
    avatar_url: String
) -> Result<Response<String>, String> {
    let supabase_client = initialize_supabase_client().await;
    
    println!("Attempting to create user with email: {}", email);

    let response = supabase_client
        .insert("users", 
            json!({
                "email": email,
                "password": hash_password(&password),
                "first_name": first_name,
                "last_name": last_name,
                "avatar_url": avatar_url
            })
        )
        .await
        .map_err(|e| e.to_string())?;

    if !response.is_empty() {
        Ok(Response {
            status: StatusCode::Ok,
            data: Some("User created successfully".to_string()),
            error: None,
        })
    } else {
        Ok(Response {
            status: StatusCode::BadRequest,
            data: None,
            error: Some("User already exists".to_string()),
        })
    }
}

#[tauri::command]
pub async fn sign_in(
    email: String, 
    password: String
) -> Result<Response<serde_json::Value>, String> {
    let supabase_client = initialize_supabase_client().await;
    println!("Signing in user: {}", email);

    let response = supabase_client
        .select("users")
        .columns(["email", "password"].to_vec())
        .eq("email", &email)
        .execute()
        .await
        .map_err(|e| e.to_string())?;

    match response.first() {
        Some(user) => {
            let stored_hash = user.get("password")
                .and_then(|v| v.as_str())
                .ok_or("Invalid user data")?;

            if verify_password(&password, stored_hash) {
                let expiration = Utc::now()
                    .checked_add_signed(Duration::seconds(3600))
                    .expect("Invalid timestamp")
                    .timestamp() as usize;

                let claims = Claims {
                    sub: email.clone(),
                    email: email,
                    exp: expiration,
                };

                let token = encode(
                    &Header::default(),
                    &claims,
                    &EncodingKey::from_secret(get_jwt_secret()?.as_bytes())
                ).map_err(|e| e.to_string())?;

                let response = Response {
                    status: StatusCode::Ok,
                    data: Some(serde_json::json!({ "token": token })),
                    error: None,
                };
                
                println!("Returning response: {:?}", response);
                Ok(response)
            } else {
                Ok(Response {
                    status: StatusCode::Unauthorized,
                    data: None,
                    error: Some("Invalid password".to_string()),
                })
            }
        },
        None => Ok(Response {
            status: StatusCode::NotFound,
            data: None,
            error: Some("User not found".to_string()),
        })
       }
}
