// Appels de l'écran « Carte & menus » vers /api/gestion/menu/… (relais vers /manage/menu/ de Django).

export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

/** Premier message lisible d'une erreur DRF : {"detail": "…"}, {"price": ["…"]}, {"option_groups": [{"options": ["…"]}]}. */
function firstMessage(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstMessage(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = firstMessage(item);
      if (found) return found;
    }
  }
  return null;
}

export async function menuCall<T>(method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown): Promise<Result<T>> {
  try {
    const form = body instanceof FormData;
    const response = await fetch(`/api/gestion/menu${path}`, {
      method,
      cache: "no-store",
      headers: body && !form ? { "Content-Type": "application/json" } : undefined,
      body: body === undefined ? undefined : form ? body : JSON.stringify(body),
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (response.ok) return { ok: true, data: data as T };
    if (response.status === 401) return { ok: false, message: "Session expirée. Reconnectez-vous." };
    return { ok: false, message: firstMessage(data) ?? "L’enregistrement a échoué. Réessayez." };
  } catch {
    return { ok: false, message: "Pas de connexion. Réessayez." };
  }
}
