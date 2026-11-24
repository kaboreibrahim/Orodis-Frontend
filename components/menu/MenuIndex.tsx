// Toute la carte en liste, sous la carte interactive de /carte : un lien vers la fiche de chaque plat.
// Rendu côté serveur, pour que les moteurs de recherche trouvent chaque fiche et lisent noms et prix
// (la carte interactive ouvre les plats en JavaScript). Fermé par défaut, le contenu reste indexé.
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";

export function MenuIndex({ menu }: { menu: Category[] }) {
  if (menu.length === 0) return null;
  return (
    <section aria-labelledby="carte-liste" className="mx-auto mt-14 max-w-[1100px] px-5">
      <h2 id="carte-liste" className="sr-only">
        Toute la carte en liste
      </h2>
      <details className="group rounded-[24px] border border-bordure bg-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-center gap-2 px-6 font-bold text-bordeaux [&::-webkit-details-marker]:hidden">
          Voir toute la carte en liste
          <ChevronDown size={18} aria-hidden="true" className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-x-10 gap-y-8 border-t border-bordure px-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((category) => (
            <div key={category.id} className="flex flex-col gap-4">
              <h3 className="text-[24px] text-bordeaux">{category.name}</h3>
              {category.subcategories.map((sub) => (
                <div key={sub.id} className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-bold tracking-[0.12em] text-texte-doux uppercase">{sub.name}</h4>
                  <ul className="flex flex-col">
                    {sub.dishes.map((dish) => (
                      <li key={dish.id}>
                        <Link
                          href={`/carte/${dish.slug}`}
                          className="flex min-h-11 items-baseline justify-between gap-3 py-1.5 hover:text-bordeaux"
                        >
                          <span className="font-medium">{dish.name}</span>
                          <span className="shrink-0 font-bold text-bordeaux">{formatPrice(dish.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
