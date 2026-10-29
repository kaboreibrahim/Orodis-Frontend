"use client";

// Écran de bienvenue (première visite de la session) : cercle bordeaux qui s'ouvre, logo qui apparaît,
// nom du restaurant ligne par ligne, puis le cercle se referme sur le site. 3 s en tout.
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { EASE_ORODIS } from "@/components/motion/ease";
import { INTRO_STORAGE_KEY } from "@/lib/intro";

const LINES = [
  { text: "Les Délices d’Orodis", delay: 0.95, className: "font-display text-[clamp(40px,6.2vw,92px)] leading-none font-bold tracking-[-0.025em] text-creme pb-1.5" },
  { text: "Pâtisserie · Restauration · Service", delay: 1.3, className: "text-[clamp(13px,1.5vw,20px)] font-bold tracking-[0.22em] text-jaune uppercase" },
  { text: "Le savoir-faire à votre service", delay: 1.6, className: "font-display text-[clamp(18px,2vw,28px)] font-semibold text-rose italic pb-1" },
];

export function Intro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Décidé par le script du <head> (lib/intro.ts) : déjà vu, animations réduites ou navigation interne.
    if (document.documentElement.dataset.intro !== "play") {
      setVisible(false);
      return;
    }
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // Stockage indisponible (navigation privée) : l'écran rejouera à la prochaine visite.
    }
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.dataset.intro = "done")}>
      {visible && (
        <motion.div
          aria-hidden="true"
          className="orodis-intro fixed inset-0 z-50 bg-creme"
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ clipPath: "circle(0% at 50% 50%)", transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] } }}
        >
          <motion.div
            className="absolute inset-0 bg-bordeaux"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(80% at 50% 50%)" }}
            transition={{ duration: 0.9, ease: [0.45, 0, 0.4, 1] }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[18px] p-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -18, opacity: 0 }}
              animate={{ scale: [0, 1.08, 1], rotate: [-18, 3, 0], opacity: [0, 1, 1] }}
              transition={{ duration: 0.75, delay: 0.5, times: [0, 0.6, 1], ease: "easeOut" }}
            >
              <Image
                src="/logo-delices-orodis-blanc-web.png"
                alt=""
                width={300}
                height={266}
                priority
                className="h-auto w-[clamp(180px,22vw,300px)]"
              />
            </motion.div>
            {LINES.map((line) => (
              <span key={line.text} className="block overflow-hidden">
                <motion.span
                  className={`block ${line.className}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_ORODIS, delay: line.delay }}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
