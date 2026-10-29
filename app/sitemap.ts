// Plan du site : pages publiques (étape 8 : ajouter chaque plat).
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const routes = ["", "/carte", "/reserver", "/traiteur", "/nous-trouver", "/mentions-legales"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `${siteUrl}${route}` }));
}
