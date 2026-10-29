// Plan du site : pages publiques et fiche de chaque plat.
import type { MetadataRoute } from "next";
import { getDishSlugs } from "@/lib/api/menu";
import { siteUrl } from "@/lib/seo";

export const revalidate = 600;

const routes = ["", "/carte", "/reserver", "/traiteur", "/nous-trouver", "/mentions-legales"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getDishSlugs().catch(() => []);
  return [...routes.map((route) => `${siteUrl}${route}`), ...slugs.map((slug) => `${siteUrl}/carte/${slug}`)].map((url) => ({ url }));
}
