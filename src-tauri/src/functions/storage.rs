use reqwest::Client;
use serde::Deserialize;
use std::env;
use std::fs::{self, File};
use std::io::Read;
use std::path::Path;
use uuid::Uuid;

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
    delete_after_upload: bool, // New parameter to control file deletion
) -> Result<serde_json::Value, String> {
    let client = Client::new();

    // Check if file exists
    if !Path::new(file_path).exists() {
        return Err(format!("File not found: {}", file_path));
    }

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

    // Delete the temp file if requested and upload was successful
    if status.is_success() && delete_after_upload {
        // Attempt to delete the file, but don't fail the function if deletion fails
        if let Err(e) = fs::remove_file(file_path) {
            eprintln!("Warning: Failed to delete temp file {}: {}", file_path, e);
        }
    }

    if status.is_success() {
        Ok(serde_json::json!({
            "success": true,
            "response": text,
            "path": path,
            "url": format!("{}/storage/v1/object/public/{}/{}", supabase_url, bucket, path)
        }))
    } else {
        Err(format!("Upload failed: {}", text))
    }
}

#[tauri::command]
pub async fn save_temp_file(file_bytes: Vec<u8>) -> Result<String, String> {
    // Get temp directory
    let temp_dir = env::temp_dir();
    let file_name = format!("zenote_image_{}.png", Uuid::new_v4());
    let file_path = temp_dir.join(file_name);

    // Write bytes to temp file
    std::fs::write(&file_path, file_bytes).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().into_owned())
}
