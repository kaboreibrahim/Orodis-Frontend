"use client";

// Son de l'app de table : coupé ou non (retenu par le navigateur) et lecture d'une suite de fichiers.
// Les téléphones refusent un son lancé sans geste : playSequence est appelée depuis un toucher.
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

const MUTE_KEY = "orodis-son-coupe";

type SoundValue = { muted: boolean; toggleMuted: () => void; playSequence: (sources: string[]) => void };

const SoundContext = createContext<SoundValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const current = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MUTE_KEY) === "1";
      mutedRef.current = saved;
      setMuted(saved);
    } catch {
      // stockage indisponible (navigation privée) : son actif
    }
  }, []);

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) current.current?.pause();
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {}
  }, []);

  const playSequence = useCallback((sources: string[]) => {
    const play = (queue: string[]) => {
      const [source, ...rest] = queue;
      if (!source || mutedRef.current) return;
      const audio = new Audio(source);
      current.current = audio;
      audio.addEventListener("ended", () => play(rest), { once: true });
      audio.play().catch(() => {}); // lecture refusée : l'accueil continue, sans son
    };
    play(sources);
  }, []);

  return <SoundContext value={{ muted, toggleMuted, playSequence }}>{children}</SoundContext>;
}

export function useSound(): SoundValue {
  const value = useContext(SoundContext);
  if (!value) throw new Error("useSound doit être utilisé dans <SoundProvider>.");
  return value;
}
