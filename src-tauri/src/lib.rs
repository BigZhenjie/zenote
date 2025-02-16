mod supabase;
//auth
use crate::supabase::auth::check_if_email_exists;
use crate::supabase::auth::sign_up;
use crate::supabase::auth::sign_in;

//storage
use crate::supabase::storage::save_temp_file;
use crate::supabase::storage::upload_file;


//pages
use crate::supabase::pages::fetch_pages;
use crate::supabase::pages::fetch_page;
use crate::supabase::pages::update_page;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

//email authentication
#[tauri::command]
fn email_authenticate(email: &str, password: &str) -> String {
    format!("Email: {}, Password: {}", email, password)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            email_authenticate,
            sign_up,
            check_if_email_exists,
            save_temp_file,
            upload_file,
            sign_in,
            fetch_pages,
            fetch_page,
            update_page,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
