use crate::functions::responses::{Response, StatusCode};
use dotenv::dotenv;
use reqwest::{Client, header};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::env;

#[derive(Serialize, Deserialize)]
struct EmbeddingResponse {
    data: Vec<EmbeddingData>,
    model: String,
    usage: EmbeddingUsage,
}

#[derive(Serialize, Deserialize)]
struct EmbeddingData {
    embedding: Vec<f32>,
    index: u32,
}

#[derive(Serialize, Deserialize)]
struct EmbeddingUsage {
    prompt_tokens: u32,
    total_tokens: u32,
}

async fn generate_embedding(text: &str) -> Result<Vec<f32>, String> {
    dotenv().ok();
    let api_key = env::var("OPENAI_API_KEY")
        .map_err(|_| "Missing OPENAI_API_KEY in environment".to_string())?;
    
    let client = Client::new();
    let url = "https://api.openai.com/v1/embeddings";
    
    // Prepare the request body
    let body = json!({
        "model": "text-embedding-3-small",
        "input": text,
        "encoding_format": "float"
    });
    
    // Send the request
    let response = client
        .post(url)
        .header(header::AUTHORIZATION, format!("Bearer {}", api_key))
        .header(header::CONTENT_TYPE, "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;
    
    // Check for errors
    if !response.status().is_success() {
        let error_text = response.text().await
            .map_err(|e| format!("Failed to get error response: {}", e))?;
        return Err(format!("OpenAI API error: {}", error_text));
    }
    
    // Parse the response
    let embedding_response: EmbeddingResponse = response.json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    if embedding_response.data.is_empty() {
        return Err("No embedding was returned".to_string());
    }
    
    Ok(embedding_response.data[0].embedding.clone())
}

#[tauri::command]
pub async fn index_block(
    block_id: String,
    content: String,
    page_id: String,
    metadata: Value,
) -> Result<Response<Value>, String> {
    dotenv().ok();
    let supabase_url = env::var("VITE_SUPABASE_URL").map_err(|e| e.to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_API_KEY").map_err(|e| e.to_string())?;

    // Generate embedding for the content
    let embedding = match generate_embedding(&content).await {
        Ok(emb) => emb,
        Err(e) => return Ok(Response {
            status: StatusCode::InternalServerError,
            data: None,
            error: Some(format!("Failed to generate embedding: {}", e)),
        }),
    };

    // Store the embedding in Supabase using upsert
    let client = Client::new();
    let endpoint = format!("{}/rest/v1/embeddings", supabase_url);
    
    let body = json!({
        "content": content,
        "embedding": embedding,
        "block_id": block_id,
        "page_id": page_id,
        "metadata": metadata
    });
    
    let response = client
        .post(&endpoint)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "resolution=merge-duplicates") // This enables upsert based on unique constraints
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if response.status().is_success() {
        let json_response = response.json::<Value>().await.map_err(|e| e.to_string())?;
        Ok(Response {
            status: StatusCode::Ok,
            data: Some(json_response),
            error: None,
        })
    } else {
        let error_text = response.text().await.map_err(|e| e.to_string())?;
        Ok(Response {
            status: StatusCode::InternalServerError,
            data: None,
            error: Some(format!("Supabase error: {}", error_text)),
        })
    }
}

#[tauri::command]
pub async fn query_similar_blocks(
    query: String, 
    threshold: f32, 
    limit: i32
) -> Result<Response<Value>, String> {
    dotenv().ok();
    let supabase_url = env::var("VITE_SUPABASE_URL").map_err(|e| e.to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_API_KEY").map_err(|e| e.to_string())?;

    // Generate embedding for the query
    let embedding = match generate_embedding(&query).await {
        Ok(emb) => emb,
        Err(e) => return Ok(Response {
            status: StatusCode::InternalServerError,
            data: None,
            error: Some(format!("Failed to generate embedding: {}", e)),
        }),
    };
    
    // Query similar embeddings from Supabase
    let client = Client::new();
    let endpoint = format!(
        "{}/rest/v1/rpc/match_embeddings", 
        supabase_url
    );
    
    let body = json!({
        "query_embedding": embedding,
        "match_threshold": threshold,
        "match_count": limit
    });
    
    let response = client
        .post(&endpoint)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    if response.status().is_success() {
        let json_response = response.json::<Value>().await.map_err(|e| e.to_string())?;
        Ok(Response {
            status: StatusCode::Ok,
            data: Some(json_response),
            error: None,
        })
    } else {
        let error_text = response.text().await.map_err(|e| e.to_string())?;
        Ok(Response {
            status: StatusCode::InternalServerError,
            data: None,
            error: Some(format!("Supabase error: {}", error_text)),
        })
    }
}

#[tauri::command]
pub async fn ask_llm(
    query: String,
    context: Option<String>
) -> Result<Response<Value>, String> {
    dotenv().ok();
    let api_key = env::var("OPENAI_API_KEY")
        .map_err(|_| "Missing OPENAI_API_KEY in environment".to_string())?;
    
    let client = Client::new();
    let url = "https://api.openai.com/v1/chat/completions";
    
    // Create messages array with appropriate system and user content
    let mut messages = Vec::new();
    
    // System message with context
    let system_message = match &context {
        Some(ctx) => json!({
            "role": "system",
            "content": format!(
                "You are a helpful assistant for the note-taking app called ZeNote. Answer the user's question based on their notes and previous conversation. Be specific and reference information from their notes when relevant.",
            )
        }),
        None => json!({
            "role": "system",
            "content": "You are a helpful assistant for the note-taking app called ZeNote. Answer the user's question as clearly and concisely as possible."
        }),
    };
    
    messages.push(system_message);
    
    // Add context as a separate system message if available
    if let Some(ctx) = context {
        messages.push(json!({
            "role": "system",
            "content": ctx
        }));
    }
    
    // Add the user query
    messages.push(json!({
        "role": "user",
        "content": query
    }));
    
    // Prepare the request body
    let body = json!({
        "model": "gpt-4o",
        "messages": messages,
        "temperature": 0.7
    });
    
    // Send the request
    let response = client
        .post(url)
        .header(header::AUTHORIZATION, format!("Bearer {}", api_key))
        .header(header::CONTENT_TYPE, "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;
    
    // Check for errors
    if !response.status().is_success() {
        let error_text = response.text().await
            .map_err(|e| format!("Failed to get error response: {}", e))?;
        return Ok(Response {
            status: StatusCode::InternalServerError,
            data: None,
            error: Some(format!("OpenAI API error: {}", error_text)),
        });
    }
    
    // Parse the response
    let llm_response: Value = response.json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;
    
    Ok(Response {
        status: StatusCode::Ok,
        data: Some(llm_response),
        error: None,
    })
}