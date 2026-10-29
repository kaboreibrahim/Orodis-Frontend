"use client";

// Délai à ajouter aux animations du héros si l'écran de bienvenue est en train de jouer.
import { useState } from "react";
import { INTRO_OFFSET } from "@/lib/intro";

export function useIntroOffset(enabled: boolean): number {
  // Lu une seule fois au montage ; n'influe que sur les transitions, pas sur le HTML.
  const [offset] = useState(() =>
    enabled && typeof document !== "undefined" && document.documentElement.dataset.intro === "play" ? INTRO_OFFSET : 0,
  );
  return offset;
}
