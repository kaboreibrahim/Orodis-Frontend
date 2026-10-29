"use client";

// Soulignement jaune dessiné sous le mot fort : pathLength 0 → 1 en 0,9 s, après le titre.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_IN_OUT } from "./ease";
import { useIntroOffset } from "./useIntroOffset";

type DrawUnderlineProps = {
  children: ReactNode;
  className?: string;
  /** Délai en secondes : laisser le titre monter d'abord. */
  delay?: number;
  /** true : attend la fin de l'écran de bienvenue (héros). */
  afterIntro?: boolean;
};

export function DrawUnderline({ children, className, delay = 0.85, afterIntro = false }: DrawUnderlineProps) {
  const reduce = useReducedMotion();
  const start = delay + useIntroOffset(afterIntro);

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      {children}
      <svg
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[10px] left-0 h-[18px] w-full overflow-visible"
      >
        <motion.path
          d="M4 16 C80 4 200 2 296 12"
          fill="none"
          className="stroke-jaune"
          strokeWidth={9}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE_IN_OUT, delay: start }}
        />
      </svg>
    </span>
  );
}
