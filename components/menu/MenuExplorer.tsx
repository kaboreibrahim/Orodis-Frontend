"use client";

// La carte interactive (page /carte, section #carte de l'accueil et app de table) :
// anneau des catégories, puis CouvertureFlow des sous-catégories et des plats, et la fiche rapide.
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, Dish } from "@/lib/api/types";
import { CategoryRing, dishCount, plural } from "./CategoryRing";
import { CoverFlow } from "./CoverFlow";
import { DishCard } from "./DishCard";
import { DishSheet } from "./DishSheet";

type MenuExplorerProps = {
  categories: Category[];
  whatsapp?: string;
  /** Mode commande (app de table) : toucher le plat du centre ouvre `${dishHrefBase}/<slug>` au lieu de la fiche rapide. */
  dishHrefBase?: string;
  /** App de table : mesures de la maquette phase3/Carte (390 px), tout tient sur un écran de téléphone. */
  compact?: boolean;
  /** Niveau du titre de la catégorie : h2 sur /carte (sous le h1), h3 dans une section de l'accueil. */
  headingLevel?: "h2" | "h3";
};

/** Le deuxième plat au centre : il reste une voisine de chaque côté. */
const firstItem = (dishes: Dish[]) => Math.min(1, dishes.length - 1);

export function MenuExplorer({ categories, whatsapp, dishHrefBase, compact = false, headingLevel: Heading = "h3" }: MenuExplorerProps) {
  const router = useRouter();
  const [cat, setCat] = useState(0);
  const [sub, setSub] = useState(0);
  const [item, setItem] = useState(() => firstItem(categories[0]?.subcategories[0]?.dishes ?? []));
  const [detail, setDetail] = useState<Dish | null>(null);

  if (categories.length === 0) {
    return <p className="py-16 text-center text-texte-doux">La carte est en cours de mise à jour. Revenez dans quelques instants.</p>;
  }

  const category = categories[cat];
  const subcategory = category.subcategories[sub];
  const dishes = subcategory.dishes;

  function pickCategory(index: number) {
    setCat(index);
    setSub(0);
    setItem(firstItem(categories[index].subcategories[0].dishes));
  }

  function pickSubcategory(index: number) {
    setSub(index);
    setItem(firstItem(category.subcategories[index].dishes));
  }

  return (
    <div
      className={`overflow-x-clip ${
        compact
          ? "[--cw:150px] [--ring-h:160px] [--ring-r:276px] [--ring-w:96px] [--sw:128px]"
          : "[--cw:clamp(190px,21vw,290px)] [--sw:clamp(150px,15vw,210px)]"
      }`}
    >
      <CategoryRing categories={categories} active={cat} onChange={pickCategory} compact={compact} />

      <div className={`mx-auto max-w-[1200px] px-5 ${compact ? "mt-0" : "mt-3"}`}>
        <Heading className={`text-center text-bordeaux ${compact ? "mb-2 text-xl" : "mb-3.5 text-[clamp(24px,2.6vw,34px)]"}`}>
          {category.name}
        </Heading>
        <CoverFlow
          key={`sub-${category.id}`}
          items={category.subcategories}
          active={sub}
          onChange={pickSubcategory}
          getKey={(s) => s.id}
          getLabel={(s) => `${s.name}, ${plural(s.dishes.length, "plat")}`}
          label="Sous-catégories : faites glisser ou utilisez les flèches pour parcourir"
          widthVar="--sw"
          height="calc(var(--sw) * 0.62 + 30px)"
          perspective={1100}
          unit={110}
          itemClassName={(on) =>
            `flex h-[calc(var(--sw)*0.62)] w-[var(--sw)] flex-col items-center justify-center gap-1 rounded-[18px] p-2.5 transition-[background-color,color,box-shadow] duration-300 ${
              on ? "bg-encre text-creme shadow-carte" : "border border-bordure bg-white text-encre shadow-pilule"
            }`
          }
          renderItem={(s) => (
            <>
              <span className="font-display text-[clamp(17px,1.7vw,22px)] leading-[1.1] font-bold">{s.name}</span>
              <span className="text-[13px] opacity-80">{plural(s.dishes.length, "plat")}</span>
            </>
          )}
        />
      </div>

      <div className="mx-auto mt-[18px] max-w-[1200px] px-5">
        <CoverFlow
          key={`dish-${subcategory.id}`}
          items={dishes}
          active={item}
          onChange={setItem}
          onActivate={(i) => (dishHrefBase ? router.push(`${dishHrefBase}/${dishes[i].slug}`) : setDetail(dishes[i]))}
          getKey={(d) => d.id}
          getLabel={(d, on) => `${d.name}${on ? ", voir le détail" : ""}`}
          label="Plats : faites glisser ou utilisez les flèches, Entrée pour voir le détail"
          widthVar="--cw"
          height="calc(var(--cw) * 1.4 + 30px)"
          perspective={1200}
          unit={140}
          dots
          itemClassName={(on) =>
            `flex h-[calc(var(--cw)*1.4)] w-[var(--cw)] flex-col overflow-hidden rounded-[20px] bg-white transition-shadow duration-300 ${
              on ? "shadow-telephone" : "shadow-carte"
            }`
          }
          renderItem={(d, on) => <DishCard dish={d} isActive={on} />}
        />
        <p className={`text-center text-sm text-texte-doux ${compact ? "mt-2" : "mt-3.5"}`}>
          {compact
            ? "Faites glisser du doigt pour parcourir"
            : "Faites glisser du doigt pour parcourir, touchez le plat du centre pour le voir en détail."}
          <span className="sr-only"> {plural(dishCount(category), "plat")} dans cette catégorie.</span>
        </p>
      </div>

      {!dishHrefBase && (
        <DishSheet dish={detail} path={`${category.name} · ${subcategory.name}`} whatsapp={whatsapp} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
