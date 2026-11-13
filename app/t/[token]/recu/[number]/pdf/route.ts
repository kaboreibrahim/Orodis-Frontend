// Reçu PDF A4 de la table : relayé depuis l'API avec le jeton de session (le navigateur ne parle jamais à Django).
import { apiUrl } from "@/lib/api/client";
import { visitorHeaders } from "@/lib/api/submit";
import { readSessionToken } from "@/lib/api/table";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string; number: string }> }) {
  const { number } = await params;
  const token = await readSessionToken();
  if (!token || !/^\d{1,9}$/.test(number)) return new Response("Reçu introuvable.", { status: 404 });
  const response = await fetch(apiUrl(`/table/receipts/${number}.pdf`), {
    cache: "no-store",
    headers: { "X-Session-Token": token, ...(await visitorHeaders()) },
  }).catch(() => null);
  if (!response?.ok || !response.body) {
    return new Response("Reçu indisponible pour le moment.", { status: response?.status === 404 ? 404 : 502 });
  }
  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recu-R-${number.padStart(6, "0")}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
