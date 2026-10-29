// Mise en forme française : prix en francs CFA et dates.
// Formatage fait à la main pour les prix : le résultat est identique côté serveur et navigateur.
import { DAY_KEYS, type DayKey, type OpeningHours } from "./api/types";

const NBSP = " ";
const TIME_ZONE = "Africa/Abidjan";

/** 4500 → "4 500 F" (espaces insécables). */
export function formatPrice(amount: number | string): string {
  const value = Math.round(Number(amount));
  if (!Number.isFinite(value)) return "";
  const digits = Math.abs(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${value < 0 ? "-" : ""}${digits}${NBSP}F`;
}

/** Accepte une Date ou une chaîne ISO ; "2026-10-29" est lu comme ce jour-là à Abidjan (UTC+0). */
function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
}

function format(value: Date | string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("fr-FR", { timeZone: TIME_ZONE, ...options }).format(toDate(value));
}

/** "jeudi 29 octobre 2026" */
export function formatDate(value: Date | string): string {
  return format(value, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** "jeu. 29 oct." */
export function formatShortDate(value: Date | string): string {
  return format(value, { weekday: "short", day: "numeric", month: "short" });
}

/** "20:30" ; accepte aussi une heure seule "20:30:00" renvoyée par l'API. */
export function formatTime(value: Date | string): string {
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return format(value, { hour: "2-digit", minute: "2-digit" });
}

/** Met la première lettre en majuscule : "jeudi 29 octobre" → "Jeudi 29 octobre". */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Numéro ivoirien en chiffres avec l'indicatif : "05 84 60 30 11", "+225…", "00225…" → "2250584603011". */
export function toInternationalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits.length === 10 ? `225${digits}` : digits;
}

/** "0584603011" → "+225 05 84 60 30 11" (espaces insécables) ; un numéro inattendu est rendu tel quel. */
export function formatPhone(raw: string): string {
  const digits = toInternationalDigits(raw);
  if (!/^225\d{10}$/.test(digits)) return raw;
  return `+225${NBSP}${digits.slice(3).match(/\d{2}/g)!.join(NBSP)}`;
}

const DAY_NAMES: Record<DayKey, string> = {
  lun: "lundi",
  mar: "mardi",
  mer: "mercredi",
  jeu: "jeudi",
  ven: "vendredi",
  sam: "samedi",
  dim: "dimanche",
};

function rangesLabel(ranges: [string, string][] | undefined): string {
  if (!ranges?.length) return "fermé";
  return ranges
    .map(([open, close]) => (open === "00:00" && close >= "23:59" ? "24h/24" : `${open}${NBSP}–${NBSP}${close}`))
    .join(", ");
}

/**
 * Horaires en phrases courtes, jours consécutifs regroupés :
 * ["Tous les jours, 11:00 – 23:00"], ["Ouvert 24h/24, 7j/7"] ou ["Du lundi au vendredi : 11:00 – 23:00", "Samedi : fermé", …].
 */
export function summarizeHours(hours: OpeningHours | undefined | null): string[] {
  if (!hours) return [];
  const groups: { from: DayKey; to: DayKey; label: string }[] = [];
  for (const day of DAY_KEYS) {
    const label = rangesLabel(hours[day]);
    const last = groups.at(-1);
    if (last && last.label === label) last.to = day;
    else groups.push({ from: day, to: day, label });
  }

  if (groups.length === 1) {
    const { label } = groups[0];
    if (label === "24h/24") return ["Ouvert 24h/24, 7j/7"];
    return [label === "fermé" ? "Fermé" : `Tous les jours, ${label}`];
  }
  return groups.map(({ from, to, label }) => {
    const days = from === to ? capitalize(DAY_NAMES[from]) : `Du ${DAY_NAMES[from]} au ${DAY_NAMES[to]}`;
    return `${days}${NBSP}: ${label}`;
  });
}

/** Horaires jour par jour : [{ day: "Lundi", label: "11:00 – 23:00" }, …]. */
export function dailyHours(hours: OpeningHours | undefined | null): { day: string; label: string }[] {
  if (!hours) return [];
  return DAY_KEYS.map((day) => ({ day: capitalize(DAY_NAMES[day]), label: capitalize(rangesLabel(hours[day])) }));
}

/** Nombre de jours d'ouverture dans la semaine. */
export function openDaysCount(hours: OpeningHours | undefined | null): number {
  return hours ? DAY_KEYS.filter((day) => hours[day]?.length).length : 7;
}

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * Ouvert ou fermé à cet instant, à l'heure d'Abidjan (UTC+0, sans heure d'été) :
 * { open: true, label: "Ouvert · jusqu’à 23:00" } ou { open: false, label: "Fermé · ouvre demain à 11:00" }.
 */
export function openingStatus(hours: OpeningHours | undefined | null, now = new Date()): { open: boolean; label: string } | null {
  if (!hours) return null;
  if (summarizeHours(hours)[0] === "Ouvert 24h/24, 7j/7") return { open: true, label: "Ouvert 24h/24 · 7j/7" };

  const today = (now.getUTCDay() + 6) % 7; // 0 = lundi
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  for (const [open, close] of hours[DAY_KEYS[today]] ?? []) {
    if (minutes >= toMinutes(open) && minutes < toMinutes(close)) {
      return { open: true, label: `Ouvert · jusqu’à${NBSP}${close}` };
    }
  }

  for (let offset = 0; offset < 7; offset++) {
    const day = DAY_KEYS[(today + offset) % 7];
    const next = (hours[day] ?? []).find(([open]) => offset > 0 || toMinutes(open) > minutes);
    if (!next) continue;
    const when = offset === 0 ? "" : offset === 1 ? "demain " : `${DAY_NAMES[day]} `;
    return { open: false, label: `Fermé · ouvre ${when}à${NBSP}${next[0]}` };
  }
  return { open: false, label: "Fermé" };
}
