"use client";

// Message court en bas de l'écran de l'app de table (maquette Main) ; annoncé aux lecteurs d'écran.
import { AlertCircle, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_ORODIS } from "@/components/motion/ease";

type StatusToastProps = {
  message: string | null;
  /** Distance au bas de l'écran (px) : au-dessus d'un bouton fixe. */
  bottom?: number;
  /** success : coche verte ; error : alerte bordeaux (refus, panne). */
  tone?: "success" | "error";
};

export function StatusToast({ message, bottom = 84, tone = "success" }: StatusToastProps) {
  const reduce = useReducedMotion();
  return (
    <>
      {/* La zone annoncée existe avant le message, pour que les lecteurs d'écran le lisent */}
      <p role="status" className="sr-only">
        {message ?? ""}
      </p>
      <AnimatePresence>
        {message && (
          <motion.div
            aria-hidden="true"
            className="fixed left-1/2 z-40 flex w-[min(330px,calc(100vw-32px))] items-center gap-3 rounded-[18px] bg-encre px-4 py-3.5 text-sm text-creme shadow-fiche"
            style={{ x: "-50%", bottom }}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: EASE_ORODIS }}
          >
            <span
              className={`flex size-[34px] shrink-0 items-center justify-center rounded-full ${
                tone === "error" ? "bg-bordeaux" : "bg-whatsapp"
              }`}
            >
              {tone === "error" ? (
                <AlertCircle size={18} strokeWidth={2.6} className="text-creme" />
              ) : (
                <Check size={18} strokeWidth={2.6} className="text-white" />
              )}
            </span>
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
