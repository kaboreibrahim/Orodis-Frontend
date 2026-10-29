// Aperçu traiteur de l'accueil : types d'événements et accès au devis.
import { GlassWater, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import { whatsappLink } from "@/lib/whatsapp";

export const EVENTS = ["Mariage", "Anniversaire", "Cocktail", "Séminaire", "Baptême", "Buffet", "Soirée dînatoire", "Dîner de gala"];

export function CateringTeaser({ whatsapp }: { whatsapp?: string }) {
  return (
    <section id="traiteur" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pt-[104px]">
      <FadeUp className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
        <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">Traiteur & événements</span>
        <h2 className="text-[clamp(36px,4.4vw,60px)] leading-[1.02]">
          Vos grands moments, <span className="text-bordeaux italic">notre savoir-faire.</span>
        </h2>
        <p className="max-w-[520px] text-lg text-texte-doux">
          Du cocktail au dîner de gala, Orodis prépare, livre et sert. Dites-nous la date, le nombre
          d’invités et vos envies : on vous envoie un devis.
        </p>
        <ul className="flex flex-wrap gap-2.5">
          {EVENTS.map((event) => (
            <li key={event} className="rounded-full border border-bordure bg-white px-4 py-2.5 text-[15px] font-bold">
              {event}
            </li>
          ))}
        </ul>
        <div className="mt-1.5 flex flex-wrap gap-3">
          <Link
            href="/traiteur#devis"
            className="rounded-full bg-bordeaux px-7 py-4 text-[17px] font-bold text-creme transition-opacity hover:opacity-90"
          >
            Demander un devis
          </Link>
          <a
            href={whatsappLink(whatsapp, "Bonjour, je souhaite un devis traiteur pour un événement.")}
            className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-encre px-6 py-3.5 text-[17px] font-bold text-encre transition-colors hover:bg-sable"
          >
            <WhatsAppLogo size={26} />
            Écrire sur WhatsApp
          </a>
        </div>
      </FadeUp>

      <FadeUp delay={0.1} className="grid min-w-0 flex-[1_1_440px] grid-cols-2 gap-3.5" >
        <div aria-hidden="true" className="row-span-2 flex min-h-[420px] flex-col justify-between rounded-3xl bg-rose p-5">
          <UtensilsCrossed size={44} className="text-bordeaux" strokeWidth={1.6} />
          <span className="font-display text-2xl leading-tight font-bold text-bordeaux">Buffets africains et européens</span>
        </div>
        <div aria-hidden="true" className="flex min-h-[203px] flex-col justify-between rounded-3xl bg-sable p-5">
          <GlassWater size={36} className="text-bordeaux" strokeWidth={1.6} />
          <span className="font-display text-xl leading-tight font-bold">Cocktails et pièces montées</span>
        </div>
        <Link href="/traiteur" className="flex min-h-[203px] flex-col justify-end rounded-3xl bg-encre p-5 text-creme">
          <span className="font-display text-[40px] leading-none font-bold text-jaune">{EVENTS.length}</span>
          <span className="mt-1.5 text-sm text-texte-sur-encre">types d’événements · voir nos formules</span>
        </Link>
      </FadeUp>
    </section>
  );
}
