// Application Android de l'espace du personnel : une coquille qui ouvre /gestion du site en ligne.
// Tout le code (pages, Server Actions, relais vers DRF) reste sur le serveur Next.js : une mise en ligne
// du site met l'application à jour sans réinstaller l'APK.
// Adresse du site : variable ORODIS_URL au moment de `npx cap sync` (par défaut le site de production).
// Pour essayer sur le réseau local : ORODIS_URL=http://192.168.1.20:3000 npx cap sync android
import type { CapacitorConfig } from "@capacitor/cli";

const SITE = (process.env.ORODIS_URL ?? "https://delicesdorodis.ci").replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "ci.delicesdorodis.gestion",
  appName: "Orodis Gestion",
  webDir: "www",
  backgroundColor: "#241014",
  // Permet au site de reconnaître l'application (statistiques, messages adaptés).
  appendUserAgent: "OrodisGestion/1.0",
  server: {
    url: `${SITE}/gestion`,
    // Page embarquée affichée quand le site ne répond pas (pas de réseau, serveur arrêté).
    errorPath: "hors-ligne.html",
    // HTTP seulement pour les essais sur le réseau local ; la production est en HTTPS.
    cleartext: SITE.startsWith("http://"),
  },
  android: {
    // Inspection depuis chrome://inspect : seulement pour les essais en HTTP local.
    webContentsDebuggingEnabled: SITE.startsWith("http://"),
  },
  plugins: {
    SystemBars: { insetsHandling: "css" },
  },
};

export default config;
