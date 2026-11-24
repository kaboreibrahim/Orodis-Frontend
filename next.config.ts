import type { NextConfig } from "next";

// Photos des plats servies par l'API : son domaine est autorisé pour next/image.
const apiUrl = new URL(process.env.API_URL ?? "https://api.delicesdorodis.com/api/v1");

// Partage du serveur de développement par un tunnel zrok (https://xxxx.share.zrok.io).
const TUNNEL_HOSTS = ["*.share.zrok.io"];
// Téléphone sur le même Wi-Fi que le PC (application Android d’essai : http://192.168.x.x:3000/gestion).
// Adresses privées seulement ; ne sert qu'à next dev.
const LOCAL_NETWORK = ["192.168.*.*", "10.*.*.*", "172.*.*.*"];

// Adresse publique du site : la version « www. » y est redirigée (301), pour une seule adresse dans Google.
const siteHost = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://delicesdorodis.com").host;

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // Titre, description, canonical et Open Graph toujours dans le <head> du HTML, pour tous les robots
  // (par défaut Next.js 15 les envoie après le contenu à Googlebot et aux navigateurs).
  htmlLimitedBots: /.*/,
  async redirects() {
    if (siteHost.startsWith("localhost") || siteHost.startsWith("www.")) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${siteHost}` }],
        destination: `https://${siteHost}/:path*`,
        statusCode: 301,
      },
    ];
  },
  // Sans cela, next dev bloque le rechargement à chaud et les fichiers /_next demandés depuis le tunnel.
  allowedDevOrigins: [...TUNNEL_HOSTS, ...LOCAL_NETWORK],
  // Les Server Actions (devis, réservation) refusent un domaine qui n'est pas celui du serveur.
  experimental: { serverActions: { allowedOrigins: TUNNEL_HOSTS } },
  // Racine fixée au projet : un package-lock.json plus haut sur le disque ne doit pas changer la sortie.
  outputFileTracingRoot: process.cwd(),
  // Service worker toujours relu (une nouvelle version s'installe au prochain chargement) ; manifeste au bon type.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      { source: "/personnel.webmanifest", headers: [{ key: "Content-Type", value: "application/manifest+json" }] },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        port: apiUrl.port,
      },
    ],
  },
};

export default nextConfig;
