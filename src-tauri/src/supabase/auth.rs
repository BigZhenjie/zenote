use crate::supabase::supabase::initialize_supabase_client;
use serde_json::json;

pub async fn create_user(email: &str, password: &str, first_name: &str, last_name: &str) -> String {
    let supabase_client = initialize_supabase_client().await;
    let response = supabase_client
        .insert("users", 
        json!({
            "email": email,
            "password": password,
            "first_name": first_name,
            "last_name": last_name
        })).await;
    format!("response: {:?}", response)
}

pub async fn sign_up(email: &str, password: &str, first_name: &str, last_name: &str) -> String {
    let supabase_client = initialize_supabase_client().await;
    let response = supabase_client
        .select("users")
        .columns(["email"].to_vec())
        .eq("email", email)
        .execute()
        .await;
    format!("response: {:?}", response)
}
