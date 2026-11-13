"use client";

// Temps réel par polling (docs/phase3.md, « Temps réel ») : LWS (Passenger) ne garde pas de connexion ouverte.
// À l'ouverture et après chaque coupure, on prend d'abord le curseur actuel, puis onConnect recharge l'état
// complet par REST : un événement survenu pendant le rechargement n'est jamais perdu. Ensuite, un appel
// toutes les 4 s tant que l'onglet est visible ; en cas d'échec, nouvel essai après 1, 2, 5 puis 10 s.
import { useEffect, useRef, useState } from "react";

export type LiveEvent = { id: number; type: string; data: Record<string, unknown> };
type EventsPage = { cursor: number; events: LiveEvent[] };

const POLL_EVERY = 4000;
const RETRY_DELAYS = [1000, 2000, 5000, 10000];
const PAGE_SIZE = 100; // page pleine : la suite est demandée tout de suite
const STALE_AFTER = 60_000; // onglet caché plus longtemps : rechargement complet au retour

/** url : route relais Next.js. onUnauthorized : session absente ou expirée (401). */
export function useEventPolling(
  url: string,
  onEvent: (event: LiveEvent) => void,
  onConnect?: () => void,
  onUnauthorized?: () => void,
) {
  const [online, setOnline] = useState(true); // pas de « Hors ligne » avant le premier essai
  const handlers = useRef({ onEvent, onConnect, onUnauthorized });

  useEffect(() => {
    handlers.current = { onEvent, onConnect, onUnauthorized };
  });

  useEffect(() => {
    let cursor: number | null = null; // null : curseur à reprendre et état à recharger
    let attempt = 0;
    let timer: number | undefined;
    let hiddenAt = 0;
    let busy = false;
    let stopped = false;

    function schedule(delay: number) {
      window.clearTimeout(timer);
      if (!stopped) timer = window.setTimeout(tick, delay);
    }

    async function tick() {
      if (stopped || busy || document.visibilityState === "hidden") return; // repris par visibilitychange
      busy = true;
      let page: EventsPage;
      try {
        const response = await fetch(cursor === null ? url : `${url}?after=${cursor}`, { cache: "no-store" });
        if (response.status === 401 && handlers.current.onUnauthorized) {
          stopped = true;
          handlers.current.onUnauthorized();
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        page = (await response.json()) as EventsPage;
      } catch {
        cursor = null;
        setOnline(false);
        schedule(RETRY_DELAYS[Math.min(attempt++, RETRY_DELAYS.length - 1)]);
        return;
      } finally {
        busy = false;
      }
      if (stopped) return;
      const reconnecting = cursor === null;
      cursor = page.cursor;
      attempt = 0;
      setOnline(true);
      if (reconnecting) handlers.current.onConnect?.();
      else for (const event of page.events) handlers.current.onEvent(event);
      schedule(page.events.length >= PAGE_SIZE ? 0 : POLL_EVERY);
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        window.clearTimeout(timer);
      } else {
        if (hiddenAt && Date.now() - hiddenAt > STALE_AFTER) cursor = null;
        tick();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    tick();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [url]);

  return { online };
}
