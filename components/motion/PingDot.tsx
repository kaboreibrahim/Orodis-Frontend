"use client";

// Point qui pulse (badge « Ouvert ») : halo scale 1 → 2,4 et opacité 0,6 → 0, toutes les 1,8 s.
import { motion, useReducedMotion } from "motion/react";

type PingDotProps = {
  /** Couleur du point, en classe de token (bg-whatsapp par défaut). */
  colorClassName?: string;
  className?: string;
};

export function PingDot({ colorClassName = "bg-whatsapp", className }: PingDotProps) {
  const reduce = useReducedMotion();

  return (
    <span aria-hidden="true" className={`relative inline-block size-2.5 ${className ?? ""}`}>
      {/* Animations réduites : le halo reste immobile sous le point, donc invisible. */}
      <motion.span
        className={`absolute inset-0 rounded-full ${colorClassName}`}
        initial={{ scale: 1, opacity: 0.6 }}
        animate={reduce ? undefined : { scale: 2.4, opacity: 0 }}
        transition={{ duration: 1.8, ease: "easeOut", repeat: Infinity }}
      />
      <span className={`absolute inset-0 rounded-full ${colorClassName}`} />
    </span>
  );
}
