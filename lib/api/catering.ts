// Formules traiteur, affichées sur /traiteur et proposées dans le formulaire de devis.
import "server-only";
import { api } from "./client";
import type { Formula } from "./types";

/** Lues au plus toutes les 10 minutes ; Django vide le tag « catering » quand le gérant les modifie. */
export function getFormulas(): Promise<Formula[]> {
  return api<Formula[]>("/catering/formulas/", { revalidate: 600, tags: ["catering"] });
}
