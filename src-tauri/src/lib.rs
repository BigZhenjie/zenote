mod functions;
mod supabase;

pub use supabase::update::update;
//auth
use crate::functions::auth::check_if_email_exists;
use crate::functions::auth::sign_up;
use crate::functions::auth::sign_in;

//storage
use crate::functions::storage::save_temp_file;
use crate::functions::storage::upload_file;

//pages
use crate::functions::pages::fetch_pages;
use crate::functions::pages::fetch_page;
use crate::functions::pages::update_page;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
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
