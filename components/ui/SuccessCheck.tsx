"use client";

// Coche de confirmation : le cercle vert « pop », puis le trait se dessine (maquettes Traiteur et ResaSite).
import { motion, useReducedMotion } from "motion/react";
import { EASE_IN_OUT } from "@/components/motion/ease";

export function SuccessCheck({ size = 80 }: { size?: number }) {
  const reduce = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <motion.circle
        cx="50"
        cy="50"
        r="46"
        className="fill-whatsapp"
        style={{ transformOrigin: "50px 50px" }}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
      />
      <motion.path
        d="M30 52 L45 66 L72 37"
        className="stroke-white"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: EASE_IN_OUT, delay: 0.3 }}
      />
    </svg>
  );
}
