// Données structurées JSON-LD « Restaurant » (schema.org), tirées des réglages saisis dans l'admin.
import { DAY_KEYS, type DayKey, type RestaurantSettings } from "./api/types";
import { toInternationalDigits } from "./format";

const SCHEMA_DAYS: Record<DayKey, string> = {
  lun: "Monday",
  mar: "Tuesday",
  mer: "Wednesday",
  jeu: "Thursday",
  ven: "Friday",
  sam: "Saturday",
  dim: "Sunday",
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/** Une entrée par plage horaire, jours regroupés : [{dayOfWeek: ["Monday", …], opens: "11:00", closes: "23:00"}]. */
function openingHoursSpecification(hours: RestaurantSettings["opening_hours"]) {
  const byRange = new Map<string, string[]>();
  for (const day of DAY_KEYS) {
    for (const [opens, closes] of hours?.[day] ?? []) {
      const key = `${opens}-${closes}`;
      byRange.set(key, [...(byRange.get(key) ?? []), SCHEMA_DAYS[day]]);
    }
  }
  return [...byRange].map(([range, days]) => {
    const [opens, closes] = range.split("-");
    return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes };
  });
}

export function restaurantJsonLd(settings: RestaurantSettings) {
  const phone = settings.phone ? `+${toInternationalDigits(settings.phone)}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.name || "Les Délices d'Orodis",
    url: siteUrl,
    logo: `${siteUrl}/logo-delices-orodis-web.png`,
    image: `${siteUrl}/opengraph-image`,
    ...(phone && { telephone: phone }),
    ...(settings.email && { email: settings.email }),
    ...(settings.address && {
      address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "CI" },
    }),
    ...(settings.maps_url && { hasMap: settings.maps_url }),
    openingHoursSpecification: openingHoursSpecification(settings.opening_hours),
    servesCuisine: ["Ivoirienne", "Africaine", "Européenne", "Pâtisserie"],
    acceptsReservations: `${siteUrl}/reserver`,
    hasMenu: `${siteUrl}/carte`,
  };
}

/** JSON sûr dans une balise <script> : « < » échappé pour qu'un texte saisi ne puisse pas la refermer. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
