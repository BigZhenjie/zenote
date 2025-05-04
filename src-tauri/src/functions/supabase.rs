use dotenv::dotenv;
use std::env::var;
use supabase_rs::SupabaseClient;

pub async fn initialize_supabase_client() -> SupabaseClient {
    dotenv().ok(); // Load the .env file

    let supabase_client: SupabaseClient = SupabaseClient::new(
        var("VITE_SUPABASE_URL").unwrap(),
        var("VITE_SUPABASE_API_KEY").unwrap(),
    )
    .unwrap();

    supabase_client
}
