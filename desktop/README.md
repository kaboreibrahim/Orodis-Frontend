# Orodis Gestion · Windows

Application Windows de l'espace du personnel (Tauri 2, moteur Edge WebView2). Au démarrage, elle vérifie
que le site répond puis ouvre `/gestion` ; sinon elle affiche « Pas de connexion » et réessaie seule.
**Une mise en ligne du site met l'application à jour** ; il ne faut recompiler que si ce dossier change.

- Impression des tickets : la fenêtre d'impression de Windows (comme dans Edge).
- Reçus PDF : ouverts par le lecteur PDF intégré.
- Son des nouvelles commandes : joué sans clic préalable (`--autoplay-policy` dans `tauri.conf.json`).
- Aucune commande native n'est exposée au site (`capabilities/default.json`).

## Obtenir l'installateur

GitHub > **Actions** > **Applications du personnel** > **Run workflow**, puis télécharger l'artefact
`orodis-gestion-windows` (fichier `Orodis Gestion_x.y.z_x64-setup.exe`). Environ 10 min la première fois.

Windows SmartScreen peut afficher « Windows a protégé votre ordinateur » : l'installateur n'est pas signé
par un certificat de code payant. Cliquer **Informations complémentaires** > **Exécuter quand même**.

## Compiler sur votre PC (facultatif)

Prérequis : [Rust](https://rustup.rs) et les « Outils de génération C++ » de Visual Studio.

```bash
cd desktop
npm install
npm run dev     # essai
npm run build   # installateur dans src-tauri/target/release/bundle/nsis/
```

Adresse du site : `www/config.js`. Icônes : remplacer `assets/icone.png` puis `npm run icones`.
