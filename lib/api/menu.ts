// Lecture de la carte. Tag « menu » : vidé par /api/revalidate quand le gérant modifie la carte.
import "server-only";
import { api, ApiError } from "./client";
import type { Category, DishDetail } from "./types";

/** Carte complète : catégories → sous-catégories → plats disponibles. Les rubriques vides sont retirées. */
export async function getMenu(): Promise<Category[]> {
  const menu = await api<Category[]>("/menu/");
  return menu
    .map((category) => ({ ...category, subcategories: category.subcategories.filter((sub) => sub.dishes.length > 0) }))
    .filter((category) => category.subcategories.length > 0);
}

/** Plats mis en avant sur l'accueil. */
export function getFeaturedDishes(): Promise<DishDetail[]> {
  return api<DishDetail[]>("/menu/featured/");
}

/** Fiche d'un plat ; null s'il n'existe pas ou n'est plus disponible. */
export async function getDish(slug: string): Promise<DishDetail | null> {
  try {
    return await api<DishDetail>(`/menu/dishes/${encodeURIComponent(slug)}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Slugs de tous les plats, pour générer leurs fiches au build. */
export async function getDishSlugs(): Promise<string[]> {
  const menu = await getMenu();
  return menu.flatMap((category) =>
    category.subcategories.flatMap((sub) => sub.dishes.flatMap((dish) => (dish.slug ? [dish.slug] : []))),
  );
}
