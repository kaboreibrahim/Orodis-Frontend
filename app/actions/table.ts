"use server";

// Server Action callService : « Appeler un serveur » et « Demander l'addition » (POST /table/requests/).
// Le jeton de session est lu dans le cookie httpOnly de la table ; le navigateur ne le voit jamais.
import { ApiError } from "@/lib/api/client";
import { placeTableOrder, type PlaceOrderBody, readSessionToken, requestService, type ServiceKind } from "@/lib/api/table";

export type ServiceResult =
  | { ok: true; created: boolean }
  | { ok: false; reason: "expired" | "closed" | "rate_limited" | "unavailable" };

export async function callService(kind: ServiceKind): Promise<ServiceResult> {
  if (kind !== "waiter" && kind !== "bill") return { ok: false, reason: "unavailable" };
  const token = await readSessionToken();
  if (!token) return { ok: false, reason: "expired" };
  try {
    return { ok: true, ...(await requestService(token, kind)) };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 401) return { ok: false, reason: "expired" };
    if (error.status === 429) return { ok: false, reason: "rate_limited" };
    if (error.status === 400) return { ok: false, reason: "closed" };
    console.error(error);
    return { ok: false, reason: "unavailable" };
  }
}

export type PlaceOrderResult =
  | { ok: true; number: number }
  | {
      ok: false;
      reason: "invalid" | "expired" | "rate_limited" | "unavailable";
      /** Une entrée par ligne du panier, dans le même ordre : message d'erreur ou null. */
      lineErrors?: (string | null)[];
      message?: string;
    };

const firstMessage = (value: unknown): string | null =>
  Array.isArray(value) && typeof value[0] === "string" ? value[0] : typeof value === "string" ? value : null;

// Server Action placeOrder : POST /table/orders/ ; erreurs de l'API ramenées ligne par ligne.
export async function placeOrder(body: PlaceOrderBody): Promise<PlaceOrderResult> {
  const token = await readSessionToken();
  if (!token) return { ok: false, reason: "expired" };
  try {
    const order = await placeTableOrder(token, body);
    return { ok: true, number: order.number };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 401) return { ok: false, reason: "expired" };
    if (error.status === 429) return { ok: false, reason: "rate_limited" };
    if (error.status === 400 && error.data && typeof error.data === "object") {
      const data = error.data as Record<string, unknown>;
      // Erreurs par ligne : [{}, {"dish_id": ["Ce plat n'est plus disponible."]}, …]
      const lineErrors =
        Array.isArray(data.items) && data.items.some((line) => line && typeof line === "object")
          ? data.items.map((line) =>
              line && typeof line === "object" ? (Object.values(line).map(firstMessage).find(Boolean) ?? null) : null,
            )
          : undefined;
      const message = firstMessage(data.detail) ?? (lineErrors ? null : firstMessage(data.items));
      return { ok: false, reason: "invalid", lineErrors, message: message ?? (lineErrors ? undefined : "Commande refusée.") };
    }
    console.error(error);
    return { ok: false, reason: "unavailable" };
  }
}
