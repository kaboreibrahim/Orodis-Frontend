"use client";

// Sons du personnel (docs/phase3.md, « Sons du personnel ») : une tablette ou un ordinateur refuse tout son
// avant un premier geste. Le bouton « Activer le son » débloque la lecture ; le choix est retenu et
// se réarme au premier toucher ou clic après un rechargement.
import { useCallback, useEffect, useRef, useState } from "react";

export function useStaffSound(storageKey: string) {
  const [soundOn, setSoundOn] = useState(false);
  const enabled = useRef(false);

  const play = useCallback((src: string) => {
    if (!enabled.current) return;
    new Audio(src).play().catch(() => {
      enabled.current = false;
      setSoundOn(false);
    });
  }, []);

  useEffect(() => {
    let wanted = false;
    try {
      wanted = localStorage.getItem(storageKey) === "1";
    } catch {}
    if (!wanted) return;
    const arm = () => {
      enabled.current = true;
      setSoundOn(true);
    };
    window.addEventListener("pointerdown", arm, { once: true });
    return () => window.removeEventListener("pointerdown", arm);
  }, [storageKey]);

  /** Active ou coupe ; à l'activation, le son de confirmation sert aussi à débloquer la lecture. */
  const toggleSound = useCallback(
    (confirmation: string) => {
      const next = !enabled.current;
      enabled.current = next;
      setSoundOn(next);
      try {
        localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {}
      if (next) play(confirmation);
    },
    [play, storageKey],
  );

  return { soundOn, toggleSound, play };
}

/** Sonnerie répétée tant qu'une alerte attend une réponse (commande à lancer, table qui appelle).
 *  « active » vient de l'état de l'écran : elle s'arrête d'elle-même dès qu'une personne répond,
 *  sur cet appareil ou sur un autre (le changement arrive par le temps réel). */
export function useRepeatingSound(
  play: (src: string) => void,
  src: string,
  active: boolean,
  everyMs = REPEAT_EVERY_MS,
) {
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => play(src), everyMs);
    return () => window.clearInterval(timer);
  }, [active, everyMs, play, src]);
}

/** Intervalle entre deux sonneries : le premier bip part à l'arrivée de l'alerte, puis toutes les 3 s. */
export const REPEAT_EVERY_MS = 3_000;
