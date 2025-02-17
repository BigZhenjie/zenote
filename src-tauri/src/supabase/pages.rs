use crate::supabase::responses::{Response, StatusCode}; // Import Response and StatusCode
use crate::supabase::supabase::initialize_supabase_client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value}; // Import Value and json macro for JSON handling
use reqwest::Client;
use dotenv::dotenv;
use std::env;

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
pub async fn fetch_pages(user_id: String) -> Result<Response<serde_json::Value>, String> {
    let supabase_client = initialize_supabase_client().await;
    let data = supabase_client
        .select("pages")
        .eq("user_id", &user_id)
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

    let pages: Vec<Page> = data
        .iter()
        .map(|page| Page {
            id: page
                .get("id")
                .unwrap_or(&Value::Null)
                .as_str()
                .unwrap_or("")
                .to_string(),
            created_at: page
                .get("created_at")
                .unwrap_or(&Value::Null)
                .as_str()
                .unwrap_or("")
                .to_string(),
            updated_at: page
                .get("updated_at")
                .unwrap_or(&Value::Null)
                .as_str()
                .unwrap_or("")
                .to_string(),
            user_id: page
                .get("user_id")
                .unwrap_or(&Value::Null)
                .as_str()
                .unwrap_or("")
                .to_string(),
            title: page
                .get("title")
                .unwrap_or(&Value::Null)
                .as_str()
                .unwrap_or("")
                .to_string(),
            parent_page_id: page
                .get("parent_page_id")
                .map(|v| v.as_str().unwrap_or("").to_string()),
        })
        .collect();

    Ok(Response {
        status: StatusCode::Ok,
        data: Some(serde_json::json!(pages)),
        error: None,
    })
}

#[tauri::command]
pub async fn fetch_page(page_id: String) -> Result<Response<serde_json::Value>, String> {
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
        .eq("id", &page_id)
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

    let page = Page {
        id: data
            .first()
            .and_then(|d| d.get("id"))
            .unwrap_or(&Value::Null)
            .as_str()
            .unwrap_or("")
            .to_string(),
        created_at: data
            .get(0)
            .and_then(|d| d.get("created_at"))
            .unwrap_or(&Value::Null)
            .as_str()
            .unwrap_or("")
            .to_string(),
        updated_at: data
            .get(0)
            .and_then(|d| d.get("updated_at"))
            .unwrap_or(&Value::Null)
            .as_str()
            .unwrap_or("")
            .to_string(),
        user_id: data
            .get(0)
            .and_then(|d| d.get("user_id"))
            .unwrap_or(&Value::Null)
            .as_str()
            .unwrap_or("")
            .to_string(),
        title: data
            .get(0)
            .and_then(|d| d.get("title"))
            .unwrap_or(&Value::Null)
            .as_str()
            .unwrap_or("")
            .to_string(),
        parent_page_id: data
            .get(0)
            .and_then(|d| d.get("parent_page_id"))
            .map(|v| v.as_str().unwrap_or("").to_string()),
    };

    Ok(Response {
        status: StatusCode::Ok,
        data: Some(serde_json::json!(page)),
        error: None,
    })
}

pub async fn page_exists(page_id: String) -> bool {
    let supabase_client = initialize_supabase_client().await;
    let data = match supabase_client
        .select("pages")
        .eq("id", &page_id)
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
pub async fn update_page(
    page_id: String,
    user_id: String,
    title: String,
    parent_page_id: Option<String>,
) -> Result<Response<serde_json::Value>, String> {
    let page_exists = page_exists(page_id.clone()).await;
    println!("page exists: {}", page_exists);
    if !page_exists {
        if let Err(e) = create_page(user_id, page_id, title, parent_page_id).await {
            return Ok(Response {
                status: StatusCode::Ok,
                data: None,
                error: Some(e),
            });
        }
        return Ok(Response {
            status: StatusCode::Ok,
            data: Some(serde_json::json!("Created page")),
            error: None,
        });
    }

    let supabase_client = initialize_supabase_client().await;

    let body = serde_json::json!({
        "title": title,
        "parent_page_id": parent_page_id,
        "updated_at": chrono::Utc::now().to_rfc3339(),
    });
    let data = supabase_client
        .update("pages", &page_id, body)
        .await
        .map_err(|e| e.to_string())?;
    println!("data from updating page: {:?}", data);

    Ok(Response {
        status: StatusCode::Ok,
        data: None,
        error: None,
    })
}

pub async fn create_page(
    user_id: String,
    page_id: String,
    title: String,
    parent_page_id: Option<String>,
) -> Result<Response<serde_json::Value>, String> {

    dotenv().ok();
    
    let supabase_url = env::var("SUPABASE_URL")
        .map_err(|_| "Missing SUPABASE_URL in .env".to_string())?;
    let supabase_key = env::var("SUPABASE_API_KEY")
        .map_err(|_| "Missing SUPABASE_KEY in .env".to_string())?;

    let client = Client::new();
    let mut payload = serde_json::json!({
        "user_id": user_id,
        "id": page_id,
        "title": title,
        "created_at": chrono::Utc::now().to_rfc3339(),
        "updated_at": chrono::Utc::now().to_rfc3339(),
    });

    if let Some(parent_id) = parent_page_id {
        payload["parent_page_id"] = serde_json::Value::String(parent_id);
    }

    let response = client
        .post(&format!("{}/rest/v1/pages", supabase_url))
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = if response.status().is_success() {
        StatusCode::Ok
    } else {
        StatusCode::BadRequest
    };

    Ok(Response {
        status,
        data: Some(response.json().await.map_err(|e| e.to_string())?),
        error: None,
    })
}