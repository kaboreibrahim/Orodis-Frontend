// Envois vers l'API pour le compte d'un visiteur (devis, réservation, disponibilités).
// Django limite les envois par IP : on lui transmet celle du visiteur, avec la clé partagée
// qui l'autorise à la croire (sinon toutes les demandes viendraient de l'IP du serveur Next.js).
import "server-only";
import { headers } from "next/headers";
import { ApiError, api } from "./client";

/** IP du visiteur : x-real-ip posé par le proxy, sinon la première de x-forwarded-for. */
async function visitorIp(): Promise<string | null> {
  const incoming = await headers();
  const realIp = incoming.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

/** En-têtes X-Frontend-Key et X-Client-IP ; rien si FRONTEND_API_KEY n'est pas renseignée. */
export async function visitorHeaders(): Promise<Record<string, string>> {
  const key = process.env.FRONTEND_API_KEY;
  if (!key) return {};
  const ip = await visitorIp();
  return { "X-Frontend-Key": key, ...(ip ? { "X-Client-IP": ip } : {}) };
}

/** Échec d'un envoi, sérialisable pour le navigateur. */
export type SubmitFailure = {
  ok: false;
  /** invalid : erreurs par champ ; rate_limited : 429 ; unavailable : API injoignable ou en erreur. */
  reason: "invalid" | "rate_limited" | "unavailable";
  fieldErrors?: Record<string, string>;
  message?: string;
};

/** Erreurs Zod ou DRF ({"champ": ["message"]}) → {champ: "premier message"} ; le reste va dans message. */
export function toFieldErrors(data: unknown, fields: readonly string[]): Pick<SubmitFailure, "fieldErrors" | "message"> {
  if (!data || typeof data !== "object") return {};
  const fieldErrors: Record<string, string> = {};
  const others: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    const text = Array.isArray(value) ? String(value[0] ?? "") : typeof value === "string" ? value : "";
    if (!text) continue;
    if (fields.includes(key)) fieldErrors[key] = text;
    else others.push(text);
  }
  return {
    ...(Object.keys(fieldErrors).length ? { fieldErrors } : {}),
    ...(others.length ? { message: others.join(" ") } : {}),
  };
}

/** POST sans cache ; renvoie la réponse, ou l'échec traduit pour le formulaire. */
export async function postForVisitor<T>(
  path: string,
  body: unknown,
  fields: readonly string[],
): Promise<{ ok: true; data: T } | SubmitFailure> {
  try {
    const data = await api<T>(path, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(await visitorHeaders()) },
      body: JSON.stringify(body),
    });
    return { ok: true, data };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 429) return { ok: false, reason: "rate_limited" };
    if (error.status === 400) {
      const details = toFieldErrors(error.data, fields);
      if (details.fieldErrors || details.message) return { ok: false, reason: "invalid", ...details };
    }
    console.error(error);
    return { ok: false, reason: "unavailable" };
  }
}
