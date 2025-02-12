use crate::supabase::supabase::initialize_supabase_client;
use serde::Deserialize;
use serde_json::Value; // Ensure this import is correct

pub async fn fetch_user_entry_by_email(
    email: &str,
) -> Result<Option<UserEntry>, Box<dyn std::error::Error>> {
    let supabase_client = initialize_supabase_client().await;
    
    match supabase_client
        .select("users")
        // .columns(&[
        //     "id", "email", "first_name", "last_name", "avatar_url", "created_at",
        // ])
        .eq("email", email)
        .execute()
        .await
    {
        Ok(data) => {
            println!("Data: {:?}", data);
            
            let user_entry = data.first().map(|user| UserEntry {
                id: user.get("id")
                    .and_then(|v| v.as_i64())
                    .unwrap_or_else(|| {
                        user.get("id")
                            .and_then(|v| v.as_u64())
                            .filter(|&v| v <= i64::MAX as u64)
                            .map(|v| v as i64)
                            .unwrap_or(0)
                    }),
                email: user.get("email")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                first_name: user.get("first_name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                last_name: user.get("last_name")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                avatar_url: user.get("avatar_url")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                created_at: user.get("created_at")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
            });

            Ok(user_entry)
        }
        Err(e) => Err(e.to_string().into()),
    }
}

#[derive(Debug, Deserialize)]
pub struct UserEntry {
    pub id: i64,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub avatar_url: String,
    pub created_at: String,
}
