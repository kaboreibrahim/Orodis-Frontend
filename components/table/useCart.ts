"use client";

// Panier d'une table dans le localStorage (une clé par table) : il survit à un rechargement.
// useSyncExternalStore : tous les composants (barre, fiche, panier) et les autres onglets restent synchronisés.
import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  addLine,
  type AddResult,
  type CartLine,
  cartTotals,
  type NewLine,
  parseCart,
  removeLine,
  setQuantity,
} from "@/lib/cart";

const CHANGE_EVENT = "orodis-panier";
const storageKey = (qr: string) => `orodis-panier:${qr}`;

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // stockage indisponible : panier vide
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange); // autre onglet
  window.addEventListener(CHANGE_EVENT, onChange); // cet onglet
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useCart(qr: string) {
  const key = storageKey(qr);
  // Côté serveur : panier vide ; le vrai contenu arrive à l'hydratation.
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const lines = useMemo(() => parseCart(raw), [raw]);

  const write = useCallback(
    (next: CartLine[]) => {
      try {
        if (next.length) localStorage.setItem(key, JSON.stringify(next));
        else localStorage.removeItem(key);
      } catch {}
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key],
  );

  const add = useCallback(
    (incoming: NewLine): AddResult => {
      const result = addLine(parseCart(readRaw(key)), incoming);
      if (result.added) write(result.lines);
      return result;
    },
    [key, write],
  );

  return {
    lines,
    ...cartTotals(lines),
    add,
    setQuantity: (lineKey: string, quantity: number) => write(setQuantity(parseCart(readRaw(key)), lineKey, quantity)),
    remove: (lineKey: string) => write(removeLine(parseCart(readRaw(key)), lineKey)),
    clear: () => write([]),
  };
}
