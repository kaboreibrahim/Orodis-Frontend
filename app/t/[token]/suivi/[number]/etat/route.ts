// État du suivi en JSON pour OrderTracking : rechargé à chaque événement temps réel et à chaque reconnexion.
// Si l'API limite les requêtes (429) ou ne répond pas, renvoie 503 : l'écran garde le dernier état connu.
import { ApiError } from "@/lib/api/client";
import { getTableOrder, getTableSession, readSessionToken } from "@/lib/api/table";

export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(_request: Request, { params }: { params: Promise<{ token: string; number: string }> }) {
  const { number } = await params;
  if (!/^\d{1,9}$/.test(number)) return json({ detail: "Commande introuvable." }, 404);
  const sessionToken = await readSessionToken();
  if (!sessionToken) return json({ detail: "Session expirée." }, 401);

  try {
    const [session, order] = await Promise.all([getTableSession(sessionToken), getTableOrder(sessionToken, Number(number))]);
    if (!session) return json({ detail: "Session expirée." }, 401);
    if (!order) return json({ detail: "Commande introuvable." }, 404);
    return json({ order, sessionClosed: session.status === "closed" });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 0;
    console.error(error);
    return json({ detail: "Connexion difficile.", retryable: true, apiStatus: status }, 503);
  }
}
