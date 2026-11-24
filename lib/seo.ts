// Référencement : métadonnées communes des pages et données structurées JSON-LD (schema.org).
// Tout vient des réglages saisis dans l'admin et de la carte ; les seules données fixes ci-dessous
// ont été confirmées par le restaurant (ville, repère d'adresse, gamme de prix).
import type { Metadata } from "next";
import { DAY_KEYS, type Category, type DayKey, type DishDetail, type RestaurantSettings } from "./api/types";
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

export const SITE_NAME = "Les Délices d’Orodis";

/** Localisation confirmée par le restaurant ; l'adresse précise de l'admin passe avant le repère. */
export const LOCATION = {
  city: "Grand-Bassam",
  landmark: "Cité Italia 2, carrefour Modeste",
  region: "Sud-Comoé",
  country: "CI",
} as const;

export const PRICE_RANGE = "À partir de 2 000 F CFA";

/** Description de l'accueil (et par défaut) ; hours = horaires résumés depuis l'admin. Environ 160 caractères, au-delà Google coupe. */
export function homeDescription(hours: string) {
  return `Restaurant à ${LOCATION.city}, Cité Italia 2 : cuisine ivoirienne et européenne, pâtisserie et traiteur.${
    hours ? ` ${hours}.` : ""
  } Sur place, à emporter ou en livraison.`;
}

const RESTAURANT_ID = `${siteUrl}/#restaurant`;
const WEBSITE_ID = `${siteUrl}/#website`;

type PageSeo = {
  /** Titre de la page ; le modèle « … · Les Délices d’Orodis » est ajouté par le layout. */
  title: string;
  description: string;
  /** Chemin canonique, sans domaine : « / », « /carte »… */
  path: string;
  /** Photo propre à la page ; sinon l'image de partage du site (app/opengraph-image.tsx). */
  image?: string | null;
  index?: boolean;
  /** true : titre utilisé tel quel, sans le nom du restaurant ajouté (accueil). */
  absoluteTitle?: boolean;
};

/** Métadonnées d'une page publique : titre, description, adresse canonique, Open Graph et carte Twitter. */
export function pageMetadata({ title, description, path, image, index = true, absoluteTitle = false }: PageSeo): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  // Une page qui précise son Open Graph perd l'image du site héritée : on la remet explicitement.
  const images = image ? [{ url: image, alt: title }] : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NAME }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      locale: "fr_CI",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

/** Coordonnées lues dans le lien Google Maps (« …/@5.2012,-3.7389,17z » ou « ?q=5.2012,-3.7389 ») ; aucune sinon. */
function geoFromMapsUrl(url?: string) {
  const match = url?.match(/[@=](-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/);
  if (!match) return undefined;
  return { "@type": "GeoCoordinates", latitude: Number(match[1]), longitude: Number(match[2]) };
}

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
  const geo = geoFromMapsUrl(settings.maps_url);
  return {
    "@type": "Restaurant",
    "@id": RESTAURANT_ID,
    name: settings.name || SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/logo-delices-orodis-web.png`,
    image: `${siteUrl}/opengraph-image`,
    ...(phone && { telephone: phone }),
    ...(settings.email && { email: settings.email }),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address || LOCATION.landmark,
      addressLocality: LOCATION.city,
      addressRegion: LOCATION.region,
      addressCountry: LOCATION.country,
    },
    ...(geo && { geo }),
    ...(settings.maps_url && { hasMap: settings.maps_url }),
    areaServed: { "@type": "City", name: LOCATION.city },
    openingHoursSpecification: openingHoursSpecification(settings.opening_hours),
    servesCuisine: ["Ivoirienne", "Africaine", "Européenne", "Pâtisserie"],
    priceRange: PRICE_RANGE,
    currenciesAccepted: "XOF",
    acceptsReservations: `${siteUrl}/reserver`,
    hasMenu: `${siteUrl}/carte`,
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: "fr-CI",
    publisher: { "@id": RESTAURANT_ID },
  };
}

/** Fil d'Ariane : [["La carte", "/carte"], ["Kedjenou de poulet", "/carte/kedjenou"]] ; l'accueil est ajouté. */
export function breadcrumbJsonLd(trail: [name: string, path: string][]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [["Accueil", "/"] as const, ...trail].map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: `${siteUrl}${path === "/" ? "" : path}`,
    })),
  };
}

function offer(price: number | string) {
  return { "@type": "Offer", price: String(price), priceCurrency: "XOF", availability: "https://schema.org/InStock" };
}

/** La carte entière : sections (catégories et sous-catégories) et plats avec leur prix. */
export function menuJsonLd(menu: Category[]) {
  return {
    "@type": "Menu",
    "@id": `${siteUrl}/carte#menu`,
    name: `La carte des ${SITE_NAME}`,
    url: `${siteUrl}/carte`,
    inLanguage: "fr",
    hasMenuSection: menu.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      hasMenuSection: category.subcategories.map((sub) => ({
        "@type": "MenuSection",
        name: sub.name,
        hasMenuItem: sub.dishes.map((dish) => ({
          "@type": "MenuItem",
          name: dish.name,
          ...(dish.description && { description: dish.description }),
          ...(dish.slug && { url: `${siteUrl}/carte/${dish.slug}` }),
          ...(dish.photo && { image: dish.photo }),
          offers: offer(dish.price),
        })),
      })),
    })),
  };
}

export function dishJsonLd(dish: DishDetail) {
  return {
    "@type": "MenuItem",
    name: dish.name,
    url: `${siteUrl}/carte/${dish.slug}`,
    ...(dish.description && { description: dish.description }),
    ...(dish.photo && { image: dish.photo }),
    offers: { ...offer(dish.price), seller: { "@id": RESTAURANT_ID } },
    isPartOf: { "@id": `${siteUrl}/carte#menu` },
  };
}

export function cateringJsonLd(description: string) {
  return {
    "@type": "Service",
    name: "Traiteur et événements",
    serviceType: "Traiteur",
    description,
    url: `${siteUrl}/traiteur`,
    provider: { "@id": RESTAURANT_ID },
    areaServed: { "@type": "City", name: LOCATION.city },
  };
}

/** JSON sûr dans une balise <script> : « < » échappé pour qu'un texte saisi ne puisse pas la refermer. */
export function jsonLdScript(...items: object[]): string {
  const data = { "@context": "https://schema.org", "@graph": items };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
