use crate::supabase::supabase::initialize_supabase_client;
use crate::supabase::responses::{StatusCode, Response}; // Import Response and StatusCode
use serde_json::Value; // Import Value for JSON handling
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)] // Add Serialize here
pub struct Page {
    pub id: String,
    pub created_at: String,
    pub updated_at: String,
    pub user_id: String,
    pub title: String,
    pub parent_page_id: Option<String>, // Assuming this can be null
}

#[tauri::command]
pub async fn fetch_pages(
    user_id: &str,
) -> Result<Response<serde_json::Value>, String> {
    let supabase_client = initialize_supabase_client().await;
    let data = supabase_client
        .select("pages")
        .columns(
            [
                "id",
                "created_at",
                "updated_at",
                "user_id",
                "title",
                "parent_page_id",
            ]
            .to_vec(),
        )
        .eq("user_id", user_id)
        .execute()
        .await
        .map_err(|e| e.to_string())?;

    if data.is_empty() {
        return Ok(Response {
            status: StatusCode::NotFound,
            data: None,
            error: Some("No pages found for this user".to_string()),
        });
    }

    let pages: Vec<Page> = data
        .iter()
        .map(|page| Page {
            id: page.get("id").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
            created_at: page.get("created_at").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
            updated_at: page.get("updated_at").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
            user_id: page.get("user_id").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
            title: page.get("title").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
            parent_page_id: page.get("parent_page_id").map(|v| v.as_str().unwrap_or("").to_string()),
        })
        .collect();

    Ok(Response {
        status: StatusCode::Ok,
        data: Some(serde_json::json!(pages)),
        error: None,
    })
}
