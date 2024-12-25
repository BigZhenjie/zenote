use crate::supabase::supabase::initialize_storage_client;
use crate::supabase::supabase::initialize_supabase_client;
use serde_json::json;

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
pub async fn test() -> String {
    let storage_client = initialize_storage_client().await;
    let bucket = "avatars";
    let result = storage_client.get_bucket(&bucket).await.unwrap();

    format!("response: {:?}", result)
}

#[tauri::command]
pub async fn check_if_email_exists(email: String) -> bool {
    let supabase_client = initialize_supabase_client().await;
    // Check if user exists
    let response = supabase_client
        .select("users")
        .columns(["email"].to_vec())
        .eq("email", &email)
        .execute()
        .await;

    match response {
        Ok(data) => {
            if !data.is_empty() {
                true
            } else {
                false
            }
        }
        Err(_e) => false,
    }
}

#[tauri::command]
pub async fn sign_up(
    email: String,
    password: String,
    first_name: String,
    last_name: String,
) -> String {
    let supabase_client = initialize_supabase_client().await;

    // Check if user exists
    let response = supabase_client
        .select("users")
        .columns(["email"].to_vec())
        .eq("email", &email)
        .execute()
        .await;

    match response {
        Ok(data) => {
            if !data.is_empty() {
                "User already exists".to_string()
            } else {
                // User doesn't exist, proceed with creation
                create_user(&email, &password, &first_name, &last_name).await
            }
        }
        Err(e) => format!("Error checking user existence: {:?}", e),
    }
}
