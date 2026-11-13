"use client";

// Écran « Touchez pour commencer » puis apparition en cascade de l'accueil (docs/phase3.md, « Son de bienvenue »).
// Une fois par onglet (sessionStorage). Pour un visiteur déjà entré, le script ci-dessous pose
// html[data-bienvenue="vue"] avant l'affichage : globals.css masque l'écran d'entrée et montre l'accueil, sans clignotement.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { EASE_ORODIS } from "@/components/motion/ease";
import { useSound } from "./SoundProvider";

const EnteredContext = createContext(false);

const gateKey = (qr: string) => `orodis-bienvenue:${qr}`;

/** Voix du jour de 05:00 à 17:59 à Abidjan (UTC+0, sans heure d'été), du soir sinon. */
function welcomeVoice(now = new Date()) {
  const hour = now.getUTCHours();
  return hour >= 5 && hour < 18 ? "/sons/bienvenue-jour.mp3" : "/sons/bienvenue-soir.mp3";
}

type WelcomeExperienceProps = {
  qr: string;
  tableNumber: number;
  /** public/sons/tables/table-N.mp3 existe (vérifié par le serveur). */
  hasTableVoice: boolean;
  children: ReactNode;
};

export function WelcomeExperience({ qr, tableNumber, hasTableVoice, children }: WelcomeExperienceProps) {
  const reduce = useReducedMotion();
  const { playSequence } = useSound();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(gateKey(qr))) setEntered(true);
    } catch {}
  }, [qr]);

  function enter() {
    playSequence([welcomeVoice(), ...(hasTableVoice ? [`/sons/tables/table-${tableNumber}.mp3`] : [])]);
    try {
      sessionStorage.setItem(gateKey(qr), "1");
    } catch {}
    setEntered(true);
  }

  const seenScript = `try{if(sessionStorage.getItem(${JSON.stringify(gateKey(qr))}))document.documentElement.dataset.bienvenue="vue"}catch(e){}`;

  return (
    <EnteredContext value={entered}>
      <script dangerouslySetInnerHTML={{ __html: seenScript }} />
      <AnimatePresence>
        {!entered && (
          <motion.button
            key="entree"
            type="button"
            onClick={enter}
            className="table-gate fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-bordeaux px-6 text-center text-creme"
            exit={reduce ? undefined : { opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.45, ease: EASE_ORODIS }}
          >
            <Image src="/logo-delices-orodis-blanc-web.png" alt="" width={150} height={133} priority />
            <span className="mt-2 text-sm font-bold tracking-[0.22em] text-jaune uppercase">Table</span>
            <span className="font-display text-[112px] leading-[0.85] font-bold">{tableNumber}</span>
            <span className="mt-6 flex min-h-14 items-center rounded-full bg-jaune px-8 text-[17px] font-bold text-encre shadow-relief">
              Touchez pour commencer
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      {children}
    </EnteredContext>
  );
}

/** Bloc de l'accueil : caché tant que l'écran d'entrée est là, puis apparition en cascade (index × 80 ms). */
export function Reveal({ index = 0, className = "", children }: { index?: number; className?: string; children: ReactNode }) {
  const entered = useContext(EnteredContext);
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`welcome-item ${className}`}
      // Le serveur rend l'état caché ; globals.css l'annule pour un visiteur déjà entré (data-bienvenue).
      suppressHydrationWarning
      initial={false}
      animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE_ORODIS, delay: entered ? 0.15 + index * 0.08 : 0 }}
    >
      {children}
    </motion.div>
  );
}
