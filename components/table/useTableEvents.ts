"use client";

// Temps réel de la table : polling de /t/<qr>/events (docs/phase3.md, « Temps réel »).
// Session inconnue (401) : retour à /t/<qr>/ouvrir, comme le rechargement de l'état.
import { type LiveEvent, useEventPolling } from "@/lib/useEventPolling";

export type TableEvent = LiveEvent;

export function useTableEvents(qr: string, onEvent: (event: TableEvent) => void, onConnect?: () => void) {
  const base = `/t/${encodeURIComponent(qr)}`;
  return useEventPolling(`${base}/events`, onEvent, onConnect, () => window.location.assign(`${base}/ouvrir`));
}
