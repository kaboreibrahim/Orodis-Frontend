// Créneaux d'un jour, lus en direct pour le ReservationWizard : relaie GET /reservations/availability/
// sans cache, avec l'IP du visiteur (la limite de Django s'applique à lui, pas au serveur Next.js).
import { type NextRequest, NextResponse } from "next/server";
import { ApiError, api } from "@/lib/api/client";
import { visitorHeaders } from "@/lib/api/submit";
import type { Availability } from "@/lib/api/types";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const party = request.nextUrl.searchParams.get("party") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,3}$/.test(party)) {
    return NextResponse.json({ detail: "Paramètres date (AAAA-MM-JJ) et party (nombre) attendus." }, { status: 400, headers: NO_STORE });
  }

  try {
    const query = new URLSearchParams({ date, party });
    const data = await api<Availability>(`/reservations/availability/?${query}`, {
      cache: "no-store",
      headers: await visitorHeaders(),
    });
    return NextResponse.json(data, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 429)) {
      return NextResponse.json(error.data ?? {}, { status: error.status, headers: NO_STORE });
    }
    console.error(error);
    return NextResponse.json({ detail: "Créneaux indisponibles pour le moment." }, { status: 502, headers: NO_STORE });
  }
}
