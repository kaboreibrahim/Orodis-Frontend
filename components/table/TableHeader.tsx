"use client";

// En-tête de l'app de table : logo, haut-parleur, pastille « Table N » (maquettes Main, Carte, Panier).
import { ChevronLeft, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSound } from "./SoundProvider";

type TableHeaderProps = {
  tableNumber: number;
  /** Grand logo de l'écran d'accueil (maquette Main). */
  large?: boolean;
  /** Flèche de retour (maquettes Carte, Fiche, Panier). */
  backHref?: string;
};

export function TableHeader({ tableNumber, large = false, backHref }: TableHeaderProps) {
  const { muted, toggleMuted } = useSound();
  return (
    <header className={`flex items-start justify-between px-5 ${backHref ? "pt-3" : "pt-[22px]"}`}>
      <div className="flex items-center gap-1.5">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Retour"
            className="flex size-11 items-center justify-center rounded-full text-encre transition-colors hover:bg-sable"
          >
            <ChevronLeft size={24} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        )}
        <Image
          src="/logo-delices-orodis-web.png"
          alt="Les Délices d’Orodis, restaurant"
          width={99}
          height={88}
          className={large ? "h-[88px] w-auto" : "h-[52px] w-auto"}
        />
      </div>
      <div className={`flex items-center gap-1.5 ${large ? "mt-3.5" : ""}`}>
        <button
          type="button"
          onClick={toggleMuted}
          aria-pressed={muted}
          aria-label={muted ? "Rétablir le son" : "Couper le son"}
          className="flex size-11 items-center justify-center rounded-full text-encre transition-colors hover:bg-sable"
        >
          {muted ? <VolumeX size={22} aria-hidden="true" /> : <Volume2 size={22} aria-hidden="true" />}
        </button>
        <TablePill number={tableNumber} />
      </div>
    </header>
  );
}

export function TablePill({ number }: { number: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-bordeaux px-4 py-2.5 text-[15px] font-bold text-creme">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="stroke-jaune"
      >
        <path d="M3 9h18M5 9v10M19 9v10M8 9V6M16 9V6M8 14h8" />
      </svg>
      Table {number}
    </span>
  );
}
