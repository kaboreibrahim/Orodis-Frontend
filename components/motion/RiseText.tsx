"use client";

// Texte qui monte ligne par ligne : chaque ligne glisse de y 110 % à 0 dans un conteneur overflow hidden.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_ORODIS } from "./ease";
import { useIntroOffset } from "./useIntroOffset";

type RiseTextProps = {
  /** Une entrée par ligne ; une ligne peut contenir un mot fort en italique ou un DrawUnderline. */
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Classe de chaque ligne (marge basse pour les jambages, par exemple). */
  lineClassName?: string;
  /** Délai avant la première ligne, en secondes. */
  delay?: number;
  /** true : se lance à l'arrivée dans l'écran plutôt qu'au chargement. */
  inView?: boolean;
  /** true : attend la fin de l'écran de bienvenue (héros). */
  afterIntro?: boolean;
};

export function RiseText({
  lines,
  as: Tag = "h2",
  className,
  lineClassName = "pb-[0.06em]",
  delay = 0,
  inView = false,
  afterIntro = false,
}: RiseTextProps) {
  const reduce = useReducedMotion();
  const start = delay + useIntroOffset(afterIntro);
  const trigger = inView
    ? { whileInView: { y: 0 }, viewport: { once: true, amount: 0.6 } }
    : { animate: { y: 0 } };

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`block overflow-hidden ${lineClassName}`}>
          <motion.span
            className="block"
            // Animations réduites : texte en place dès le rendu (style serveur différent, voir FadeUp).
            suppressHydrationWarning
            initial={reduce ? false : { y: "110%" }}
            {...(reduce ? { animate: { y: 0 } } : trigger)}
            transition={reduce ? { duration: 0 } : { duration: 0.85, ease: EASE_ORODIS, delay: start + i * 0.15 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
