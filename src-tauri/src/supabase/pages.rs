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
    user_id: i64,
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
        .eq("user_id", &user_id.to_string())
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

#[tauri::command]
pub async fn fetch_page(
    page_id: String,
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
        id: data[0].get("id").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
        created_at: data[0].get("created_at").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
        updated_at: data[0].get("updated_at").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
        user_id: data[0].get("user_id").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
        title: data[0].get("title").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
        parent_page_id: data[0].get("parent_page_id").map(|v| v.as_str().unwrap_or("").to_string()),
    };

    Ok(Response {
        status: StatusCode::Ok,
        data: Some(serde_json::json!(page)),
        error: None,
    })
}

#[tauri::command]
pub async fn update_page(
    page_id: String,
    title: String,
    parent_page_id: Option<String>,
) -> Result<Response<serde_json::Value>, String> {
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
    if data.is_empty() {
        return Ok(Response {
            status: StatusCode::Ok,
            data: None,
            error: None,
        });
    }

    // let page = Page {
    //     id: data[0].get("id").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
    //     created_at: data[0].get("created_at").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
    //     updated_at: data[0].get("updated_at").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
    //     user_id: data[0].get("user_id").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
    //     title: data[0].get("title").unwrap_or(&Value::Null).as_str().unwrap_or("").to_string(),
    //     parent_page_id: data[0].get("parent_page_id").map(|v| v.as_str().unwrap_or("").to_string()),
    // };

    Ok(Response {
        status: StatusCode::Ok,
        data: None,
        error: None,
    })
}   

