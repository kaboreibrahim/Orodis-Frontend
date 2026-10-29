// Traiteur : héros, 8 types d'événements, formules lues dans l'API, déroulé en 4 étapes et formulaire de devis (#devis).
import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EventGrid } from "@/components/catering/EventGrid";
import { FormulaChoiceProvider } from "@/components/catering/FormulaChoice";
import { Formulas } from "@/components/catering/Formulas";
import { QuoteForm } from "@/components/catering/QuoteForm";
import { DishImage } from "@/components/menu/DishImage";
import { FadeUp } from "@/components/motion/FadeUp";
import { RiseText } from "@/components/motion/RiseText";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import { getFormulas } from "@/lib/api/catering";
import { getFeaturedDishes } from "@/lib/api/menu";
import { getSettings } from "@/lib/api/settings";
import { formatPhone } from "@/lib/format";
import { EVENT_TYPES } from "@/lib/schemas";
import { telLink, whatsappLink } from "@/lib/whatsapp";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Traiteur et événements",
  description:
    "Mariages, anniversaires, baptêmes, séminaires, cocktails et dîners de gala : Les Délices d’Orodis prépare, livre et sert. Demandez un devis gratuit.",
};

const STEPS = [
  { title: "Votre demande", text: "Date, nombre d’invités, lieu et envies, via le formulaire ou WhatsApp." },
  { title: "Votre devis", text: "Un devis détaillé, ajusté avec vous si besoin." },
  { title: "La validation", text: "Vous validez le menu définitif et nous réservons la date." },
  { title: "Le jour J", text: "Nous préparons, livrons et servons. Vous profitez de vos invités." },
];

export default async function TraiteurPage() {
  const [settings, formulas, featured] = await Promise.all([
    getSettings(),
    getFormulas().catch(() => []),
    getFeaturedDishes().catch(() => []),
  ]);
  const minGuests = settings.catering_min_guests ?? 1;
  const photo = featured.find((dish) => dish.photo) ?? featured[0];
  const whatsappHref = whatsappLink(settings.whatsapp, "Bonjour, je souhaite un devis traiteur pour un événement.");

  return (
    <main className="overflow-x-clip pb-24">
      {/* Héros */}
      <section className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-12 gap-y-10 px-6 pt-12 pb-16">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-[22px]">
          <FadeUp immediate as="span" className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">
            Traiteur & événements
          </FadeUp>
          <RiseText
            as="h1"
            delay={0.05}
            className="text-[clamp(38px,4.6vw,66px)] leading-none tracking-[-0.025em]"
            lineClassName="pb-[0.12em] -mb-[0.08em]"
            lines={[
              "Vos grands moments,",
              <span key="fort" className="text-bordeaux italic">
                notre <span className="whitespace-nowrap">savoir-faire.</span>
              </span>,
            ]}
          />
          <FadeUp immediate delay={0.3} as="p" className="max-w-[520px] text-[clamp(17px,1.4vw,19px)] text-texte-doux">
            Du cocktail entre collègues au dîner de gala, Les Délices d’Orodis prépare, livre et sert : spécialités
            africaines et européennes, pâtisserie maison, service compris.
          </FadeUp>
          <FadeUp immediate delay={0.4} className="flex flex-wrap gap-3">
            <Link href="#devis" className={buttonClass("primary", "lg")}>
              Demander un devis
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("outline", "lg", "border-encre")}
            >
              <WhatsAppLogo size={24} />
              Écrire sur WhatsApp
            </a>
          </FadeUp>
        </div>

        <FadeUp immediate delay={0.25} className="grid min-w-0 flex-[1_1_420px] grid-cols-2 gap-3">
          <div className="relative row-span-2 min-h-[320px] overflow-hidden rounded-3xl bg-rose sm:min-h-[400px]">
            {photo && <DishImage dish={photo} sizes="(min-width: 1024px) 260px, 50vw" priority initialClassName="text-7xl" />}
            <span className="absolute bottom-3 left-3 rounded-full bg-encre/60 px-2.5 py-1 text-[11px] font-bold text-white">
              Photo d’illustration
            </span>
          </div>
          <div className="flex min-h-[154px] flex-col justify-end rounded-3xl bg-sable p-4 sm:min-h-[194px]">
            <span className="text-sm text-texte-doux">À partir de</span>
            <span className="mt-1 font-display text-[40px] leading-none font-bold text-bordeaux">{minGuests}</span>
            <span className="mt-1.5 text-sm text-texte-doux">invités</span>
          </div>
          <div className="flex min-h-[154px] flex-col justify-end rounded-3xl bg-encre p-4 text-creme sm:min-h-[194px]">
            <span className="font-display text-[40px] leading-none font-bold text-jaune">{EVENT_TYPES.length}</span>
            <span className="mt-1.5 text-sm text-texte-sur-encre">types d’événements</span>
          </div>
        </FadeUp>
      </section>

      <EventGrid />

      <FormulaChoiceProvider>
        {formulas.length > 0 && <Formulas formulas={formulas} minGuests={minGuests} />}

        {/* Déroulé */}
        <section aria-labelledby="deroule" className="mx-auto flex max-w-[1200px] flex-col gap-[26px] px-6 pt-24">
          <h2 id="deroule" className="text-[clamp(32px,3.8vw,50px)] leading-[1.04]">
            Comment <span className="text-bordeaux italic">ça se passe.</span>
          </h2>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,230px),1fr))] gap-3.5">
            {STEPS.map((step, i) => {
              const last = i === STEPS.length - 1;
              return (
                <FadeUp
                  as="li"
                  key={step.title}
                  delay={i * 0.08}
                  className={`flex flex-col gap-2 rounded-[22px] p-[22px] ${last ? "bg-encre text-creme" : "bg-sable"}`}
                >
                  <span aria-hidden="true" className={`font-display text-[40px] leading-none font-bold ${last ? "text-jaune" : "text-bordeaux"}`}>
                    {i + 1}
                  </span>
                  <strong className="text-lg">{step.title}</strong>
                  <span className={`text-[15px] ${last ? "text-texte-sur-encre" : "text-texte-doux"}`}>{step.text}</span>
                </FadeUp>
              );
            })}
          </ol>
        </section>

        {/* Formulaire de devis */}
        <section id="devis" aria-labelledby="devis-titre" className="mx-auto max-w-[1200px] px-4 pt-24 sm:px-6">
          <div className="flex flex-wrap items-start gap-9 rounded-[36px] bg-bordeaux p-[clamp(20px,4vw,56px)]">
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 text-creme">
              <span className="text-[13px] font-bold tracking-[0.14em] text-jaune uppercase">Demande de devis</span>
              <h2 id="devis-titre" className="text-[clamp(32px,3.8vw,48px)] leading-[1.04]">
                Parlez-nous de <span className="text-jaune italic">votre événement.</span>
              </h2>
              <p className="text-creme/85">Gratuit et sans engagement. Plus votre demande est précise, plus le devis le sera.</p>
              <div className="mt-2 flex flex-col gap-1 text-[15px]">
                {settings.phone && (
                  <a href={telLink(settings.phone)} className="flex min-h-11 items-center gap-2.5 hover:underline">
                    <Phone size={18} aria-hidden="true" /> {formatPhone(settings.phone)}
                  </a>
                )}
                {settings.whatsapp && (
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2.5 hover:underline">
                    <WhatsAppLogo size={20} /> WhatsApp {formatPhone(settings.whatsapp)}
                  </a>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} className="flex min-h-11 items-center gap-2.5 break-all hover:underline">
                    <Mail size={18} className="shrink-0" aria-hidden="true" /> {settings.email}
                  </a>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-[1.6_1_440px] rounded-[26px] bg-white p-5 text-encre sm:p-[26px]">
              <QuoteForm formulas={formulas} minGuests={minGuests} whatsapp={settings.whatsapp} />
            </div>
          </div>
        </section>
      </FormulaChoiceProvider>
    </main>
  );
}
