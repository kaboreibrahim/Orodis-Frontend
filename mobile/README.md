# Orodis Gestion · Android

Application Android de l'espace du personnel (Capacitor 8). Elle ouvre `/gestion` du site en ligne :
pages, connexion, Server Actions et relais vers l'API DRF restent sur le serveur Next.js.
**Une mise en ligne du site met l'application à jour** ; il ne faut recompiler l'APK que si ce dossier change.

## Ce que l'application ajoute au site

| Besoin | Où |
| --- | --- |
| Écran toujours allumé (cuisine, caisse) | `MainActivity.java` |
| Bouton retour : page précédente, puis arrière-plan sans fermer | `MainActivity.java` |
| Impression des tickets et chevalets (`window.OrodisAndroid.print`) | `MainActivity.java` + `components/staff/PrintButton.tsx` |
| Reçus PDF et planche de QR codes téléchargés avec la session | `MainActivity.java` |
| Son des nouvelles commandes sans toucher l'écran | réglage Capacitor par défaut |
| Page « Pas de connexion » avec nouvel essai automatique | `www/hors-ligne.html` |

## Obtenir l'APK

1. Une seule fois : créer les 4 secrets `ANDROID_*` sur GitHub (voir la notice de la clé de signature).
2. GitHub > **Actions** > **Applications du personnel** > **Run workflow**.
3. À la fin (environ 6 min), télécharger l'artefact `orodis-gestion-android` : il contient l'APK.

Pour une version officielle : `git tag app-v1.0.0 && git push origin app-v1.0.0`. Une « Release » GitHub est créée avec l'APK et l'installateur Windows.

## Installer sur un téléphone ou une tablette

1. Copier l'APK sur l'appareil (WhatsApp, câble, lien de la Release).
2. L'ouvrir, autoriser « Installer des applications inconnues » pour l'application qui l'ouvre.
3. Lancer **Orodis Gestion** et se connecter avec le compte du personnel.

Pour imprimer sur l'imprimante thermique, installer le service d'impression Android du fabricant (ou un service générique comme RawBT pour les imprimantes ESC/POS).

## Essayer avec le site sur votre ordinateur

```bash
cd mobile
npm install
ORODIS_URL=http://192.168.1.20:3000 npx cap sync android   # adresse IP de votre PC sur le Wi-Fi
npx cap open android                                         # Android Studio > Run
```

Remettre l'adresse de production avant de recompiler : `npx cap sync android` sans `ORODIS_URL`.

## Changer les icônes

Remplacer les images de `assets/` (1024 × 1024 ; écran de démarrage 2732 × 2732), puis `npm run icones`.
