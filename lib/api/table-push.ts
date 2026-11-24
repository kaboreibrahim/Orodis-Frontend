// Relais des notifications push du téléphone de la table vers /table/push/ (routes app/t/[token]/notifications).
import "server-only";
import { NextResponse } from "next/server";
import { ApiError } from "./client";
import { readSessionToken, tableApi } from "./table";

const NO_STORE = { "Cache-Control": "no-store" };

export async function forwardTablePush(path: string, init: RequestInit = {}) {
  const token = await readSessionToken();
  if (!token) return NextResponse.json({ detail: "Session absente." }, { status: 401, headers: NO_STORE });
  try {
    const data = await tableApi<unknown>(token, path, init);
    return data === undefined ? new Response(null, { status: 204 }) : NextResponse.json(data, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      return NextResponse.json(error.data ?? { detail: "Demande refusée." }, { status: error.status, headers: NO_STORE });
    }
    console.error(error);
    return NextResponse.json({ detail: "Le restaurant ne répond pas. Réessayez." }, { status: 503, headers: NO_STORE });
  }
}
