// Mise en page du site vitrine : en-tête et pied de page. L'app de table (/t/…) a la sienne.
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSettings } from "@/lib/api/settings";
import { summarizeHours } from "@/lib/format";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const contact = { phone: settings.phone, whatsapp: settings.whatsapp, hours: summarizeHours(settings.opening_hours) };
  return (
    <>
      <Header contact={contact} />
      {children}
      <Footer settings={settings} />
    </>
  );
}
