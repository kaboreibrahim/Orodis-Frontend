"use client";

// Bandeau qui défile en boucle : la piste est dupliquée et glisse de 0 à -50 %, sans à-coup.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  /** Durée d'un tour en secondes (38 et 46 s dans la maquette). */
  duration?: number;
  /** Défile vers la droite. */
  reverse?: boolean;
  className?: string;
};

export function Marquee({ children, duration = 38, reverse = false, className }: MarqueeProps) {
  const reduce = useReducedMotion();

  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={reduce ? undefined : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        <div className="shrink-0">{children}</div>
        <div className="shrink-0" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
