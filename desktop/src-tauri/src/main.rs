// Pas de fenêtre de console sous Windows en version finale.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    orodis_gestion_lib::run()
}
