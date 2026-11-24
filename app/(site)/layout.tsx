// Mise en page du site vitrine : en-tête, pied de page et données structurées du restaurant (JSON-LD).
// L'app de table (/t/…) et l'espace du personnel (/gestion) ont les leurs, sans JSON-LD.
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSettings } from "@/lib/api/settings";
import { summarizeHours } from "@/lib/format";
import { restaurantJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const contact = { phone: settings.phone, whatsapp: settings.whatsapp, hours: summarizeHours(settings.opening_hours) };
  return (
    <>
      <JsonLd items={[restaurantJsonLd(settings), websiteJsonLd()]} />
      <Header contact={contact} />
      {children}
      <Footer settings={settings} />
    </>
  );
}
