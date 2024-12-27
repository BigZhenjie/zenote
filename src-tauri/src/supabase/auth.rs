use crate::supabase::supabase::initialize_supabase_client;
use serde_json::json;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};


pub async fn create_user(email: &str, password: &str, first_name: &str, last_name: &str) -> String {
    let supabase_client = initialize_supabase_client().await;
    let response = supabase_client
        .insert(
            "users",
            json!({
                "email": email,
                "password": password,
                "first_name": first_name,
                "last_name": last_name
            }),
        )
        .await;
    format!("response: {:?}", response)
}

#[tauri::command]
pub async fn check_if_email_exists(email: String) -> Result<serde_json::Value, String> {
    // Initialize client
    let supabase_client = initialize_supabase_client().await;

    // Query with error handling
    match supabase_client
        .select("users")
        .columns(["email"].to_vec())
        .eq("email", &email)
        .execute()
        .await {
            Ok(data) => {
                let exists = !data.is_empty();
                Ok(serde_json::json!({
                    "success": true,
                    "exists": exists
                }))
            },
            Err(e) => {
                Err(format!("Database query failed: {}", e))
            }
    }
}

fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt).unwrap().to_string();
    password_hash
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
) -> Result<serde_json::Value, String> {
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

    if response.is_empty() {
        Ok(serde_json::json!({
            "success": true,
            "message": "User created successfully"
        }))
    } else {
        Err("User already exists".to_string())
    }
}
