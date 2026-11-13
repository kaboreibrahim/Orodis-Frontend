// App de table (/t/[token]) : session de la table, côté serveur uniquement.
// Le jeton de session vit dans un cookie httpOnly limité au chemin /t/<jeton QR> ; le navigateur ne le lit jamais.
import "server-only";
import { cookies } from "next/headers";
import { ApiError, api, apiUrl } from "./client";
import type { components } from "./schema";
import { visitorHeaders } from "./submit";

type Schemas = components["schemas"];
export type TableSessionOpened = Schemas["SessionOpened"];
export type TableSessionState = Schemas["SessionState"];

export const SESSION_COOKIE = "orodis_table";
/** Douze heures : un repas, même long ; la session se ferme de toute façon à l'addition. */
export const SESSION_MAX_AGE = 60 * 60 * 12;

/** Ouvre ou reprend la session de la table ; null si le QR n'est plus valable (404). */
export async function openTableSession(qrToken: string): Promise<TableSessionOpened | null> {
  try {
    return await api<TableSessionOpened>("/table/sessions/", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(await visitorHeaders()) },
      body: JSON.stringify({ qr_token: qrToken }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Jeton de session de la table courante (cookie du chemin /t/<jeton QR>). */
export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Appel d'une route /table/ au nom du téléphone : X-Session-Token et IP du visiteur, sans cache. */
export async function tableApi<T>(sessionToken: string, path: string, init: RequestInit = {}): Promise<T> {
  return api<T>(`/table/${path.replace(/^\/+/, "")}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": sessionToken,
      ...(await visitorHeaders()),
      ...init.headers,
    },
  });
}

export type ServiceKind = "waiter" | "bill";

/** Appel serveur ou demande d'addition. created=false : une demande du même type attendait déjà (200).
 *  Lève ApiError en cas d'erreur, comme api(). */
export async function requestService(sessionToken: string, kind: ServiceKind): Promise<{ created: boolean }> {
  let response: Response;
  try {
    response = await fetch(apiUrl("/table/requests/"), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Session-Token": sessionToken,
        ...(await visitorHeaders()),
      },
      body: JSON.stringify({ kind }),
    });
  } catch (cause) {
    throw new ApiError("L'API ne répond pas (/table/requests/).", 0, null, { cause });
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(`L'API a répondu ${response.status} pour /table/requests/.`, response.status, data);
  }
  return { created: response.status === 201 };
}

export type PlaceOrderBody = Schemas["PlaceOrder"];
export type TableOrder = Schemas["TableOrder"];

/** Envoie la commande en cuisine ; le backend recalcule tous les prix. Lève ApiError (400 : erreurs par ligne). */
export function placeTableOrder(sessionToken: string, body: PlaceOrderBody): Promise<TableOrder> {
  return tableApi<TableOrder>(sessionToken, "orders/", { method: "POST", body: JSON.stringify(body) });
}

/** Commande de cette session ; null si elle n'existe pas ou appartient à une autre table (404). */
export async function getTableOrder(sessionToken: string, number: number): Promise<TableOrder | null> {
  try {
    return await tableApi<TableOrder>(sessionToken, `orders/${number}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type TableReceipt = Schemas["Receipt"];

/** Reçu de cette session ; null s'il n'existe pas ou appartient à une autre table (404). */
export async function getTableReceipt(sessionToken: string, number: number): Promise<TableReceipt | null> {
  try {
    return await tableApi<TableReceipt>(sessionToken, `receipts/${number}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** État de la session ; null si le jeton est inconnu (401). */
export async function getTableSession(sessionToken: string): Promise<TableSessionState | null> {
  try {
    return await tableApi<TableSessionState>(sessionToken, "session/");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
