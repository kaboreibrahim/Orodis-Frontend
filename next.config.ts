import type { NextConfig } from "next";

// Photos des plats servies par l'API : son domaine est autorisé pour next/image.
const apiUrl = new URL(process.env.API_URL ?? "https://api.delicesdorodis.ci/api/v1");

const nextConfig: NextConfig = {
  output: "standalone",
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
