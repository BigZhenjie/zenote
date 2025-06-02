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
    
    let body = json!({
        "model": "text-embedding-3-small",
        "input": text,
        "encoding_format": "float"
    });
    
    let response = client
        .post(url)
        .header(header::AUTHORIZATION, format!("Bearer {}", api_key))
        .header(header::CONTENT_TYPE, "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request to OpenAI: {}", e))?;
    
    if !response.status().is_success() {
        let error_text = response.text().await
            .map_err(|e| format!("Failed to get error response from OpenAI: {}", e))?;
        return Err(format!("OpenAI API error: {}", error_text));
    }
    
    let embedding_response: EmbeddingResponse = response.json() // Correctly uses EmbeddingResponse from the same file
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;
    
    if embedding_response.data.is_empty() {
        return Err("No embedding was returned from OpenAI".to_string());
    }
    
    Ok(embedding_response.data[0].embedding.clone())
}

#[tauri::command]
pub async fn index_block(
    block_id: String,
    content: String,
    page_id: String,
    metadata: Value,
    user_id: String 
) -> Result<Response<Value>, String> {
    dotenv().ok();
    let supabase_url = env::var("VITE_SUPABASE_URL").map_err(|e| e.to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_API_KEY").map_err(|e| e.to_string())?;

    println!("[index_block] Indexing block_id: {}, user_id: {}", block_id, user_id);

    if content.trim().len() <= 10 { // Check from your frontend logic
        println!("[index_block] Content for block_id {} is too short or empty, skipping indexing.", block_id);
        return Ok(Response {
            status: StatusCode::Ok, // Or a custom status indicating not indexed
            data: Some(json!({"message": "Content too short, block not indexed.", "block_id": block_id})),
            error: None,
        });
    }

    let embedding = match generate_embedding(&content).await {
        Ok(emb) => emb,
        Err(e) => {
            println!("[index_block] Error generating embedding for block_id {}: {}", block_id, e);
            return Ok(Response {
                status: StatusCode::InternalServerError,
                data: None,
                error: Some(format!("Failed to generate embedding: {}", e)),
            });
        }
    };

    let client = Client::new();
    // Updated to use composite primary key (block_id, page_id) for conflict resolution
    let endpoint = format!("{}/rest/v1/embeddings?on_conflict=block_id,page_id", supabase_url); 

    let body = json!({
        "block_id": block_id.clone(), // Required for composite key matching
        "content": content,
        "embedding": embedding,
        "page_id": page_id, // Required for composite key matching
        "metadata": metadata,
        "user_id": user_id 
    });
    
    // println!("[index_block] Request body: {}", serde_json::to_string_pretty(&body).unwrap_or_default());

    let response = client
        .post(&endpoint)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        // `return=representation` asks Supabase to return the inserted/updated row.
        // `resolution=merge-duplicates` tells it to update if there's a conflict.
        .header("Prefer", "resolution=merge-duplicates,return=representation") 
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            println!("[index_block] Error sending request to Supabase for block_id {}: {}", block_id, e);
            e.to_string()
        })?;

    let response_status = response.status();
    println!("[index_block] Supabase response status for block_id {}: {}", block_id, response_status);

    if response_status.is_success() {
        // Even with return=representation, it's good to handle potentially empty text
        let response_text = response.text().await.map_err(|e| {
            println!("[index_block] Error reading Supabase success response text for block_id {}: {}", block_id, e);
            e.to_string()
        })?;

        if response_text.is_empty() {
            // This case should be less likely with return=representation but good to cover
            println!("[index_block] Supabase returned successful status but empty body for block_id {}. Assuming success.", block_id);
            Ok(Response {
                status: StatusCode::Ok,
                data: Some(json!({"message": "Block indexed (Supabase returned empty body).", "block_id": block_id})),
                error: None,
            })
        } else {
            // Attempt to parse the JSON
            match serde_json::from_str::<Value>(&response_text) {
                Ok(json_response) => Ok(Response {
                    status: StatusCode::Ok,
                    data: Some(json_response),
                    error: None,
                }),
                Err(e) => {
                    println!("[index_block] Error parsing Supabase JSON response for block_id {}: {}. Response text was: {}", block_id, e, response_text);
                    Ok(Response { 
                        status: StatusCode::InternalServerError, // Or a more specific error
                        data: None,
                        error: Some(format!("Failed to parse Supabase response: {}", e)),
                    })
                }
            }
        }
    } else {
        let error_text = response.text().await.map_err(|e| {
            println!("[index_block] Error reading Supabase error response text for block_id {}: {}", block_id, e);
            e.to_string()
        })?;
        println!("[index_block] Supabase error for block_id {}. Status: {}. Response: {}", block_id, response_status, error_text);
        Ok(Response {
            status: match response_status.as_u16() {
                200..=299 => StatusCode::Ok,
                400..=499 => StatusCode::BadRequest, 
                500..=599 => StatusCode::InternalServerError,
                _ => StatusCode::InternalServerError,
            },
            data: None,
            error: Some(format!("Supabase error ({}): {}", response_status, error_text)),
        })
    }
}

#[tauri::command]
pub async fn query_similar_blocks(
    query: String, 
    threshold: f32, 
    limit: i32,
    user_id: String // Add user_id parameter
) -> Result<Response<Value>, String> {
    dotenv().ok();
    let supabase_url = env::var("VITE_SUPABASE_URL").map_err(|e| e.to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_API_KEY").map_err(|e| e.to_string())?;

    // Generate embedding for the query
    println!("[query_similar_blocks] Generating embedding for query...");
    let embedding = match generate_embedding(&query).await {
        Ok(emb) => {
            emb
        }
        Err(e) => {
            println!("[query_similar_blocks] Error generating embedding: {}", e);
            return Ok(Response {
                status: StatusCode::InternalServerError,
                data: None,
                error: Some(format!("Failed to generate embedding: {}", e)),
            });
        }
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
        "match_count": limit,
        "p_user_id": user_id // Send as text instead of converting to i64
    });
        
    let response = client
        .post(&endpoint)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            println!("[query_similar_blocks] Error sending request to Supabase: {}", e);
            e.to_string()
        })?;
    
    println!("[query_similar_blocks] Supabase response status: {}", response.status());

    if response.status().is_success() {
        let response_text = response.text().await.map_err(|e| {
            println!("[query_similar_blocks] Error reading successful Supabase response text: {}", e);
            e.to_string()
        })?;
        println!("[query_similar_blocks] Supabase successful response text: {}", response_text);
        let json_response: Value = serde_json::from_str(&response_text).map_err(|e| {
            println!("[query_similar_blocks] Error parsing successful Supabase response to JSON: {}", e);
            e.to_string()
        })?;
        Ok(Response {
            status: StatusCode::Ok,
            data: Some(json_response),
            error: None,
        })
    } else {
        let error_text = response.text().await.map_err(|e| {
            println!("[query_similar_blocks] Error reading error Supabase response text: {}", e);
            e.to_string()
        })?;
        println!("[query_similar_blocks] Supabase error response text: {}", error_text);
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
    
    // Create messages array
    let mut messages = Vec::new();

    println!("[ask_llm] Received context: {:?}", context); // Debug print for incoming context
    
    // Construct the system message content
    let system_content = match context {
        Some(mut ctx_str) => { // context is fullContext from TypeScript, and it's not empty
            let base_instruction = "You are a helpful assistant for the note-taking app called ZeNote. Answer the user's question based on their notes and previous conversation. Be specific and reference information from their notes when relevant.";
            
            // Check if fullContext (ctx_str) already contains information about retrieved notes.
            // The string "Relevant notes:" is added in ChatInterface.tsx if notes are retrieved.
            if !ctx_str.contains("Relevant notes:") {
                // If "Relevant notes:" is not in ctx_str, it means retrievedContext was empty in TypeScript.
                // Append a message indicating no specific notes were found.
                // ctx_str might contain only chat history at this point.
                ctx_str = format!("{}\n\nRelevant notes: (No specific notes found for this query)", ctx_str);
            }
            // Now ctx_str includes chat history (if any) and note status (either content or "no notes found").
            format!("{}\n\nContext:\n{}", base_instruction, ctx_str)
        }
        None => { // context was None, meaning fullContext from TypeScript was empty (no chat history, no notes)
            "You are a helpful assistant for the note-taking app called ZeNote. Answer the user's question as clearly and concisely as possible. No chat history was provided. Relevant notes: (No specific notes found for this query).".to_string()
        }
    };

    println!("[ask_llm] Constructed system_content: {}", system_content); // Debug print for system content
    
    messages.push(json!({
        "role": "system",
        "content": system_content
    }));
    
    // Add the user query
    messages.push(json!({
        "role": "user",
        "content": query.clone() // Clone query for debug print later if needed, or just use query directly
    }));

    println!("[ask_llm] Final messages array: {:?}", messages); // Debug print for the messages array
    
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