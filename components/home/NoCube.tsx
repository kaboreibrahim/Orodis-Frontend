// « Cuisiné sans cube » : les plats sont préparés sans bouillon cube Maggi.
import { Leaf } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";

const POINTS = [
  { title: "Zéro cube Maggi", text: "Aucun bouillon cube dans nos sauces ni dans nos plats." },
  { title: "Le goût des ingrédients", text: "Oignon, ail, gingembre, piment : l’assaisonnement se fait à la main." },
  { title: "Comme à la maison", text: "Une cuisine plus légère en sel, préparée chaque jour sur place." },
];

export function NoCube() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-[72px]">
      <FadeUp className="relative grid gap-8 overflow-hidden rounded-[28px] bg-encre p-[30px] text-creme md:grid-cols-[1fr_1.3fr] md:p-12">
        <div className="flex flex-col gap-4">
          {/* Cube barré */}
          <span aria-hidden="true" className="relative flex size-[72px] items-center justify-center rounded-2xl bg-jaune">
            <span className="size-8 rounded-md border-[3px] border-encre" />
            <span className="absolute h-1 w-[84px] -rotate-45 rounded-full bg-bordeaux" />
          </span>
          <span className="text-[13px] font-bold tracking-[0.14em] text-jaune uppercase">Notre engagement</span>
          <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.02]">
            Cuisiné <span className="text-rose italic">sans cube.</span>
          </h2>
          <p className="max-w-[420px] text-texte-sur-encre">
            Tous nos plats sont préparés sans cube Maggi. Le goût vient des ingrédients, pas d’un bouillon en sachet.
          </p>
        </div>
        <ul className="flex flex-col gap-3 self-center">
          {POINTS.map((point) => (
            <li key={point.title} className="flex gap-4 rounded-[22px] bg-creme/8 p-5">
              <Leaf size={24} className="mt-0.5 shrink-0 text-jaune" aria-hidden="true" />
              <div>
                <h3 className="font-display text-xl font-bold">{point.title}</h3>
                <p className="mt-1 text-sm text-texte-sur-encre">{point.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <span
          aria-hidden="true"
          className="absolute -right-[60px] -bottom-[60px] size-[220px] rounded-full border-[18px] border-jaune/10"
        />
      </FadeUp>
    </section>
  );
}
