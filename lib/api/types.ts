// Types de l'API, tirés de lib/api/schema.d.ts (généré : npm run api:types).
// Seul ajout : la forme des horaires, que le Swagger décrit comme un JSON libre.
import type { components } from "./schema";

type Schemas = components["schemas"];

export const DAY_KEYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

/** {"lun": [["11:00", "15:00"], ["18:00", "23:00"]]} ; jour absent ou liste vide = fermé. */
export type OpeningHours = Partial<Record<DayKey, [string, string][]>>;

export type RestaurantSettings = Omit<Schemas["PublicSettings"], "opening_hours"> & {
  opening_hours?: OpeningHours;
};

export type Category = Schemas["Category"];
export type SubCategory = Schemas["SubCategory"];
export type Dish = Schemas["Dish"];
export type DishDetail = Schemas["DishDetail"];
export type OptionGroup = Schemas["OptionGroup"];
export type Option = Schemas["Option"];

export type Formula = Schemas["PublicFormula"];
export type QuoteCreated = Schemas["QuoteCreated"];

export type Availability = Schemas["Availability"];
export type Slot = Schemas["Slot"];
export type ReservationPublic = Schemas["ReservationPublic"];
