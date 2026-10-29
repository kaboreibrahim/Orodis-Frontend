// FAQ en accordéon accessible : <details> natifs (clavier et lecteurs d'écran sans JavaScript),
// regroupés par name pour n'en ouvrir qu'un à la fois. Réponses tirées des réglages quand c'est possible.
import { Plus } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import type { RestaurantSettings } from "@/lib/api/types";
import { formatPhone, summarizeHours } from "@/lib/format";

export function Faq({ settings }: { settings: RestaurantSettings }) {
  const hours = summarizeHours(settings.opening_hours).join(" · ") || "Tous les jours.";
  const contact = [
    settings.phone && `par téléphone au ${formatPhone(settings.phone)}`,
    settings.whatsapp && `sur WhatsApp au ${formatPhone(settings.whatsapp)}`,
  ]
    .filter(Boolean)
    .join(" ou ");

  const questions = [
    { q: "Quels sont vos horaires ?", a: `${hours}. Sur place ou à emporter.` },
    {
      q: "Comment commander ?",
      a: `Sur place, ${contact || "par téléphone ou sur WhatsApp"}. La commande à table par QR code arrive bientôt.`,
    },
    {
      q: "Livrez-vous à domicile ?",
      a: "Oui. Les zones et les frais de livraison vous sont précisés au moment de la commande.",
    },
    { q: "Quels moyens de paiement acceptez-vous ?", a: "Wave, Orange Money, MTN MoMo et espèces, sur place comme à la livraison." },
    {
      q: "Peut-on réserver une table ?",
      a: `Oui, en ligne en une minute : choisissez la date, le nombre de personnes et l’heure. Le restaurant vous confirme par WhatsApp. Au-delà de ${settings.reservation_max_party ?? 12} personnes, demandez un devis traiteur.`,
    },
    {
      q: "Faites-vous traiteur pour les grands événements ?",
      a: "Oui : mariages, anniversaires, cocktails, séminaires, buffets et dîners de gala. Demandez un devis gratuit depuis la page Traiteur.",
    },
  ];

  return (
    <section className="mx-auto flex max-w-[860px] flex-col gap-[26px] px-6 pt-[104px]">
      <FadeUp className="flex flex-col gap-2.5 text-center">
        <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">FAQ</span>
        <h2 className="text-[clamp(34px,4vw,54px)] leading-[1.02]">Questions fréquentes.</h2>
      </FadeUp>
      <div className="flex flex-col gap-2.5">
        {questions.map(({ q, a }, i) => (
          <details key={q} name="faq" open={i === 0} className="group overflow-hidden rounded-[20px] border border-bordure bg-white">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-[22px] py-4 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
              {q}
              <Plus
                size={24}
                aria-hidden="true"
                className="shrink-0 text-bordeaux transition-transform duration-300 group-open:rotate-45"
              />
            </summary>
            <p className="px-[22px] pb-5 text-texte-doux">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
