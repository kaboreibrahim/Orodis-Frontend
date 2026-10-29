"use client";

// Position fractionnaire partagée par l'anneau et le CouvertureFlow : suit le doigt pendant le glissement,
// puis un ressort la ramène sur l'élément choisi. Flèches gauche et droite au clavier.
import { useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, type MotionValue } from "motion/react";
import { useEffect, useState, type DragEvent, type KeyboardEvent } from "react";
import { useSwipe } from "./useSwipe";

type FlowOptions = {
  active: number;
  count: number;
  /** Distance du doigt (px) pour passer d'un élément au suivant. */
  unit: number;
  onChange: (index: number) => void;
  /** Entrée au clavier sur l'élément du centre. */
  onActivate?: (index: number) => void;
};

export function useFlowPosition({ active, count, unit, onChange, onActivate }: FlowOptions) {
  const reduce = useReducedMotion();
  const target = useMotionValue(active);
  const spring = useSpring(target, { stiffness: 260, damping: 32, mass: 0.9 });
  const pos: MotionValue<number> = reduce ? target : spring;

  // Élément le plus proche du centre, même pendant le glissement (couleurs, aria).
  const [centered, setCentered] = useState(active);
  useMotionValueEvent(pos, "change", (value) => {
    const nearest = Math.max(0, Math.min(count - 1, Math.round(value)));
    setCentered((current) => (current === nearest ? current : nearest));
  });

  useEffect(() => {
    target.set(active);
  }, [active, target]);

  // Un peu de jeu au-delà des bords, comme un élastique.
  const clamp = (value: number) => Math.min(count - 0.65, Math.max(-0.35, value));

  const { handlers } = useSwipe({
    onMove: (dx) => target.set(clamp(active - dx / unit)),
    onEnd: (dx) => {
      let steps = Math.round(-dx / unit);
      if (steps === 0 && Math.abs(dx) > 30) steps = dx < 0 ? 1 : -1;
      const next = Math.max(0, Math.min(count - 1, active + steps));
      target.set(next);
      if (next !== active) onChange(next);
    },
  });

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowRight" && active < count - 1) onChange(active + 1);
    else if (e.key === "ArrowLeft" && active > 0) onChange(active - 1);
    else if ((e.key === "Enter" || e.key === " ") && onActivate) onActivate(active);
    else return;
    e.preventDefault();
  }

  // Sans ça, glisser sur une photo lance le glisser-déposer du navigateur, qui annule le geste.
  const onDragStart = (e: DragEvent<HTMLElement>) => e.preventDefault();

  return { pos, centered, handlers: { ...handlers, onKeyDown, onDragStart } };
}
