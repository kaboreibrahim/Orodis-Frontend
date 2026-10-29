// Réglages du restaurant : coordonnées et horaires (en-tête, pied de page, Nous trouver).
import "server-only";
import { api } from "./client";
import type { RestaurantSettings } from "./types";

/** Lu au plus toutes les 10 minutes ; si l'API tombe pendant une régénération, Next.js garde la page précédente.
 *  Django vide le tag « settings » quand le gérant modifie les réglages. */
export function getSettings(): Promise<RestaurantSettings> {
  return api<RestaurantSettings>("/settings/", { revalidate: 600, tags: ["settings"] });
}
