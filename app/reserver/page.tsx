// Réservation en 3 étapes : page statique, créneaux lus en direct par le ReservationWizard.
// ?party=&date= (envoyés par le bloc réservation de l'accueil) sont lus dans le navigateur, sous <Suspense>.
import { Clock, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FadeUp } from "@/components/motion/FadeUp";
import { RiseText } from "@/components/motion/RiseText";
import { ReservationWizard, ReservationWizardFromUrl } from "@/components/reservation/ReservationWizard";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import { getSettings } from "@/lib/api/settings";
import { formatPhone, summarizeHours } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Réserver une table",
  description: "Réservez votre table en une minute aux Délices d’Orodis : choisissez la date, l’heure et le nombre de personnes, le restaurant vous confirme par WhatsApp.",
};

export default async function ReserverPage() {
  const settings = await getSettings();
  const maxParty = settings.reservation_max_party ?? 12;
  const wizard = {
    maxParty,
    hours: settings.opening_hours,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
  };

  return (
    <main className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-x-14 gap-y-8 px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
      <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5 px-2 sm:px-0 nav:sticky nav:top-[120px]">
        <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">Réservation</span>
        <RiseText
          as="h1"
          className="text-[clamp(38px,4.6vw,62px)] leading-[1.02]"
          lines={[
            "Réserver",
            <span key="fort" className="text-bordeaux italic">
              une table.
            </span>,
          ]}
        />
        <FadeUp immediate delay={0.2} as="p" className="max-w-[440px] text-[17px] text-texte-doux">
          Choisissez la date, le nombre de personnes et l’heure. Le restaurant vous confirme votre table par WhatsApp.
        </FadeUp>
        <FadeUp immediate delay={0.3} className="hidden flex-col gap-3 text-[15px] nav:flex">
          {summarizeHours(settings.opening_hours).map((line) => (
            <p key={line} className="flex items-center gap-2.5">
              <Clock size={18} className="shrink-0 text-bordeaux" aria-hidden="true" />
              {line}
            </p>
          ))}
          <p className="flex items-center gap-2.5">
            <Users size={18} className="shrink-0 text-bordeaux" aria-hidden="true" />
            <span>
              Plus de {maxParty} personnes ?{" "}
              <Link href="/traiteur#devis" className="font-bold text-bordeaux underline underline-offset-4">
                Demandez un devis traiteur
              </Link>
            </span>
          </p>
          {settings.whatsapp && (
            <a
              href={whatsappLink(settings.whatsapp, "Bonjour, je souhaite réserver une table.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2.5 font-bold hover:text-bordeaux"
            >
              <WhatsAppLogo size={22} /> Une question ? WhatsApp {formatPhone(settings.whatsapp)}
            </a>
          )}
        </FadeUp>
      </div>

      <div className="w-full min-w-0 flex-[1_1_480px] nav:max-w-[600px]">
        <Suspense fallback={<ReservationWizard {...wizard} />}>
          <ReservationWizardFromUrl {...wizard} />
        </Suspense>
      </div>
    </main>
  );
}
