"use client";

// Badge « Ouvert » du héros : calculé dans le navigateur, car la page est régénérée seulement toutes les 10 minutes.
import { useEffect, useState } from "react";
import { PingDot } from "@/components/motion/PingDot";
import type { OpeningHours } from "@/lib/api/types";
import { openingStatus } from "@/lib/format";

type OpenBadgeProps = {
  hours?: OpeningHours;
  /** Texte affiché avant le calcul (rendu serveur), ex. "Tous les jours, 11:00 – 23:00". */
  fallback: string;
};

export function OpenBadge({ hours, fallback }: OpenBadgeProps) {
  const [status, setStatus] = useState<ReturnType<typeof openingStatus>>(null);

  useEffect(() => {
    const update = () => setStatus(openingStatus(hours));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [hours]);

  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-bordure bg-white py-2 pr-4 pl-3 text-sm font-bold text-encre">
      {status?.open ? (
        <PingDot />
      ) : (
        <span aria-hidden="true" className={`size-2.5 rounded-full ${status ? "bg-bordeaux" : "bg-bordure"}`} />
      )}
      {status?.label ?? fallback}
    </span>
  );
}
