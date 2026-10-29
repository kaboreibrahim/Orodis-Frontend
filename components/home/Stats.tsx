// Bandeau des chiffres, tirés des réglages et de la carte.
import { FadeUp } from "@/components/motion/FadeUp";
import type { OpeningHours } from "@/lib/api/types";
import { openDaysCount, summarizeHours } from "@/lib/format";

type StatsProps = {
  hours?: OpeningHours;
  dishCount: number;
};

export function Stats({ hours, dishCount }: StatsProps) {
  const allDay = summarizeHours(hours)[0] === "Ouvert 24h/24, 7j/7";
  const stats = [
    allDay
      ? { value: "24", unit: "h/24", label: "Ouvert tous les jours" }
      : { value: String(openDaysCount(hours)), unit: "j/7", label: "Jours d’ouverture" },
    { value: "2", label: "Cuisines : africaine et européenne" },
    { value: String(dishCount), label: "Plats et boissons à la carte" },
    { value: "4", label: "Moyens de paiement" },
  ];

  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-24">
      <FadeUp className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] border-y border-bordure">
        {stats.map((stat) => (
          <div key={stat.label} className="py-[30px] pr-6">
            <div className="font-display text-6xl leading-none font-bold text-bordeaux">
              {stat.value}
              {stat.unit && <span className="text-[30px]">{stat.unit}</span>}
            </div>
            <div className="mt-2 text-texte-doux">{stat.label}</div>
          </div>
        ))}
      </FadeUp>
    </section>
  );
}
