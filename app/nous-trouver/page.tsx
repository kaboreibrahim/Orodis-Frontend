// Nous trouver : carte Google Maps, adresse, horaires jour par jour, téléphone, WhatsApp, e-mail.
import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Location } from "@/components/home/Location";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import { getSettings } from "@/lib/api/settings";
import { dailyHours, formatPhone } from "@/lib/format";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Nous trouver",
  description: "Adresse, plan d’accès, horaires et contacts du restaurant Les Délices d’Orodis.",
};

export default async function NousTrouverPage() {
  const settings = await getSettings();
  const days = dailyHours(settings.opening_hours);

  return (
    <main className="overflow-x-clip pb-24">
      <Location settings={settings} headingLevel="h1" />

      <section className="mx-auto mt-16 grid max-w-[1200px] gap-5 px-6 md:grid-cols-2">
        {days.length > 0 && (
          <div className="rounded-[26px] border border-bordure bg-white p-7">
            <h2 className="mb-4 text-[28px]">Horaires d’ouverture</h2>
            <dl className="divide-y divide-bordure">
              {days.map(({ day, label }) => (
                <div key={day} className="flex justify-between gap-4 py-2.5">
                  <dt className="font-bold">{day}</dt>
                  <dd className={label === "Fermé" ? "text-bordeaux" : "text-texte-doux"}>{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-[26px] bg-sable p-7">
          <h2 className="mb-1 text-[28px]">Nous contacter</h2>
          {settings.whatsapp && (
            <a href={whatsappLink(settings.whatsapp, "Bonjour Les Délices d’Orodis, ")} className="flex min-h-11 items-center gap-3 font-bold hover:text-bordeaux">
              <WhatsAppLogo size={28} /> WhatsApp {formatPhone(settings.whatsapp)}
            </a>
          )}
          {settings.phone && (
            <a href={telLink(settings.phone)} className="flex min-h-11 items-center gap-3 font-bold hover:text-bordeaux">
              <Phone size={24} className="text-bordeaux" aria-hidden="true" /> {formatPhone(settings.phone)}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="flex min-h-11 items-center gap-3 font-bold break-all hover:text-bordeaux">
              <Mail size={24} className="shrink-0 text-bordeaux" aria-hidden="true" /> {settings.email}
            </a>
          )}
          <p className="mt-2 text-texte-doux">Pour réserver une table, le plus simple reste la réservation en ligne : le restaurant vous confirme par WhatsApp.</p>
        </div>
      </section>
    </main>
  );
}
