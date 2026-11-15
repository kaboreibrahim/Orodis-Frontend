"use client";

// Animations d'entrée de la vue d'ensemble : le titre se dévoile lettre par lettre, les cartes sortent du flou
// l'une après l'autre, les chiffres comptent jusqu'à leur valeur et les barres poussent depuis leur base.
// Sous <MotionConfig reducedMotion="user">, les déplacements sont coupés ; le compteur s'affiche directement.
import { animate, motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Conteneur : ses enfants <Reveal> entrent l'un après l'autre. */
export const stagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
  gone: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985, filter: "blur(12px)" },
  shown: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
  gone: { opacity: 0, filter: "blur(10px)", transition: { duration: 0.18 } },
};

type RevealProps = { children: React.ReactNode; className?: string; as?: "div" | "section" | "aside" };

/** Carte qui sort du flou ; à placer dans un conteneur animé par `stagger`. */
export function Reveal({ children, className, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag variants={card} className={className}>
      {children}
    </Tag>
  );
}

const letters: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.028 } } };
const letter: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  shown: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.45, ease: EASE } },
};

/** Titre dévoilé lettre par lettre ; les lecteurs d'écran lisent le texte entier. */
export function RevealTitle({ text, className }: { text: string; className?: string }) {
  return (
    <motion.h1 className={className} variants={letters} initial="hidden" animate="shown" aria-label={text}>
      {text.split(" ").map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <span className="inline-block whitespace-nowrap" aria-hidden="true">
            {[...word].map((char, at) => (
              <motion.span key={at} variants={letter} className="inline-block">
                {char}
              </motion.span>
            ))}
          </span>
        </Fragment>
      ))}
    </motion.h1>
  );
}

type CountUpProps = { value: number; format?: (value: number) => string; className?: string };

/** Nombre qui compte de sa valeur précédente à la nouvelle (de 0 au premier affichage). */
export function CountUp({ value, format = String, className }: CountUpProps) {
  const reduced = useReducedMotion();
  const from = useRef(0);
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      from.current = value;
      setShown(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (latest) => {
        from.current = latest;
        setShown(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, reduced]);

  return (
    <span className={className} aria-label={format(value)}>
      <span aria-hidden="true" className="tabular-nums">
        {format(shown)}
      </span>
    </span>
  );
}

type GrowProps = { ratio: number; delay?: number; className?: string; axis?: "x" | "y" };

/** Barre qui pousse depuis sa base (axis y) ou depuis la gauche (axis x) jusqu'à `ratio` (0 à 1). */
export function Grow({ ratio, delay = 0, className, axis = "y" }: GrowProps) {
  const size = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  const target = axis === "y" ? { height: size } : { width: size };
  const start = axis === "y" ? { height: 0 } : { width: 0 };
  return <motion.div className={className} initial={start} animate={target} transition={{ duration: 0.8, delay, ease: EASE }} />;
}
