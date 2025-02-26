use crate::functions::supabase::initialize_supabase_client;
use crate::functions::responses::{Response, StatusCode};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)] // Add Serialize here
pub struct Block {
    pub id: String,
    pub created_at: String,
    pub updated_at: String,
    #[serde(rename = "type")] // Maps to "type" in JSON or database
    pub page_type: String,    // Use a different Rust-friendly name
    pub order: i32,
    pub content: String,
    pub page_id: String,
    pub parent_block_id: Option<String>, // Assuming this can be null
}

#[tauri::command]
pub async fn fetch_blocks(page_id: String) -> Result<Response<serde_json::Value>, String> {
    let supabase_client = initialize_supabase_client().await;
    let data = supabase_client
        .select("blocks")
        .eq("page_id", &page_id)
        .execute()
        .await
        .map_err(|e| e.to_string())?;

    if data.is_empty() {
        return Ok(Response {
            status: StatusCode::Ok,
            data: None,
            error: None,
        });
    }
    let mut blocks: Vec<Block> = data
        .iter()
        .map(| block| Block {
            id: block["id"].as_str().unwrap_or_default().to_string(),
            created_at: block["created_at"].as_str().unwrap_or_default().to_string(),
            updated_at: block["updated_at"].as_str().unwrap_or_default().to_string(),
            page_type: block["type"].as_str().unwrap_or_default().to_string(),
            order: block["order"].as_i64().unwrap_or_default() as i32,
            content: block["content"].as_str().unwrap_or_default().to_string(),
            page_id: block["page_id"].as_str().unwrap_or_default().to_string(),
            parent_block_id: block["parent_block_id"]
                .as_str()
                .map(|s| s.to_string()),
        })
        .collect();
        
    blocks.sort_by(|a, b| {
        // Parse timestamp, adding UTC timezone if missing
        a.order.cmp(&b.order)
    });
    

    Ok(Response {
        status: StatusCode::Ok,
        data: Some(serde_json::json!(blocks)),
        error: None,
    })
}