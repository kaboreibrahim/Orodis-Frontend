// Espace du personnel des Délices d'Orodis sur ordinateur.
// La fenêtre ouvre www/index.html, qui vérifie la connexion puis charge /gestion du site en ligne.
// Tout le reste (pages, connexion, impression, PDF) est géré par le site et par WebView2 (Edge).
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("impossible de lancer Orodis Gestion");
}
