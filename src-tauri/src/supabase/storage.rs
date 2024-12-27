use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Serialize)]
struct UploadRequest {
    file: Vec<u8>,
}

#[derive(Deserialize)]
struct UploadResponse {
    key: String,
}

#[tauri::command]
pub async fn upload_file(
    bucket: &str,
    path: &str,
    file_path: &str,
    supabase_url: &str,
    supabase_key: &str,
) -> Result<serde_json::Value, String> {
    let client = Client::new();
    println!("Supabase URL: {}", supabase_url);
    println!("Bucket: {}", bucket);
    println!("Path: {}", path);
    println!("File Path: {}", file_path);

    // Read the file
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;

    // Determine content type (you might want to make this more robust)
    let content_type = mime_guess::from_path(file_path).first_or_octet_stream().to_string();

    // Make the request to upload the file
    let response = client
        .post(format!(
            "{}/storage/v1/object/{}/{}",
            supabase_url, bucket, path
        ))
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", content_type)
        .body(buffer)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status();
    let text = response.text().await.map_err(|e| e.to_string())?;
    println!("Response: {:?}", text);

    if status.is_success() {
        Ok(serde_json::json!({"success": true}))
    } else {
        Err(format!("Upload failed: {}", text))
    }
}


#[tauri::command]
pub async fn save_temp_file(file_bytes: Vec<u8>) -> Result<String, String> {
    // Get temp directory
    let temp_dir = env::temp_dir();
    let file_name = format!("avatar_{}.png", Uuid::new_v4());
    let file_path = temp_dir.join(file_name);

    // Write bytes to temp file
    std::fs::write(&file_path, file_bytes).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().into_owned())
}
