// Photo d'un plat, ou visuel de remplacement (initiale sur fond rose) si le gérant n'en a pas mis.
// Le parent doit être positionné (relative) et dimensionné.
import Image from "next/image";
import type { Dish } from "@/lib/api/types";

type DishImageProps = {
  dish: Pick<Dish, "name" | "photo">;
  /** Largeur affichée, pour que next/image choisisse la bonne taille. */
  sizes: string;
  priority?: boolean;
  /** Taille de l'initiale du visuel de remplacement. */
  initialClassName?: string;
  /** Texte alternatif : le nom du plat quand la photo est le contenu principal (fiche) ;
   *  vide sur les cartes, où le nom est écrit juste à côté. */
  alt?: string;
};

export function DishImage({ dish, sizes, priority = false, initialClassName = "text-2xl", alt = "" }: DishImageProps) {
  if (dish.photo) {
    return <Image src={dish.photo} alt={alt} fill sizes={sizes} priority={priority} draggable={false} className="object-cover" />;
  }
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-0 flex items-center justify-center bg-rose font-display font-bold text-bordeaux italic ${initialClassName}`}
    >
      {dish.name.charAt(0)}
    </span>
  );
}
