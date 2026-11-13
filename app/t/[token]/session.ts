// Session de la table pour les pages /t/[token] : sans session valable, on passe par /ouvrir.
// API injoignable ou limitée (429) : l'erreur remonte à app/t/[token]/error.tsx, qui réessaie sur place.
import "server-only";
import { redirect } from "next/navigation";
import { getTableSession, readSessionToken, type TableSessionState } from "@/lib/api/table";

/** allowClosed : le suivi et le reçu restent lisibles après le paiement (session fermée). */
export async function requireTableSession(qr: string, { allowClosed = false } = {}): Promise<TableSessionState> {
  const base = `/t/${encodeURIComponent(qr)}`;
  const token = await readSessionToken();
  const state: TableSessionState | null = token ? await getTableSession(token) : null;
  if (!state || (state.status === "closed" && !allowClosed)) redirect(`${base}/ouvrir`);
  return state;
}
