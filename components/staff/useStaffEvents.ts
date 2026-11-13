"use client";

// Temps réel du personnel : polling de /api/gestion/events, relayé vers /manage/events/ avec le JWT du cookie
// (docs/phase3.md, « Temps réel »). La cuisine reçoit son propre flux. Session expirée : retour à la connexion.
import { type LiveEvent, useEventPolling } from "@/lib/useEventPolling";

export type StaffEvent = LiveEvent;

function toLogin() {
  window.location.assign(`/gestion/connexion?suite=${encodeURIComponent(window.location.pathname)}`);
}

export function useStaffEvents(onEvent: (event: StaffEvent) => void, onConnect?: () => void) {
  return useEventPolling("/api/gestion/events", onEvent, onConnect, toLogin);
}
