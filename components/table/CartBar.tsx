"use client";

// Barre « Voir mon panier · N · total » (maquette Carte), collée en bas de l'écran ; absente tant que le panier est vide.
import { ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useCart } from "./useCart";

export function CartBar({ qr }: { qr: string }) {
  const { count, total } = useCart(qr);
  if (count === 0) return null;
  return (
    <Link
      href={`/t/${encodeURIComponent(qr)}/panier`}
      className="fixed inset-x-4 bottom-4 z-30 mx-auto flex h-[60px] max-w-[448px] items-center justify-between rounded-full bg-bordeaux px-5 text-creme shadow-relief"
    >
      <span className="flex items-center gap-3">
        <ShoppingCart size={24} strokeWidth={2} className="text-jaune" aria-hidden="true" />
        <span className="font-bold">
          Voir mon panier · {count}
          <span className="sr-only"> {count > 1 ? "articles" : "article"}</span>
        </span>
      </span>
      <span className="flex items-center gap-2 font-bold">
        {formatPrice(total)}
        <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
      </span>
    </Link>
  );
}
