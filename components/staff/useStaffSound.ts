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
