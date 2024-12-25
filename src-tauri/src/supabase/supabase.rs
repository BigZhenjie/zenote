use dotenv::dotenv;
use std::env::var;
use supabase_rs::SupabaseClient;
use supabase_storage_rs::models::StorageClient;

pub async fn initialize_supabase_client() -> SupabaseClient {
    dotenv().ok(); // Load the .env file

    let supabase_client: SupabaseClient = SupabaseClient::new(
        var("SUPABASE_URL").unwrap(),
        var("SUPABASE_API_KEY").unwrap(),
    )
    .unwrap();

    supabase_client
}

pub async fn initialize_storage_client() -> StorageClient {
    dotenv().ok();
    let storage_client = StorageClient::new_from_env().await.unwrap();
    storage_client
}

