"use client";

// Fiche rapide d'un plat, ouverte en touchant la carte du centre : <dialog> natif
// (focus piégé et Échap fournis par le navigateur), fermeture aussi en touchant le fond.
import { Clock, X } from "lucide-react";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Dish } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { DishImage } from "./DishImage";
import { DishOptions } from "./DishOptions";

type DishSheetProps = {
  dish: Dish | null;
  /** Fil d'Ariane, ex. "Plats ivoiriens · Sauces". */
  path: string;
  whatsapp?: string;
  onClose: () => void;
};

export function DishSheet({ dish, path, whatsapp, onClose }: DishSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (dish && !dialog.open) dialog.showModal();
    if (!dish && dialog.open) dialog.close();
  }, [dish]);

  return (
    <dialog
      ref={ref}
      aria-label={dish?.name}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className="dish-sheet m-auto max-h-[calc(100dvh-32px)] w-[min(440px,calc(100%-32px))] overflow-y-auto rounded-[28px] bg-white p-0 text-encre shadow-fiche backdrop:bg-encre/55"
    >
      {dish && (
        <div>
          <div className="relative h-60">
            <DishImage dish={dish} sizes="440px" initialClassName="text-[110px]" />
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Fermer"
              className="absolute top-3.5 right-3.5 flex size-11 items-center justify-center rounded-full bg-white/90 text-encre"
            >
              <X size={22} strokeWidth={2.4} />
            </button>
          </div>
          <div className="flex flex-col gap-3 px-6 pt-[22px] pb-6">
            <span className="text-xs font-bold tracking-[0.12em] text-bordeaux uppercase">{path}</span>
            <h3 className="text-[30px]">{dish.name}</h3>
            {dish.description && <p className="text-texte-doux">{dish.description}</p>}
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-2xl font-bold">{formatPrice(dish.price)}</span>
              {dish.prep_minutes ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-texte-doux">
                  <Clock size={16} aria-hidden="true" /> environ {dish.prep_minutes} min
                </span>
              ) : null}
            </div>
            <DishOptions groups={dish.option_groups} />
            <a
              href={whatsappLink(whatsapp, `Bonjour, je voudrais commander : ${dish.name} (${formatPrice(dish.price)}).`)}
              className="mt-2 flex h-14 items-center justify-center gap-2 rounded-full bg-whatsapp text-[17px] font-bold text-creme"
            >
              <WhatsAppLogo size={26} className="ring-2 ring-creme/60" /> Commander sur WhatsApp
            </a>
            {dish.slug && (
              <Link
                href={`/carte/${dish.slug}`}
                className="flex h-12 items-center justify-center rounded-full border-[1.5px] border-bordure font-bold text-encre"
              >
                Voir la fiche du plat
              </Link>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
