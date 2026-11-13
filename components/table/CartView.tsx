"use client";

// Panier de la table (maquette phase3/Panier) : lignes modifiables, total, « Quand voulez-vous payer ? »,
// moyen de paiement, puis envoi en cuisine par la Server Action placeOrder. Le backend recalcule tout.
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder, type PlaceOrderResult } from "@/app/actions/table";
import { DishImage } from "@/components/menu/DishImage";
import { lineDetails, lineTotal, MAX_QUANTITY, toOrderItems } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { StatusToast } from "./StatusToast";
import { TableHeader } from "./TableHeader";
import { useCart } from "./useCart";

const METHODS = [
  { value: "wave", label: "Wave", dot: "bg-wave" },
  { value: "orange_money", label: "Orange Money", dot: "bg-orange-money" },
  { value: "mtn_momo", label: "MTN MoMo", dot: "bg-mtn" },
  { value: "cash", label: "Espèces", dot: "bg-especes" },
] as const;
type Method = (typeof METHODS)[number]["value"];

const TIMINGS = [
  ["now", "Maintenant"],
  ["end", "À la fin du repas"],
] as const;

export function CartView({ qr, tableNumber }: { qr: string; tableNumber: number }) {
  const router = useRouter();
  const cart = useCart(qr);
  const base = `/t/${encodeURIComponent(qr)}`;
  const [timing, setTiming] = useState<"now" | "end">("now");
  const [method, setMethod] = useState<Method>("wave");
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function send() {
    const lines = cart.lines;
    startTransition(async () => {
      let result: PlaceOrderResult;
      try {
        result = await placeOrder({
          items: toOrderItems(lines),
          payment_timing: timing,
          payment_method: timing === "now" ? method : "",
          note: "",
        });
      } catch {
        result = { ok: false, reason: "unavailable" };
      }
      if (result.ok) {
        cart.clear();
        router.push(`${base}/suivi/${result.number}`);
        return;
      }
      if (result.reason === "expired") {
        window.location.assign(`${base}/ouvrir`); // le panier reste dans le téléphone
        return;
      }
      const errors = result.lineErrors;
      setLineErrors(
        errors ? Object.fromEntries(lines.flatMap((line, i) => (errors[i] ? [[line.key, errors[i] as string]] : []))) : {},
      );
      flash(
        result.reason === "rate_limited"
          ? "Trop de demandes, patientez un instant."
          : result.reason === "unavailable"
            ? "Envoi impossible pour le moment. Faites signe au serveur."
            : (result.message ?? "Certains plats ne sont plus disponibles : retirez-les puis renvoyez."),
      );
    });
  }

  const methodLabel = METHODS.find((m) => m.value === method)?.label;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col pb-32">
      <TableHeader tableNumber={tableNumber} backHref={`${base}/carte`} />
      <div className="flex flex-col gap-3 px-5 pt-1">
        <div>
          <h1 className="text-[32px] leading-[1.05]">Ma commande</h1>
          <p className="mt-0.5 text-sm text-texte-doux">Table {tableNumber} · sur place</p>
        </div>

        {cart.lines.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-[22px] bg-white p-8 text-center">
            <p className="text-texte-doux">Votre panier est vide.</p>
            <Link href={`${base}/carte`} className="flex min-h-12 items-center rounded-full bg-bordeaux px-7 font-bold text-creme">
              Voir la carte
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {cart.lines.map((line) => (
                <li key={line.key} className="flex flex-col gap-1.5 rounded-[18px] bg-white p-2.5 shadow-pilule">
                  <div className="flex items-center gap-3">
                    <span className="relative size-[66px] shrink-0 overflow-hidden rounded-[14px]">
                      <DishImage dish={{ name: line.name, photo: line.photo ?? undefined }} sizes="66px" initialClassName="text-2xl" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-display text-base leading-tight font-bold">{line.name}</span>
                      {lineDetails(line) && <span className="text-[12.5px] text-texte-doux">{lineDetails(line)}</span>}
                      <span className="text-[15px] font-bold text-bordeaux">{formatPrice(lineTotal(line))}</span>
                    </div>
                    <div className="flex items-center gap-0.5 rounded-full bg-sable p-0.5">
                      {line.quantity === 1 ? (
                        <button
                          type="button"
                          onClick={() => cart.remove(line.key)}
                          aria-label={`Retirer ${line.name}`}
                          className="flex size-11 items-center justify-center rounded-full bg-white text-bordeaux"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => cart.setQuantity(line.key, line.quantity - 1)}
                          aria-label={`Un ${line.name} de moins`}
                          className="flex size-11 items-center justify-center rounded-full bg-white"
                        >
                          <Minus size={18} strokeWidth={2.6} aria-hidden="true" />
                        </button>
                      )}
                      <span className="min-w-[18px] text-center font-bold">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(line.key, line.quantity + 1)}
                        disabled={line.quantity >= MAX_QUANTITY}
                        aria-label={`Un ${line.name} de plus`}
                        className="flex size-11 items-center justify-center rounded-full bg-bordeaux text-creme disabled:opacity-40"
                      >
                        <Plus size={18} strokeWidth={2.6} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {lineErrors[line.key] && (
                    <p className="rounded-xl bg-rose px-3 py-2 text-[13px] font-bold text-bordeaux">{lineErrors[line.key]}</p>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-1.5 rounded-[18px] bg-white px-4 py-3.5 text-[15px]">
              <div className="flex justify-between">
                <span className="text-texte-doux">Sous-total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-texte-doux">Service à table</span>
                <span>Inclus</span>
              </div>
              <div className="my-1 h-px bg-bordure" />
              <div className="flex items-baseline justify-between">
                <span className="font-display text-[22px] font-bold">Total</span>
                <span className="font-display text-[26px] font-bold text-bordeaux">{formatPrice(cart.total)}</span>
              </div>
            </div>

            <fieldset className="flex min-w-0 flex-col gap-2">
              <legend className="mb-2 text-[15px] font-bold">Quand voulez-vous payer&nbsp;?</legend>
              <div className="grid grid-cols-2 gap-1.5 rounded-full bg-rose p-1">
                {TIMINGS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={timing === value}
                    onClick={() => setTiming(value)}
                    className={`min-h-11 rounded-full text-[15px] font-bold transition-colors ${
                      timing === value ? "bg-bordeaux text-creme" : "text-bordeaux"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            {timing === "now" ? (
              <fieldset className="flex min-w-0 flex-col gap-2">
                <legend className="sr-only">Moyen de paiement</legend>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      aria-pressed={method === m.value}
                      onClick={() => setMethod(m.value)}
                      className={`flex min-h-[52px] items-center gap-2.5 rounded-2xl px-3.5 text-sm font-bold text-encre ${
                        method === m.value ? "border-2 border-bordeaux bg-jaune/20" : "border-[1.5px] border-bordure bg-white"
                      }`}
                    >
                      <span className={`size-[22px] shrink-0 rounded-full ${m.dot}`} aria-hidden="true" />
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-texte-doux">Le serveur viendra encaisser par {methodLabel}.</p>
              </fieldset>
            ) : (
              <p className="rounded-[14px] bg-white px-3.5 py-3 text-sm text-texte-doux">
                Vous réglerez l’addition à la fin du repas, auprès du serveur.
              </p>
            )}
          </>
        )}
      </div>

      {cart.lines.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-[448px]">
          <button
            type="button"
            onClick={send}
            disabled={pending}
            className="flex h-[60px] w-full items-center justify-center rounded-full bg-bordeaux text-[17px] font-bold text-creme shadow-relief transition-opacity disabled:opacity-60"
          >
            {pending ? "Envoi en cours…" : `Envoyer en cuisine · ${formatPrice(cart.total)}`}
          </button>
        </div>
      )}
      {/* Ici, seuls les échecs s'affichent : un envoi réussi part vers le suivi */}
      <StatusToast message={toast} bottom={92} tone="error" />
    </main>
  );
}
