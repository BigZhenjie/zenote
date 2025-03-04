use dotenv::dotenv;
use std::env::var;
use supabase_rs::SupabaseClient;

pub async fn initialize_supabase_client() -> SupabaseClient {
    dotenv().ok(); // Load the .env file

    let supabase_client: SupabaseClient = SupabaseClient::new(
        var("SUPABASE_URL").unwrap(),
        var("SUPABASE_API_KEY").unwrap(),
    )
    .unwrap();

    supabase_client
}
