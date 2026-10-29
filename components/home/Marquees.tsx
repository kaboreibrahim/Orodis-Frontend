// Deux bandeaux croisés sous le héros : les moments de la journée (bordeaux) et les plats (encre, à l'envers).
import { Fragment } from "react";
import { Marquee } from "@/components/motion/Marquee";
import type { DishDetail } from "@/lib/api/types";

const MOMENTS = ["Petit-déjeuner", "Déjeuner", "Dîner", "Goûter", "Pâtisserie", "Traiteur", "Sur place ou à emporter"];

// Complète les plats mis en avant tant qu'il y en a peu.
const SPECIALITES = ["Kedjenou", "Garba", "Poulet braisé", "Attiéké poisson", "Sauce graine", "Alloco", "Burger maison", "Pizza", "Salade niçoise", "Croissants", "Éclairs"];

function dishNames(dishes: DishDetail[]): string[] {
  const names = dishes.map((dish) => dish.name);
  if (names.length >= 8) return names;
  const taken = (name: string) => names.some((n) => n.toLowerCase().startsWith(name.toLowerCase()));
  return [...names, ...SPECIALITES.filter((name) => !taken(name))];
}

function Track({ items, separator, separatorClassName = "" }: { items: string[]; separator: string; separatorClassName?: string }) {
  return (
    <span className="pr-7">
      {items.map((item) => (
        <Fragment key={item}>
          {item} <span className={separatorClassName}>{separator}</span>{" "}
        </Fragment>
      ))}
    </span>
  );
}

export function Marquees({ dishes }: { dishes: DishDetail[] }) {
  return (
    <section aria-label="Nos spécialités" className="relative -mt-2.5 h-[230px]">
      <div className="absolute top-[34px] -left-[5%] w-[110%] -rotate-3 bg-bordeaux py-[18px]">
        <Marquee duration={38} className="font-display text-[40px] font-bold tracking-[-0.01em] text-creme">
          <Track items={MOMENTS} separator="★" separatorClassName="text-jaune" />
        </Marquee>
      </div>
      <div className="absolute top-[118px] -left-[5%] w-[110%] rotate-2 bg-encre py-4">
        <Marquee duration={46} reverse className="text-[26px] font-bold text-creme">
          <Track items={dishNames(dishes)} separator="✦" />
        </Marquee>
      </div>
    </section>
  );
}
