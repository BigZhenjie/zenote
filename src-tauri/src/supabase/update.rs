use reqwest::Client;
use serde_json::Value;

pub async fn update(
    supabase_url: &str,
    supabase_key: &str,
    table_name: &str,
    column_name: &str,
    value: &str,
    body_to_update: Value,
) -> Result<String, String> {
    // Construct the endpoint URL
    let endpoint = format!(
        "{}/rest/v1/{}?{}=eq.{}",
        supabase_url, table_name, column_name, value
    );

    // Create an HTTP client
    let client = Client::new();

    // Send the PUT request
    let response = client
        .put(&endpoint)
        .header("apikey", supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .json(&body_to_update)
        .send()
        .await;

    // Handle the response
    match response {
        Ok(resp) => {
            if resp.status().is_success() {
                Ok(value.to_string())
            } else {
                let error_body = resp.text().await.unwrap_or_default();
                Err(format!("Error {}: {}", resp.status(), error_body))
            }
        }
        Err(err) => Err(err.to_string()),
    }
}

