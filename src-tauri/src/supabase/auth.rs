use crate::supabase::supabase::initialize_supabase_client;
use serde_json::json;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

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

        
    if !response.is_empty() {
        Ok(serde_json::json!({
            "success": true,
            "message": "User created successfully"
        }))
    } else {
        Err("User already exists".to_string())
    }
}

#[tauri::command]
pub async fn sign_in(
    email: String, 
    password: String
) -> Result<serde_json::Value, String> {
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
                Ok(serde_json::json!({
                    "success": true,
                    "message": "Login successful"
                }))
            } else {
                Err("Invalid email or password".to_string())
            }
        },
        None => Err("User not found".to_string())
    }
}