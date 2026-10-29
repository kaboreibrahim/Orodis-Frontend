import type { NextConfig } from "next";

// Photos des plats servies par l'API : son domaine est autorisé pour next/image.
const apiUrl = new URL(process.env.API_URL ?? "https://api.delicesdorodis.ci/api/v1");

// Partage du serveur de développement par un tunnel zrok (https://xxxx.share.zrok.io).
const TUNNEL_HOSTS = ["*.share.zrok.io"];

const nextConfig: NextConfig = {
  output: "standalone",
  // Sans cela, next dev bloque le rechargement à chaud et les fichiers /_next demandés depuis le tunnel.
  allowedDevOrigins: TUNNEL_HOSTS,
  // Les Server Actions (devis, réservation) refusent un domaine qui n'est pas celui du serveur.
  experimental: { serverActions: { allowedOrigins: TUNNEL_HOSTS } },
  // Racine fixée au projet : un package-lock.json plus haut sur le disque ne doit pas changer la sortie.
  outputFileTracingRoot: process.cwd(),
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
