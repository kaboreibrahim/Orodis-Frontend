// Les 8 types d'événements, dans l'ordre et avec les libellés du formulaire de devis.
import { Baby, Briefcase, Cake, Gem, Moon, Star, UtensilsCrossed, Wine, type LucideIcon } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { EVENT_TYPES } from "@/lib/schemas";

const DETAILS: Record<(typeof EVENT_TYPES)[number]["value"], { text: string; icon: LucideIcon }> = {
  mariage: { text: "Cocktail, dîner et pièce montée pour le plus beau jour.", icon: Gem },
  anniversaire: { text: "Gâteau maison, buffet ou dîner pour fêter en grand.", icon: Cake },
  bapteme: { text: "Un repas généreux pour accueillir le nouveau-né en famille.", icon: Baby },
  cocktail: { text: "Bouchées salées et sucrées, servies debout.", icon: Wine },
  seminaire: { text: "Pauses-café, déjeuners et buffets pour vos équipes.", icon: Briefcase },
  buffet: { text: "Grands plats africains et européens, chacun se sert.", icon: UtensilsCrossed },
  soiree_dinatoire: { text: "Un dîner léger et convivial, à partager.", icon: Moon },
  diner_gala: { text: "Menu servi à table, en plusieurs services.", icon: Star },
};

export function EventGrid() {
  return (
    <section aria-labelledby="evenements" className="mx-auto flex max-w-[1200px] flex-col gap-[26px] px-6 pt-6">
      <h2 id="evenements" className="text-[clamp(32px,3.8vw,50px)] leading-[1.04]">
        Pour <span className="text-bordeaux italic">chaque occasion.</span>
      </h2>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-3.5">
        {EVENT_TYPES.map(({ value, label }, i) => {
          const { text, icon: Icon } = DETAILS[value];
          return (
            <FadeUp as="li" key={value} delay={(i % 4) * 0.06} className="flex flex-col gap-2.5 rounded-[22px] border border-bordure bg-white p-[22px]">
              <span className="flex size-12 items-center justify-center rounded-[14px] bg-rose">
                <Icon size={26} strokeWidth={1.9} className="text-bordeaux" aria-hidden="true" />
              </span>
              <h3 className="text-[22px]">{label}</h3>
              <p className="text-[15px] text-texte-doux">{text}</p>
            </FadeUp>
          );
        })}
      </ul>
    </section>
  );
}
