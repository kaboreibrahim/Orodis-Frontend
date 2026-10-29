// Carte d'un plat dans le CouvertureFlow : photo (ou initiale), nom, prix, « Voir » sur la carte du centre.
import type { Dish } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { DishImage } from "./DishImage";

export function DishCard({ dish, isActive }: { dish: Dish; isActive: boolean }) {
  return (
    <>
      <span className="relative block h-[64%] overflow-hidden rounded-t-[18px]">
        <DishImage dish={dish} sizes="290px" initialClassName="text-[clamp(48px,6vw,84px)]" />
      </span>
      <span className="flex flex-col gap-1 px-4 py-3.5 text-left">
        <span className="line-clamp-2 font-display text-[clamp(17px,1.7vw,21px)] leading-[1.15] font-bold text-encre">
          {dish.name}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="font-bold text-bordeaux">{formatPrice(dish.price)}</span>
          {isActive && <span className="rounded-full bg-bordeaux px-3 py-1.5 text-[13px] font-bold text-creme">Voir</span>}
        </span>
      </span>
    </>
  );
}
