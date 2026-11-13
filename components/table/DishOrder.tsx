"use client";

// Fiche plat en mode commande (maquette phase3/Fiche) : options selon leurs minimum et maximum,
// précision pour la cuisine, quantité, total en direct, « Ajouter au panier ». Retour à la carte après l'ajout.
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DishImage } from "@/components/menu/DishImage";
import type { DishDetail, OptionGroup } from "@/lib/api/types";
import { MAX_QUANTITY, unitPrice } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { StatusToast } from "./StatusToast";
import { useCart } from "./useCart";

const min = (group: OptionGroup) => group.min_choices ?? 0;
const max = (group: OptionGroup) => group.max_choices ?? 1;

function rule(group: OptionGroup): string {
  if (min(group) === 0) return max(group) > 1 ? `facultatif, jusqu’à ${max(group)}` : "facultatif";
  if (min(group) === max(group)) return max(group) === 1 ? "obligatoire" : `${max(group)} au choix`;
  return `${min(group)} à ${max(group)} au choix`;
}

/** Options cochées au départ : celles « par défaut », dans la limite du maximum de chaque groupe. */
function defaults(groups: OptionGroup[]): Record<number, number[]> {
  return Object.fromEntries(
    groups.map((g) => [g.id, g.options.filter((o) => o.is_default).slice(0, max(g)).map((o) => o.id)]),
  );
}

export function DishOrder({ qr, dish, path }: { qr: string; dish: DishDetail; path: string }) {
  const router = useRouter();
  const cart = useCart(qr);
  const base = `/t/${encodeURIComponent(qr)}`;
  const groups = dish.option_groups;
  const [chosen, setChosen] = useState(() => defaults(groups));
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  function toggle(group: OptionGroup, optionId: number) {
    setChosen((current) => {
      const picked = current[group.id] ?? [];
      if (picked.includes(optionId)) {
        // Un choix obligatoire unique ne se décoche pas : on le remplace en touchant une autre option
        if (max(group) === 1 && min(group) === 1) return current;
        return { ...current, [group.id]: picked.filter((id) => id !== optionId) };
      }
      if (max(group) === 1) return { ...current, [group.id]: [optionId] };
      if (picked.length >= max(group)) return current;
      return { ...current, [group.id]: [...picked, optionId] };
    });
  }

  const options = groups.flatMap((g) => g.options.filter((o) => (chosen[g.id] ?? []).includes(o.id)));
  const missing = groups.filter((g) => (chosen[g.id] ?? []).length < min(g));
  const unit = unitPrice({ price: dish.price, options: options.map((o) => ({ ...o, price_delta: o.price_delta ?? 0 })) });

  function addToCart() {
    if (missing.length) return;
    const result = cart.add({
      dishId: dish.id,
      slug: dish.slug ?? "",
      name: dish.name,
      photo: dish.photo ?? null,
      price: dish.price,
      options: options.map(({ id, name, price_delta }) => ({ id, name, price_delta: price_delta ?? 0 })),
      note: note.slice(0, 200),
      quantity,
    });
    if (!result.added) {
      setToast(
        result.reason === "full"
          ? "Votre panier est plein : envoyez-le en cuisine d’abord."
          : `${MAX_QUANTITY} exemplaires au maximum pour ce plat.`,
      );
      window.setTimeout(() => setToast(null), 2600);
      return;
    }
    router.push(`${base}/carte?ajoute=${encodeURIComponent(dish.name)}`);
  }

  const [first, ...rest] = dish.name.split(" ");

  return (
    <main className="relative mx-auto min-h-dvh max-w-[480px] pb-28">
      {/* Photo, badge et fermeture */}
      <div className="relative h-[262px] bg-rose">
        <DishImage dish={dish} sizes="(min-width: 480px) 480px, 100vw" priority initialClassName="text-[110px]" />
        <Link
          href={`${base}/carte`}
          aria-label="Fermer et revenir à la carte"
          className="absolute top-3.5 right-3.5 flex size-11 items-center justify-center rounded-full bg-creme/95 text-bordeaux"
        >
          <X size={20} strokeWidth={2.4} aria-hidden="true" />
        </Link>
        {dish.is_featured && (
          <span className="absolute top-5 left-3.5 rounded-full bg-bordeaux px-3 py-1.5 text-xs font-bold tracking-[0.06em] text-jaune uppercase">
            Spécialité maison
          </span>
        )}
        {dish.photo && (
          <span className="absolute right-3.5 bottom-[30px] rounded-full bg-encre/60 px-2.5 py-1 text-[11px] font-bold text-white">
            Photo d’illustration
          </span>
        )}
      </div>

      {/* Fiche, qui remonte sur la photo */}
      <div className="relative -mt-[22px] flex flex-col gap-3 rounded-t-[26px] bg-creme px-5 pt-[18px]">
        <span className="text-[13px] font-bold text-bordeaux">{path}</span>
        <h1 className="-mt-1 text-[32px] leading-[1.02]">
          {first} {rest.length > 0 && <span className="text-bordeaux italic">{rest.join(" ")}</span>}
        </h1>
        {dish.description && <p className="text-[14.5px] leading-[1.45] text-texte-doux">{dish.description}</p>}

        {groups.map((group) => (
          <fieldset key={group.id} className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 text-[15px] font-bold">
              {group.name} <span className="font-normal text-texte-doux">({rule(group)})</span>
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {group.options.map((option) => {
                const on = (chosen[group.id] ?? []).includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(group, option.id)}
                    className={`flex min-h-[52px] flex-col items-center justify-center rounded-full px-2 py-1 text-center leading-tight transition-colors ${
                      on ? "border-2 border-jaune bg-bordeaux text-creme" : "border-[1.5px] border-bordure bg-white text-encre"
                    }`}
                  >
                    <span className="text-sm font-bold">{option.name}</span>
                    <span className="text-[11px] opacity-85">
                      {option.price_delta ? `+ ${formatPrice(option.price_delta)}` : "inclus"}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Une précision pour la cuisine&nbsp;?
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Ex. : sans oignon, bien chaud…"
            className="h-11 rounded-xl border-[1.5px] border-bordure bg-white px-3.5 text-sm font-normal text-encre"
          />
        </label>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-[26px] font-bold text-bordeaux">{formatPrice(unit)}</div>
            <div className="text-xs text-texte-doux">par portion</div>
          </div>
          <div className="flex items-center gap-1 rounded-full border-[1.5px] border-bordure bg-white p-[3px]">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Retirer une portion"
              className="flex size-11 items-center justify-center rounded-full bg-sable disabled:opacity-40"
            >
              <Minus size={20} strokeWidth={2.6} aria-hidden="true" />
            </button>
            <span className="min-w-[30px] text-center text-lg font-bold" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              disabled={quantity >= MAX_QUANTITY}
              aria-label="Ajouter une portion"
              className="flex size-11 items-center justify-center rounded-full bg-bordeaux text-creme disabled:opacity-40"
            >
              <Plus size={20} strokeWidth={2.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Bouton d'ajout, collé en bas comme dans la maquette */}
      <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-[448px]">
        {missing.length > 0 && (
          <p className="mb-2 rounded-full bg-encre px-4 py-2 text-center text-sm text-creme">
            Choisissez : {missing.map((g) => g.name.toLowerCase()).join(", ")}
          </p>
        )}
        <button
          type="button"
          onClick={addToCart}
          disabled={missing.length > 0}
          className="flex h-[60px] w-full items-center justify-center gap-3 rounded-full bg-bordeaux text-[17px] font-bold text-creme shadow-relief transition-opacity disabled:opacity-60 disabled:shadow-none"
        >
          <ShoppingCart size={22} className="text-jaune" aria-hidden="true" />
          Ajouter au panier · {formatPrice(unit * quantity)}
        </button>
      </div>
      <StatusToast message={toast} bottom={92} tone="error" />
    </main>
  );
}
