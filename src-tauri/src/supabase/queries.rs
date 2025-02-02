use crate::supabase::supabase::initialize_supabase_client;
use serde::Deserialize;
use serde_json::Value; // Ensure this import is correct

pub async fn fetch_user_entry_by_email(
    email: &str,
) -> Result<Option<UserEntry>, Box<dyn std::error::Error>> {

    let supabase_client = initialize_supabase_client().await;
    match supabase_client
        .select("users")
        .columns(
            [
                "id",
                "email",
                "first_name",
                "last_name",
                "avatar_url",
                "created_at",
            ]
            .to_vec(),
        )
        .eq("email", &email)
        .execute()
        .await
    {
        Ok(data) => {
            let user_entry = data.first().map(|user| UserEntry {
                id: user
                    .get("id")
                    .unwrap_or(&Value::Null)
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                email: user
                    .get("email")
                    .unwrap_or(&Value::Null)
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                first_name: user
                    .get("first_name")
                    .unwrap_or(&Value::Null)
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                last_name: user
                    .get("last_name")
                    .unwrap_or(&Value::Null)
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                avatar_url: user
                    .get("avatar_url")
                    .unwrap_or(&Value::Null)
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                created_at: user
                    .get("created_at")
                    .unwrap_or(&Value::Null)
                    .as_str()
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
    pub id: String,
    pub email: String,
    pub first_name: String,
    pub last_name: String,
    pub avatar_url: String,
    pub created_at: String,
}
