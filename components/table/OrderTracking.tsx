"use client";

// Suivi en direct (maquette phase3/Suivi) : bandeau d'état, temps estimé, 4 étapes avec leur heure.
// Les événements (order.status, order.cancelled, session.paid) et chaque (re)connexion rechargent l'état
// depuis l'API (route ./etat) : l'écran affiche toujours l'état de l'API, jamais une supposition.
// Si l'API limite les requêtes ou ne répond pas, l'écran garde le dernier état connu, affiche
// « Connexion difficile » et réessaie toutes les 5 s.
import { Check, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { callService } from "@/app/actions/table";
import type { TableOrder } from "@/lib/api/table";
import { formatPrice, formatTime } from "@/lib/format";
import { NotifyMe } from "./NotifyMe";
import { OfflinePill } from "./OfflinePill";
import { StatusToast } from "./StatusToast";
import { TableHeader } from "./TableHeader";
import { type TableEvent, useTableEvents } from "./useTableEvents";

const STEPS = [
  { status: "received", title: "Commande reçue", text: "Transmise directement en cuisine", at: "created_at" },
  { status: "preparing", title: "En préparation", text: "Le chef prépare votre commande", at: "accepted_at" },
  { status: "ready", title: "Prête", text: "Votre serveur la récupère au passe", at: "ready_at" },
  { status: "served", title: "Servie à votre table", text: "Bon appétit !", at: "served_at" },
] as const;

const BANNERS: Record<string, { title: string; text: string }> = {
  received: { title: "Commande envoyée !", text: "La cuisine vient de recevoir votre commande." },
  preparing: { title: "Bon appétit bientôt !", text: "Notre chef prépare vos plats avec soin." },
  ready: { title: "C’est prêt !", text: "Votre serveur arrive avec vos plats." },
  served: { title: "Bon appétit !", text: "Vos plats sont servis. Merci de votre visite." },
};

const RETRY_AFTER = 5000;

/** Temps restant estimé : depuis l'envoi + eta_minutes ; jamais négatif. Masqué une fois servie. */
function eta(order: TableOrder, now = Date.now()): string {
  if (order.status === "ready") return "quelques instants";
  const left = Math.ceil((Date.parse(order.created_at) + (order.eta_minutes ?? 15) * 60_000 - now) / 60_000);
  return left > 1 ? `environ ${left} min` : "d’un instant à l’autre";
}

type Props = { qr: string; tableNumber: number; order: TableOrder; sessionClosed: boolean };

export function OrderTracking({ qr, tableNumber, order: initialOrder, sessionClosed: initialClosed }: Props) {
  const base = `/t/${encodeURIComponent(qr)}`;
  const [order, setOrder] = useState(initialOrder);
  const [sessionClosed, setSessionClosed] = useState(initialClosed);
  const [degraded, setDegraded] = useState(false);
  const retryTimer = useRef<number | undefined>(undefined);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function flash(text: string, error = false) {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), 2800);
  }

  /** Recharge l'état ; en cas d'échec, garde le dernier état connu et réessaie dans 5 s. */
  async function reload() {
    window.clearTimeout(retryTimer.current);
    try {
      const response = await fetch(`${base}/suivi/${initialOrder.number}/etat`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign(`${base}/ouvrir`);
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      const state = (await response.json()) as { order: TableOrder; sessionClosed: boolean };
      setOrder(state.order);
      setSessionClosed(state.sessionClosed);
      setDegraded(false);
    } catch {
      setDegraded(true);
      retryTimer.current = window.setTimeout(reload, RETRY_AFTER);
    }
  }

  useEffect(() => () => window.clearTimeout(retryTimer.current), []);

  function onEvent(event: TableEvent) {
    const concernsThisOrder = event.data.number === order.number;
    if ((event.type === "order.status" || event.type === "order.cancelled") && concernsThisOrder) {
      if (event.data.status === "ready") navigator.vibrate?.(40); // Android : courte vibration
      reload();
    } else if (event.type === "request.done") {
      flash(event.data.kind === "bill" ? "Le serveur arrive avec l’addition." : "Le serveur arrive.");
    } else if (event.type === "session.paid") {
      flash("Paiement enregistré : votre reçu est prêt.");
      reload();
    }
  }

  const { online } = useTableEvents(qr, onEvent, reload);

  function askBill() {
    startTransition(async () => {
      const result = await callService("bill").catch(() => ({ ok: false as const, reason: "unavailable" as const }));
      if (result.ok) {
        flash(result.created ? "Votre demande d’addition a été envoyée au serveur." : "Votre demande d’addition est déjà transmise.");
      } else if (result.reason === "expired") {
        window.location.assign(`${base}/ouvrir`);
      } else {
        flash("Envoi impossible pour le moment. Faites signe au serveur.", true);
      }
    });
  }

  const cancelled = order.status === "cancelled";
  const current = STEPS.findIndex((step) => step.status === order.status);
  const banner = cancelled
    ? {
        title: "Commande annulée",
        text: order.cancel_reason ? `Motif : ${order.cancel_reason}` : "Le restaurant a annulé cette commande.",
      }
    : BANNERS[order.status ?? "received"];

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col pb-28">
      <OfflinePill online={online && !degraded} label={online ? "Connexion difficile…" : undefined} />
      <TableHeader tableNumber={tableNumber} backHref={`${base}/carte`} />

      <div className="flex flex-col gap-3.5 px-5 pt-2.5">
        {online && !degraded && !cancelled && order.status !== "served" && (
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-whatsapp px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-white uppercase">
            <span className="relative size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
              <span className="absolute inset-0 rounded-full bg-white/90" />
            </span>
            En direct
          </span>
        )}
        <h1 className="text-[30px] leading-[1.05]">Suivi de votre commande</h1>

        {/* Bandeau d'état */}
        <div className={`flex flex-col gap-3 rounded-3xl p-5 text-creme shadow-relief ${cancelled ? "bg-encre" : "bg-bordeaux"}`}>
          <p className="font-display text-[26px] font-bold italic">{banner.title}</p>
          <p className="text-sm text-creme/85">{banner.text}</p>
          {!cancelled && order.status !== "served" && (
            <div className="flex items-center gap-2.5">
              <span className="flex size-[38px] items-center justify-center rounded-full bg-jaune">
                <Clock size={20} strokeWidth={2.2} className="text-encre" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xs text-creme/85">Temps estimé</div>
                <div className="text-[17px] font-bold text-jaune">{eta(order)}</div>
              </div>
            </div>
          )}
        </div>

        {!cancelled && !sessionClosed && order.status !== "served" && <NotifyMe qr={qr} />}

        {/* Reçu, une fois payé */}
        {order.receipt_number && (
          <Link
            href={`${base}/recu/${order.receipt_number}`}
            className="flex min-h-14 items-center justify-between rounded-[18px] bg-white px-4 font-bold text-encre shadow-pilule"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-whatsapp text-white">
                <Check size={16} strokeWidth={3} aria-hidden="true" />
              </span>
              Commande payée
            </span>
            <span className="text-bordeaux underline underline-offset-4">Voir mon reçu</span>
          </Link>
        )}

        {/* Progression */}
        {!cancelled && (
          <div className="rounded-[22px] bg-white px-[18px] pt-[18px] pb-1.5">
            <div className="mb-3 flex justify-between">
              <span className="font-bold">Progression</span>
              <span className="text-sm font-bold text-bordeaux">Commande n° {order.number}</span>
            </div>
            <ol>
              {STEPS.map((step, i) => {
                const done = i < current;
                const now = i === current;
                const at = order[step.at];
                return (
                  <li key={step.status} className="flex gap-3.5" aria-current={now ? "step" : undefined}>
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex size-[30px] items-center justify-center rounded-full text-sm font-bold transition-[background-color,transform] duration-400 ${
                          done
                            ? "bg-whatsapp text-white"
                            : now
                              ? "scale-110 bg-bordeaux text-creme ring-6 ring-bordeaux/15"
                              : "bg-rose text-texte-doux"
                        }`}
                      >
                        {done ? <Check size={16} strokeWidth={3} aria-label="terminé" /> : i + 1}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span className={`my-1 min-h-[18px] w-0.5 flex-1 ${done ? "bg-whatsapp" : "bg-bordure"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between gap-2">
                        <span className={`text-[15px] font-bold ${done || now ? "text-encre" : "text-texte-doux"}`}>
                          {step.title}
                        </span>
                        <span className="text-[12.5px] text-texte-doux">{at ? formatTime(at) : "à venir"}</span>
                      </div>
                      <div className="mt-0.5 text-[13px] text-texte-doux">{step.text}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <p className="text-center text-sm text-texte-doux">
          {order.items.reduce((n, item) => n + item.quantity, 0)} article(s) · {formatPrice(order.total ?? 0)}
        </p>
      </div>

      {/* Actions, collées en bas comme dans la maquette */}
      {!sessionClosed && (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto grid max-w-[448px] grid-cols-2 gap-2.5">
          <Link
            href={`${base}/carte`}
            className="flex h-14 items-center justify-center rounded-full border-[1.5px] border-bordeaux bg-white px-2 text-center text-sm leading-tight font-bold text-bordeaux"
          >
            Commander autre chose
          </Link>
          <button
            type="button"
            onClick={askBill}
            disabled={pending}
            className="flex h-14 items-center justify-center rounded-full bg-bordeaux px-2 text-center text-sm leading-tight font-bold text-creme disabled:opacity-60"
          >
            Demander l’addition
          </button>
        </div>
      )}
      <StatusToast message={toast?.text ?? null} bottom={86} tone={toast?.error ? "error" : "success"} />
    </main>
  );
}
