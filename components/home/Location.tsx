// Nous trouver : adresse, horaires, téléphone et carte Google Maps (iframe chargée en lazy).
// Sans NEXT_PUBLIC_GOOGLE_MAPS_EMBED, un plan illustré renvoie vers la fiche Google Maps.
import { Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { FadeUp } from "@/components/motion/FadeUp";
import type { RestaurantSettings } from "@/lib/api/types";
import { formatPhone, summarizeHours } from "@/lib/format";
import { directionsLink, mapsLink, telLink } from "@/lib/whatsapp";

type LocationProps = {
  settings: RestaurantSettings;
  /** h1 sur la page /nous-trouver, h2 sur l'accueil. */
  headingLevel?: "h1" | "h2";
};

export function Location({ settings, headingLevel: Heading = "h2" }: LocationProps) {
  const hours = summarizeHours(settings.opening_hours);
  const embed = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED;
  const mapsUrl = mapsLink(settings);

  return (
    <section id="acces" className="mx-auto max-w-[1200px] px-6 pt-[104px]">
      <div className="flex flex-wrap items-stretch gap-7">
        <FadeUp className="flex min-w-0 flex-[1_1_340px] flex-col justify-center gap-[18px]">
          <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">Nous trouver</span>
          <Heading className="text-[clamp(34px,4vw,54px)] leading-[1.02]">
            Passez nous voir, <span className="text-bordeaux italic">midi et soir.</span>
          </Heading>
          <dl className="mt-1 flex flex-col gap-3.5">
            {settings.address && (
              <InfoRow icon={<MapPin size={24} />} label="Adresse">
                <span className="whitespace-pre-line">{settings.address}</span>
              </InfoRow>
            )}
            {hours.length > 0 && (
              <InfoRow icon={<Clock size={24} />} label="Horaires">
                {hours.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </InfoRow>
            )}
            {settings.phone && (
              <InfoRow icon={<Phone size={24} />} label="Téléphone">
                <a href={telLink(settings.phone)} className="hover:text-bordeaux">
                  {formatPhone(settings.phone)}
                </a>
              </InfoRow>
            )}
          </dl>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <a
              href={directionsLink(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-bordeaux px-[26px] py-[15px] font-bold text-creme transition-opacity hover:opacity-90"
            >
              Itinéraire
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-[1.5px] border-encre px-[26px] py-[15px] font-bold text-encre transition-colors hover:bg-sable"
            >
              Ouvrir dans Google Maps
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.1} className="relative min-h-[420px] min-w-0 flex-[1.4_1_460px] overflow-hidden rounded-[28px] border border-bordure bg-sable">
          {embed ? (
            <iframe
              src={embed}
              title={`Plan d’accès : ${settings.name ?? "Les Délices d’Orodis"}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          ) : (
            <MapPreview href={mapsUrl} name={settings.name} />
          )}
        </FadeUp>
      </div>
    </section>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-bordeaux">
        {icon}
      </span>
      <div>
        <dt className="font-bold">{label}</dt>
        <dd className="text-texte-doux">{children}</dd>
      </div>
    </div>
  );
}

/** Plan illustré de la maquette : routes, parcs, épingle du restaurant. */
function MapPreview({ href, name = "Les Délices d’Orodis" }: { href: string; name?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Voir ${name} sur Google Maps`} className="absolute inset-0 block">
      <span aria-hidden="true" className="absolute inset-0">
        <span className="absolute top-[38%] -right-[10%] -left-[10%] h-[26px] -rotate-[8deg] bg-white" />
        <span className="absolute top-[72%] -right-[10%] -left-[10%] h-4 rotate-[4deg] bg-white" />
        <span className="absolute -top-[10%] -bottom-[10%] left-[30%] w-[18px] rotate-[10deg] bg-white" />
        <span className="absolute -top-[10%] -bottom-[10%] left-[68%] w-3.5 -rotate-[6deg] bg-white" />
        <span className="absolute top-[8%] left-[6%] h-[22%] w-[18%] rounded-[14px] bg-whatsapp/20" />
        <span className="absolute top-[46%] left-[76%] h-[18%] w-[18%] rounded-[14px] bg-whatsapp/20" />
        <span className="absolute top-[6%] left-[40%] h-[24%] w-[22%] rounded-[14px] bg-bordure" />
        <span className="absolute top-[52%] left-[8%] h-[14%] w-[16%] rounded-[14px] bg-bordure" />
        <span className="absolute -right-[10%] -bottom-[8%] -left-[10%] h-[22%] -rotate-3 bg-wave/25" />
      </span>
      <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
        <span className="flex items-center gap-2.5 rounded-[18px] bg-white py-2 pr-3.5 pl-2 whitespace-nowrap shadow-carte">
          <Image src="/logo-delices-orodis-web.png" alt="" width={45} height={40} className="h-10 w-auto" />
          <span className="flex flex-col leading-tight">
            <strong className="text-[15px]">{name}</strong>
            <span className="text-xs font-bold text-whatsapp">Voir sur Google Maps</span>
          </span>
        </span>
        <svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true" className="mt-1.5">
          <path d="M17 43s15-13.6 15-25A15 15 0 0 0 2 18c0 11.4 15 25 15 25z" className="fill-bordeaux" />
          <circle cx="17" cy="17" r="6" className="fill-jaune" />
        </svg>
      </span>
    </a>
  );
}
