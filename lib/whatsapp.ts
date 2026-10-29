// Liens de contact : WhatsApp (wa.me), téléphone (tel:) et Google Maps.
import { toInternationalDigits } from "./format";

/** https://wa.me/2250702578159?text=… ; sans numéro, celui de NEXT_PUBLIC_WHATSAPP. */
export function whatsappLink(number?: string | null, message?: string): string {
  const digits = toInternationalDigits(number || process.env.NEXT_PUBLIC_WHATSAPP || "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/** "05 84 60 30 11" → "tel:+2250584603011" */
export function telLink(number: string): string {
  return `tel:+${toInternationalDigits(number)}`;
}

/** Fiche Google Maps : le lien saisi dans l'admin, sinon une recherche sur le nom et l'adresse. */
export function mapsLink(place: { name?: string; address?: string; maps_url?: string }): string {
  if (place.maps_url) return place.maps_url;
  const query = [place.name, place.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Itinéraire Google Maps jusqu'au restaurant. */
export function directionsLink(place: { name?: string; address?: string }): string {
  const destination = [place.name, place.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
