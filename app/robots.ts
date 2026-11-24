// robots.txt : tout le site public est explorable ; l'API, l'espace du personnel et l'app de table
// (adresses à jeton, jamais liées publiquement) ne le sont pas. Leurs pages restent aussi en noindex.
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/gestion", "/t/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
