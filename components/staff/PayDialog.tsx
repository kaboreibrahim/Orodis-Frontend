"use client";

// Encaissement (docs/phase3.md, « Paiement ») : la caisse confirme avoir reçu le paiement, puis le reçu est émis.
// Table : toute l'addition restante (POST /manage/sessions/{id}/pay/) ; comptoir : la commande (POST /manage/orders/{id}/pay/).
// Mobile Money : la référence de la transaction est obligatoire. Espèces : calcul de la monnaie à rendre.
import { Check, Printer, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StaffOrder, StaffReceipt } from "@/lib/api/staff";
import { formatPrice } from "@/lib/format";
import { METHODS, type PaymentMethod } from "./labels";

export type PayTarget =
  | { kind: "session"; sessionId: number; tableNumber: number | null; orders: StaffOrder[] }
  | { kind: "order"; order: StaffOrder };

type Props = { target: PayTarget; onClose: () => void; onPaid: (receipt: StaffReceipt) => void };

export function PayDialog({ target, onClose, onPaid }: Props) {
  const orders = target.kind === "session" ? target.orders : [target.order];
  const total = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const wished = orders.find((o) => o.payment_method)?.payment_method as PaymentMethod | undefined;
  const [method, setMethod] = useState<PaymentMethod>(wished || "cash");
  const [reference, setReference] = useState("");
  const [received, setReceived] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [receipt, setReceipt] = useState<StaffReceipt | null>(null);

  const title =
    target.kind === "session" ? `Addition · Table ${target.tableNumber ?? ""}` : `Commande n° ${target.order.number} · comptoir`;
  const change = useMemo(() => {
    const amount = Number(received.replace(/\s/g, ""));
    return method === "cash" && amount >= total ? amount - total : null;
  }, [received, method, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (method !== "cash" && !reference.trim()) {
      setError("Saisissez la référence de la transaction affichée sur le téléphone du client.");
      return;
    }
    setPending(true);
    setError(null);
    const url =
      target.kind === "session" ? `/api/gestion/sessions/${target.sessionId}/pay` : `/api/gestion/orders/${target.order.id}/pay`;
    try {
      const response = await fetch(url, {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, transaction_ref: reference.trim() }),
      });
      const body = await response.json().catch(() => null);
      if (response.status === 401) return window.location.assign("/gestion/connexion?suite=/gestion");
      if (!response.ok) {
        const first = body && typeof body === "object" ? Object.values(body as Record<string, unknown>)[0] : null;
        setError((Array.isArray(first) ? String(first[0]) : typeof first === "string" ? first : null) ?? "Encaissement impossible pour le moment.");
        return;
      }
      setReceipt(body as StaffReceipt);
      onPaid(body as StaffReceipt);
    } catch {
      setError("Connexion difficile : réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-encre/50 p-4" onClick={() => !pending && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="encaissement-titre"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-[460px] flex-col gap-4 overflow-y-auto rounded-[22px] bg-white p-6 shadow-fiche"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="encaissement-titre" className="text-[24px]">
              {receipt ? "Paiement enregistré" : "Encaisser"}
            </h2>
            <p className="text-sm text-texte-doux">{title}</p>
          </div>
          <button type="button" onClick={onClose} disabled={pending} aria-label="Fermer" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-sable">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {receipt ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl bg-pastille-ok p-4 text-texte-ok">
              <span className="flex size-9 items-center justify-center rounded-full bg-whatsapp text-white">
                <Check size={20} strokeWidth={3} aria-hidden="true" />
              </span>
              <div>
                <div className="font-bold">Reçu {receipt.reference}</div>
                <div className="text-sm">
                  {formatPrice(receipt.total)} · {receipt.method_display}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/gestion/recus/${receipt.number}/ticket`}
                target="_blank"
                rel="noopener"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-bordeaux font-bold text-white"
              >
                <Printer size={18} aria-hidden="true" />
                Imprimer le ticket
              </a>
              <a
                href={`/api/gestion/receipts/${receipt.number}.pdf`}
                target="_blank"
                rel="noopener"
                className="flex h-12 items-center justify-center rounded-full border-[1.5px] border-encre font-bold"
              >
                Reçu PDF
              </a>
            </div>
            <button type="button" onClick={onClose} className="h-11 rounded-full border-[1.5px] border-bordure font-bold text-ticket-doux">
              Fermer
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5 rounded-2xl bg-sable p-4">
              {orders.map((o) => (
                <div key={o.id} className="flex justify-between text-sm">
                  <span>Commande n° {o.number}</span>
                  <span className="font-bold">{formatPrice(o.total ?? 0)}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-bordure pt-2 font-display text-[22px] font-bold">
                <span>À encaisser</span>
                <span className="text-bordeaux">{formatPrice(total)}</span>
              </div>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-bold">Moyen de paiement</legend>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3 font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bordeaux ${
                      method === m.value ? "border-encre bg-encre text-white" : "border-bordure bg-white"
                    }`}
                  >
                    <input type="radio" name="method" value={m.value} checked={method === m.value} onChange={() => {
                        setMethod(m.value);
                        setError(null);
                      }} className="sr-only" />
                    <span className={`size-3 rounded-full ${m.dot}`} aria-hidden="true" />
                    {m.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {method === "cash" ? (
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Montant reçu <span className="font-normal text-texte-doux">facultatif, pour calculer la monnaie</span>
                <input
                  inputMode="numeric"
                  value={received}
                  onChange={(e) => setReceived(e.target.value.replace(/[^\d\s]/g, ""))}
                  placeholder={String(total)}
                  className="h-12 rounded-xl border-[1.5px] border-bordure px-3.5 font-normal"
                />
                {change !== null && <span className="text-base text-texte-ok">À rendre : {formatPrice(change)}</span>}
              </label>
            ) : (
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Référence de la transaction
                <input
                  value={reference}
                  onChange={(e) => {
                    setReference(e.target.value);
                    setError(null);
                  }}
                  placeholder="Ex. T2611ABCD1234"
                  autoComplete="off"
                  className="h-12 rounded-xl border-[1.5px] border-bordure px-3.5 font-normal uppercase"
                />
              </label>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-rose px-3.5 py-2.5 text-sm font-medium text-bordeaux">
                {error}
              </p>
            )}

            <button type="submit" disabled={pending} className="h-13 min-h-13 rounded-full bg-bordeaux text-base font-bold text-white disabled:opacity-60">
              {pending ? "Encaissement…" : `Confirmer l’encaissement · ${formatPrice(total)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
