"use client";

// Apparition au défilement : opacité 0 → 1 et y 24 → 0 en 0,7 s, une seule fois.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_ORODIS } from "./ease";
import { useIntroOffset } from "./useIntroOffset";

const elements = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  p: motion.p,
  span: motion.span,
};

type FadeUpProps = {
  children: ReactNode;
  as?: keyof typeof elements;
  className?: string;
  id?: string;
  /** Délai en secondes (cartes en cascade). */
  delay?: number;
  /** true : se lance au chargement (héros) plutôt qu'à l'arrivée dans l'écran. */
  immediate?: boolean;
  /** true : attend la fin de l'écran de bienvenue (héros). */
  afterIntro?: boolean;
};

export function FadeUp({ children, as = "div", className, id, delay = 0, immediate = false, afterIntro = false }: FadeUpProps) {
  const reduce = useReducedMotion();
  const start = delay + useIntroOffset(afterIntro);
  const Element = elements[as];
  const visible = { opacity: 1, y: 0 };
  const trigger = immediate
    ? { animate: visible }
    : { whileInView: visible, viewport: { once: true, amount: 0.3 } };

  return (
    <Element
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      {...trigger}
      transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_ORODIS, delay: start }}
    >
      {children}
    </Element>
  );
}
