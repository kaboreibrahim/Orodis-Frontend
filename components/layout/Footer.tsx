// Pied de page : coordonnées, adresse et horaires lus dans /settings/.
import Image from "next/image";
import Link from "next/link";
import type { RestaurantSettings } from "@/lib/api/types";
import { formatPhone, summarizeHours } from "@/lib/format";
import { telLink, whatsappLink } from "@/lib/whatsapp";

const SITE_LINKS = [
  { href: "/carte", label: "La carte" },
  { href: "/reserver", label: "Réserver" },
  { href: "/traiteur", label: "Traiteur" },
  { href: "/nous-trouver", label: "Nous trouver" },
];

function ColumnTitle({ children }: { children: string }) {
  return <h2 className="mb-1 font-sans text-[13px] font-bold tracking-[0.14em] text-jaune uppercase">{children}</h2>;
}

const linkClass = "py-1 text-creme transition-colors hover:text-jaune focus-visible:outline-jaune";

export function Footer({ settings }: { settings: RestaurantSettings }) {
  const { phone, whatsapp, email, address, maps_url: mapsUrl } = settings;
  const hours = summarizeHours(settings.opening_hours);

  return (
    <footer id="contact" className="bg-encre text-creme">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pt-[72px] pb-8">
        <div className="flex flex-wrap justify-between gap-x-14 gap-y-10">
          <div className="flex max-w-[340px] flex-[1_1_280px] flex-col gap-4">
            <Image
              src="/logo-delices-orodis-blanc-web.png"
              alt="Les Délices d’Orodis, restaurant"
              width={190}
              height={168}
              className="h-auto w-[190px]"
            />
            <p className="text-texte-sur-encre">
              Pâtisserie · Restauration · Service. Spécialités africaines et européennes, traiteur pour tous vos
              événements.
            </p>
          </div>

          <div className="flex flex-[1_1_220px] flex-col gap-3">
            <ColumnTitle>Contact</ColumnTitle>
            {phone && (
              <a href={telLink(phone)} className={linkClass}>
                Tél. {formatPhone(phone)}
              </a>
            )}
            {whatsapp && (
              <a href={whatsappLink(whatsapp)} className={linkClass}>
                WhatsApp {formatPhone(whatsapp)}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className={`${linkClass} break-all`}>
                {email}
              </a>
            )}
          </div>

          <div className="flex flex-[1_1_200px] flex-col gap-3">
            <ColumnTitle>Adresse & horaires</ColumnTitle>
            {address && <span className="whitespace-pre-line text-texte-sur-encre">{address}</span>}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} underline underline-offset-4`}>
                Voir sur Google Maps
              </a>
            )}
            {hours.map((line) => (
              <span key={line} className="text-texte-sur-encre">
                {line}
              </span>
            ))}
          </div>

          <nav aria-label="Pied de page" className="flex flex-[1_1_160px] flex-col gap-3">
            <ColumnTitle>Le site</ColumnTitle>
            {SITE_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap justify-between gap-2.5 border-t border-bordure-encre pt-6 text-sm text-texte-sur-encre-pale">
          <span>© {new Date().getFullYear()} Les Délices d’Orodis · Côte d’Ivoire</span>
          <Link href="/mentions-legales" className="transition-colors hover:text-jaune focus-visible:outline-jaune">
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
