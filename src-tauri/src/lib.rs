mod supabase;
//auth
use crate::supabase::auth::sign_up;
use crate::supabase::auth::check_if_email_exists;
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
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            email_authenticate,
            sign_up,
            check_if_email_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
