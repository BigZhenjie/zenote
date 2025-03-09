use crate::functions::supabase::initialize_supabase_client;
use crate::functions::responses::{Response, StatusCode};
use serde::{Deserialize, Serialize};

use super::supabase;

#[derive(Debug, Deserialize, Serialize)] // Add Serialize here
pub struct Block {
    pub id: String,
    pub created_at: String,
    pub updated_at: String,
    #[serde(rename = "type")] // Maps to "type" in JSON or database
    pub block_type: String,    // Use a different Rust-friendly name
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
    .map(|block| Block {
        // Handle id as either a number or a string
        id: if block["id"].is_i64() || block["id"].is_u64() {
            block["id"].as_i64().map_or_else(
                || block["id"].as_u64().unwrap_or_default().to_string(),
                |id| id.to_string()
            )
        } else {
            block["id"].as_str().unwrap_or_default().to_string()
        },
        created_at: block["created_at"].as_str().unwrap_or_default().to_string(),
        updated_at: block["updated_at"].as_str().unwrap_or_default().to_string(),
        block_type: block["type"].as_str().unwrap_or_default().to_string(),
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

async fn block_exists(block_id: String) -> bool {
    let supabase_client = initialize_supabase_client().await;
    let data = match supabase_client
        .select("blocks")
        .eq("id", &block_id)
        .execute()
        .await
    {
        Ok(data) => data,
        Err(_) => return false,
    };
    if data.is_empty() {
        return false;
    }
    true
}

#[tauri::command]
pub async fn update_block(
    block_id: String,
    page_id: String,
    content: String,
    parent_block_id: Option<String>,
    order: i32,
    block_type: String,
) -> Result<Response<serde_json::Value>, String> {
    let supbase_client = initialize_supabase_client().await;

    let body = serde_json::json!({
        "id": block_id,
        "content": content,
        "page_id": page_id,
        "parent_block_id": if let Some(ref id) = parent_block_id {
            if id.is_empty() {
                serde_json::Value::Null
            } else {
                serde_json::Value::String(id.clone())
            }
        } else {
            serde_json::Value::Null
        },
        "order": order,
        "type": block_type,
        "updated_at": chrono::Utc::now().to_rfc3339(),
    });
    println!("body: {:?}", body);

    let result = supbase_client
    .update("blocks", &block_id, body).await?;

    // Parse the string result into a JSON value
    let result_json = serde_json::from_str::<serde_json::Value>(&result)
        .map_err(|e| e.to_string())?;
    println!("result_json: {:?}", result_json);
    Ok(Response {
        status: StatusCode::Ok,
        data: Some(result_json),
        error: None,
    })
}

#[tauri::command]
pub async fn create_block(
    page_id: String,
    content: String,
    parent_block_id: Option<String>,
    order: i32,
    block_type: String,
) -> Result<Response<serde_json::Value>, String> {
    let supabase_client = initialize_supabase_client().await;

    let body = serde_json::json!({
        "page_id": page_id,
        "content": content,
        "parent_block_id": if let Some(ref id) = parent_block_id {
            if id.is_empty() {
                serde_json::Value::Null
            } else {
                serde_json::Value::String(id.clone())
            }
        } else {
            serde_json::Value::Null
        },
        "order": order,
        "type": block_type,
        "updated_at": chrono::Utc::now().to_rfc3339(),
        "created_at": chrono::Utc::now().to_rfc3339(),
    });
    println!("body: {:?}", body);
    let result = supabase_client
        .insert("blocks", body)
        .await?;
    // Parse the string result into a JSON value
    let result_json = serde_json::from_str::<serde_json::Value>(&result)
        .map_err(|e| e.to_string())?;

    Ok(Response {
        status: StatusCode::Ok,
        data: Some(result_json),
        error: None,
    })
}
