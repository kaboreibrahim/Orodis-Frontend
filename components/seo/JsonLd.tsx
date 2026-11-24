// Données structurées JSON-LD (schema.org) d'une page, rendues côté serveur.
import { jsonLdScript } from "@/lib/seo";

export function JsonLd({ items }: { items: object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(...items) }} />;
}
