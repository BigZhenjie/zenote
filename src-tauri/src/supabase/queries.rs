use crate::supabase::supabase::initialize_supabase_client;
use serde::Deserialize;

pub async fn fetch_user_entry_by_email(email: &str) -> Result<Option<UserEntry>, Box<dyn std::error::Error>> {
    let supabase_client = initialize_supabase_client().await;
    match supabase_client
        .select("users")
        .columns(["id", "email", "first_name", "last_name", "avatar_url", "created_at"].to_vec())
        .eq("email", &email)
        .execute()
        .await {
            Ok(data) => {
                let user_entry = data.first().map(|user| UserEntry {
                    id: user.get("id").unwrap().as_str().unwrap().to_string(),
                    email: user.get("email").unwrap().as_str().unwrap().to_string(),
                    first_name: user.get("first_name").unwrap().as_str().unwrap().to_string(),
                    last_name: user.get("last_name").unwrap().as_str().unwrap().to_string(),
                    avatar_url: user.get("avatar_url").unwrap().as_str().unwrap().to_string(),
                    created_at: user.get("created_at").unwrap().as_str().unwrap().to_string()
                });
                Ok(user_entry)
            },
            Err(e) => {
                Err(e.to_string().into())
            }
    }
}

#[derive(Debug, Deserialize)]
pub struct UserEntry {
    id: String,
    email: String,
    first_name: String,
    last_name: String,
    avatar_url: String,
    created_at: String
}
