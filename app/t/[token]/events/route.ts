// Relais du polling de la table vers /table/events/ (docs/phase3.md, « Temps réel »).
// Sous /t/<qr> : c'est le seul chemin où le cookie httpOnly de la session est envoyé ; le jeton reste côté serveur.
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/client";
import { readSessionToken, tableApi } from "@/lib/api/table";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ detail: "Session absente." }, { status: 401, headers: NO_STORE });
  const after = new URL(request.url).searchParams.get("after");
  try {
    const page = await tableApi(token, after && /^\d+$/.test(after) ? `events/?after=${after}` : "events/");
    return NextResponse.json(page, { headers: NO_STORE });
  } catch (error) {
    const status = error instanceof ApiError && (error.status === 401 || error.status === 429) ? error.status : 503;
    if (status === 503) console.error(error);
    return NextResponse.json({ detail: status === 401 ? "Session inconnue." : "Temps réel indisponible." }, { status, headers: NO_STORE });
  }
}
