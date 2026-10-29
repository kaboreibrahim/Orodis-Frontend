// Schémas Zod réservation et devis, partagés par le formulaire et la Server Action (étapes 6 et 7).
// Les limites qui dépendent des réglages du restaurant (invités, couverts) sont passées en paramètre.
import { z } from "zod";
import type { components } from "./api/schema";
import { todayIso } from "./format";

type Schemas = components["schemas"];

/** Réservations ouvertes d'aujourd'hui à J+60, comme côté backend. */
export const BOOKING_WINDOW_DAYS = 60;

export const EVENT_TYPES = [
  { value: "mariage", label: "Mariage" },
  { value: "anniversaire", label: "Anniversaire" },
  { value: "bapteme", label: "Baptême" },
  { value: "cocktail", label: "Cocktail" },
  { value: "seminaire", label: "Séminaire" },
  { value: "buffet", label: "Buffet" },
  { value: "soiree_dinatoire", label: "Soirée dînatoire" },
  { value: "diner_gala", label: "Dîner de gala" },
] as const satisfies readonly { value: Schemas["EventTypeEnum"]; label: string }[];

export const PLACE_TYPES = [
  { value: "restaurant", label: "Au restaurant" },
  { value: "domicile", label: "Chez vous" },
  { value: "autre", label: "Autre lieu" },
] as const satisfies readonly { value: Schemas["PlaceTypeEnum"]; label: string }[];

/** Valeur du choix « Je ne sais pas encore » pour la formule. */
export const UNDECIDED_FORMULA = "indecis";

/** "07 07 07 07 07", "+225 0707070707", "002250707070707" → "+2250707070707" ; null si ce n'est pas un numéro ivoirien. */
export function normalizeCiPhone(raw: string): string | null {
  let digits = raw.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+225")) digits = digits.slice(4);
  else if (digits.startsWith("00225")) digits = digits.slice(5);
  else if (digits.startsWith("225") && digits.length === 13) digits = digits.slice(3);
  return /^\d{10}$/.test(digits) ? `+225${digits}` : null;
}

const phoneField = z
  .string()
  .trim()
  .min(1, "Indiquez votre numéro.")
  .refine((value) => normalizeCiPhone(value) !== null, "Numéro ivoirien à 10 chiffres attendu, ex. 07 07 07 07 07.");

const nameField = z.string().trim().min(2, "Indiquez votre nom.").max(100, "100 caractères au maximum.");

/** Champ piège caché : un robot le remplit, un visiteur ne le voit pas. La Server Action le vérifie. */
const honeypotField = z.string().optional();

/** Les valeurs à envoyer à l'API, sans le champ piège. */
export function withoutHoneypot<T extends { website?: string }>(values: T): Omit<T, "website"> {
  const copy = { ...values };
  delete copy.website;
  return copy;
}

const isoDate =(message: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message);

export function quoteSchema(minGuests = 1) {
  return z
    .object({
      event_type: z.enum(EVENT_TYPES.map((e) => e.value), { error: "Choisissez le type d’événement." }),
      event_date: isoDate("Indiquez la date de l’événement.").refine(
        (date) => date > todayIso(),
        "Choisissez une date à venir.",
      ),
      guests: z
        .number({ error: "Indiquez le nombre d’invités." })
        .int("Nombre entier attendu.")
        .min(minGuests, `Nos prestations traiteur commencent à partir de ${minGuests} invités.`)
        .max(5000, "Pour plus de 5 000 invités, écrivez-nous directement."),
      place_type: z.enum(PLACE_TYPES.map((p) => p.value), { error: "Choisissez le lieu." }),
      place_detail: z.string().trim().max(150, "150 caractères au maximum."),
      formula: z.string().min(1, "Choisissez une formule ou « Je ne sais pas encore »."),
      name: nameField,
      whatsapp: phoneField,
      email: z.union([z.literal(""), z.email("Adresse e-mail invalide.")]),
      message: z.string().trim().max(2000, "2 000 caractères au maximum."),
      website: honeypotField,
    })
    .refine((quote) => quote.place_type === "restaurant" || quote.place_detail.length > 0, {
      path: ["place_detail"],
      error: "Indiquez la commune, le quartier ou la salle.",
    });
}

export type QuoteValues = z.input<ReturnType<typeof quoteSchema>>;

export function reservationSchema(maxParty = 50) {
  return z.object({
    date: isoDate("Choisissez une date.").refine(
      (date) => date >= todayIso() && date <= todayIso(BOOKING_WINDOW_DAYS),
      `Choisissez une date entre aujourd’hui et les ${BOOKING_WINDOW_DAYS} prochains jours.`,
    ),
    party_size: z
      .number({ error: "Indiquez le nombre de personnes." })
      .int("Nombre entier attendu.")
      .min(1, "Indiquez au moins une personne.")
      .max(maxParty, `Au-delà de ${maxParty} personnes, faites une demande de devis traiteur.`),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Choisissez un créneau."),
    name: nameField,
    phone: phoneField,
    note: z.string().trim().max(500, "500 caractères au maximum."),
    website: honeypotField,
  });
}

export type ReservationValues = z.input<ReturnType<typeof reservationSchema>>;
