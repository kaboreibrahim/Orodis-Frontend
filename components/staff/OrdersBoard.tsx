"use client";

// Gestion des commandes (maquette phase3/Gestion) : indicateurs du jour, filtres, tableau, panneau de détail
// (avancement, annulation, encaissement, reçus) et alertes « appel serveur » / « addition » en tête.
// Temps réel par polling (useStaffEvents) ; à l’ouverture et après chaque coupure, tout est rechargé par REST.
import { BellRing, Printer, ReceiptText, Search, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StaffOrder, StaffRequest, StaffSession, StaffUser } from "@/lib/api/staff";
import { capitalize, formatDate, formatPrice, formatTime } from "@/lib/format";
import {
  CAN_CANCEL,
  CAN_PAY,
  CANCELLABLE,
  CHANNEL,
  FLOW,
  isPaid,
  isUnpaid,
  NEXT,
  payment,
  pill,
  receiptOf,
  STATUS,
  who,
} from "./labels";
import { PayDialog, type PayTarget } from "./PayDialog";
import { type StaffEvent, useStaffEvents } from "./useStaffEvents";
import { useStaffSound } from "./useStaffSound";

const SOUND_KEY = "orodis-gestion-son";
const NEW_ORDER = "/sons/nouvelle-commande.mp3";
const CALL = "/sons/appel-serveur.mp3";
const TIMESTAMP: Record<string, keyof StaffOrder> = { preparing: "accepted_at", ready: "ready_at", served: "served_at" };

type Filter = "all" | "active" | "unpaid" | "table" | "counter";

type Props = {
  user: StaffUser;
  today: string;
  initialOrders: StaffOrder[];
  initialRequests: StaffRequest[];
  initialSessions: StaffSession[];
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 401) {
    window.location.assign("/gestion/connexion?suite=/gestion");
    throw new Error("401");
  }
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}

export function OrdersBoard({ user, today, initialOrders, initialRequests, initialSessions }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [requests, setRequests] = useState(initialRequests);
  const [sessions, setSessions] = useState(initialSessions);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(initialOrders[0]?.id ?? null);
  const [pending, setPending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [payTarget, setPayTarget] = useState<PayTarget | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const toastTimer = useRef<number | undefined>(undefined);
  const { soundOn, toggleSound, play } = useStaffSound(SOUND_KEY);
  const canPay = CAN_PAY.includes(user.role);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function flash(text: string) {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }

  const reloadOrders = useCallback(async () => {
    const all: StaffOrder[] = [];
    for (let page = 1; page <= 10; page++) {
      const data = await getJson<{ results: StaffOrder[]; next: string | null }>(`/api/gestion/orders?date=${today}&page=${page}`);
      all.push(...data.results);
      if (!data.next) break;
    }
    setOrders(all);
  }, [today]);

  const reloadAll = useCallback(async () => {
    try {
      const [, reqs, sess] = await Promise.all([
        reloadOrders(),
        getJson<StaffRequest[]>("/api/gestion/requests"),
        getJson<StaffSession[]>("/api/gestion/sessions"),
      ]);
      setRequests(reqs);
      setSessions(sess);
    } catch {
      flash("Connexion difficile : l’écran sera remis à jour dès que possible.");
    }
  }, [reloadOrders]);

  function onEvent(event: StaffEvent) {
    const data = event.data;
    if (event.type === "order.created") {
      const order = data as unknown as StaffOrder;
      setOrders((list) => [order, ...list.filter((o) => o.id !== order.id)]);
      play(NEW_ORDER);
      flash(`Nouvelle commande n° ${order.number} · ${who(order)}`);
      getJson<StaffSession[]>("/api/gestion/sessions").then(setSessions).catch(() => undefined);
    } else if (event.type === "order.status") {
      const field = TIMESTAMP[String(data.status)];
      setOrders((list) =>
        list.map((o) => (o.id === data.id ? { ...o, status: data.status as StaffOrder["status"], ...(field ? { [field]: data.at } : {}) } : o)),
      );
    } else if (event.type === "order.cancelled") {
      setOrders((list) => list.map((o) => (o.id === data.id ? { ...o, status: "cancelled", cancel_reason: String(data.reason ?? "") } : o)));
    } else if (event.type === "request.created") {
      play(CALL);
      flash(`Table ${data.table_number} ${data.kind === "bill" ? "demande l’addition" : "appelle un serveur"}`);
      getJson<StaffRequest[]>("/api/gestion/requests").then(setRequests).catch(() => undefined);
      getJson<StaffSession[]>("/api/gestion/sessions").then(setSessions).catch(() => undefined);
    } else if (event.type === "request.done") {
      setRequests((list) => list.filter((r) => r.id !== data.id));
    } else if (event.type === "session.paid") {
      reloadAll();
    }
  }

  const { online } = useStaffEvents(onEvent, reloadAll);

  // --- Données affichées -------------------------------------------------------------------
  const counts = useMemo(
    () => ({
      all: orders.length,
      active: orders.filter((o) => ["received", "preparing", "ready"].includes(o.status ?? "")).length,
      unpaid: orders.filter(isUnpaid).length,
      table: orders.filter((o) => o.channel === "table").length,
      counter: orders.filter((o) => o.channel === "counter").length,
    }),
    [orders],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^n°\s*/, "");
    return orders.filter((o) => {
      if (filter === "active" && !["received", "preparing", "ready"].includes(o.status ?? "")) return false;
      if (filter === "unpaid" && !isUnpaid(o)) return false;
      if ((filter === "table" || filter === "counter") && o.channel !== filter) return false;
      if (!q) return true;
      return String(o.number) === q || who(o).toLowerCase().includes(q) || (o.table_number != null && String(o.table_number) === q);
    });
  }, [orders, filter, query]);

  const kpis = useMemo(() => {
    const paidTotal = orders.filter(isPaid).reduce((s, o) => s + (o.total ?? 0), 0);
    const unpaidTotal = orders.filter(isUnpaid).reduce((s, o) => s + (o.total ?? 0), 0);
    const by = (status: string) => orders.filter((o) => o.status === status).length;
    return [
      { label: "Nouvelles", value: String(by("received")), bar: "border-t-jaune" },
      { label: "En préparation", value: String(by("preparing")), bar: "border-t-en-preparation" },
      { label: "Prêtes", value: String(by("ready")), bar: "border-t-whatsapp" },
      { label: "À encaisser", value: formatPrice(unpaidTotal), bar: "border-t-a-encaisser" },
      { label: "Encaissé aujourd’hui", value: formatPrice(paidTotal), bar: "border-t-bordeaux" },
    ];
  }, [orders]);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    setCancelling(false);
    setReason("");
  }, [selectedId]);

  // --- Actions -----------------------------------------------------------------------------
  async function post(url: string, body?: unknown): Promise<unknown | null> {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 401) {
      window.location.assign("/gestion/connexion?suite=/gestion");
      return null;
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const first = data && typeof data === "object" ? Object.values(data as Record<string, unknown>)[0] : null;
      flash((Array.isArray(first) ? String(first[0]) : typeof first === "string" ? first : null) ?? "Action impossible pour le moment.");
      return null;
    }
    return data;
  }

  async function advance(order: StaffOrder) {
    setPending(true);
    try {
      const updated = (await post(`/api/gestion/orders/${order.id}/advance`)) as StaffOrder | null;
      if (updated) setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
    } catch {
      flash("Connexion difficile : réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }

  async function cancel(order: StaffOrder) {
    if (!reason.trim()) return flash("Indiquez le motif de l’annulation.");
    setPending(true);
    try {
      const updated = (await post(`/api/gestion/orders/${order.id}/cancel`, { reason: reason.trim() })) as StaffOrder | null;
      if (updated) {
        setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
        setCancelling(false);
        flash(`Commande n° ${updated.number} annulée.`);
      }
    } catch {
      flash("Connexion difficile : réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }

  async function markDone(request: StaffRequest) {
    const done = await post(`/api/gestion/requests/${request.id}/done`).catch(() => null);
    if (done) setRequests((list) => list.filter((r) => r.id !== request.id));
  }

  /** Addition d'une table : ses commandes non payées et non annulées (celles du jour). */
  function openSessionPayment(sessionId: number, tableNumber: number | null) {
    const unpaid = orders.filter((o) => o.session === sessionId && isUnpaid(o));
    if (!unpaid.length) return flash("Rien à encaisser pour cette table.");
    setPayTarget({ kind: "session", sessionId, tableNumber, orders: unpaid });
  }

  function openPayment(order: StaffOrder) {
    if (order.session != null) openSessionPayment(order.session, order.table_number ?? null);
    else setPayTarget({ kind: "order", order });
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "active", label: "En cours" },
    { key: "unpaid", label: "À encaisser" },
    { key: "table", label: "À table" },
    { key: "counter", label: "Comptoir" },
  ];

  return (
    <>
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <div>
          <h1 className="text-[32px]">Commandes</h1>
          <p className="text-sm text-ticket-doux">{capitalize(formatDate(`${today}T12:00:00Z`))}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-11 min-w-[240px] items-center gap-2 rounded-full border border-bordure bg-white px-3.5">
            <Search size={18} className="text-ticket-doux" aria-hidden="true" />
            <span className="sr-only">Rechercher</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="N° de commande, table…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => toggleSound(CALL)}
            aria-pressed={soundOn}
            className={`flex h-11 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-bold ${
              soundOn ? "border-bordure bg-white" : "border-jaune bg-jaune text-encre"
            }`}
          >
            {soundOn ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
            {soundOn ? "Son activé" : "Activer le son"}
          </button>
          <span
            role="status"
            className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold ${
              online ? "bg-pastille-ok text-texte-ok" : "bg-rose text-bordeaux"
            }`}
          >
            <span className={`size-[9px] rounded-full ${online ? "bg-whatsapp" : "bg-retard"}`} aria-hidden="true" />
            {online ? "Service ouvert" : "Hors ligne · reconnexion…"}
          </span>
        </div>
      </div>

      {/* Alertes : appels serveur et additions demandées */}
      {requests.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Demandes des tables">
          {requests.map((r) => {
            const bill = r.kind === "bill";
            const minutes = Math.max(0, Math.floor((now - Date.parse(r.created_at)) / 60_000));
            return (
              <li
                key={r.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-[5px] bg-white px-4 py-3 shadow-pilule ${
                  bill ? "border-a-encaisser" : "border-bordeaux"
                }`}
              >
                <span className="flex items-center gap-3">
                  {bill ? <ReceiptText size={22} className="text-a-encaisser" aria-hidden="true" /> : <BellRing size={22} className="text-bordeaux" aria-hidden="true" />}
                  <span>
                    <strong>Table {r.table_number}</strong> {bill ? "demande l’addition" : "appelle un serveur"}
                    <span className="ml-2 text-sm text-ticket-doux">{minutes === 0 ? "à l’instant" : `il y a ${minutes} min`}</span>
                  </span>
                </span>
                <span className="flex gap-2">
                  {bill && canPay && (
                    <button type="button" onClick={() => openSessionPayment(r.session, r.table_number)} className="h-10 rounded-full bg-bordeaux px-4 text-sm font-bold text-white">
                      Encaisser
                    </button>
                  )}
                  <button type="button" onClick={() => markDone(r)} className="h-10 rounded-full border-[1.5px] border-bordure px-4 text-sm font-bold">
                    C’est fait
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Indicateurs */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-[18px] border border-t-4 border-bordure bg-white px-4 py-3.5 ${k.bar}`}>
            <div className="text-[13px] font-bold text-ticket-doux">{k.label}</div>
            <div className="mt-0.5 font-display text-[28px] font-bold whitespace-nowrap">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div role="tablist" aria-label="Filtrer les commandes" className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const on = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setFilter(f.key)}
              className={`inline-flex h-[42px] items-center rounded-full border-[1.5px] px-4 text-sm font-bold ${
                on ? "border-encre bg-encre text-white" : "border-bordure bg-white"
              }`}
            >
              {f.label}
              <span className={`ml-2 rounded-full px-2 text-xs ${on ? "bg-white/20" : "bg-sable"}`}>{counts[f.key]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-start gap-[18px]">
        {/* Tableau */}
        <div className="min-w-0 flex-[999_1_520px] overflow-x-auto rounded-[20px] border border-bordure bg-white">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs tracking-[0.06em] text-ticket-doux uppercase">
                <th className="px-4 py-3.5 font-bold">Commande</th>
                <th className="px-2.5 py-3.5 font-bold">Canal</th>
                <th className="px-2.5 py-3.5 font-bold">Client / table</th>
                <th className="px-2.5 py-3.5 text-right font-bold">Montant</th>
                <th className="px-2.5 py-3.5 font-bold">Paiement</th>
                <th className="px-2.5 py-3.5 font-bold">Statut</th>
                <th className="py-3.5 pr-4 pl-2.5 font-bold">Heure</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const on = o.id === selectedId;
                const pay = payment(o);
                const status = STATUS[o.status ?? "received"];
                const channel = CHANNEL[o.channel ?? "table"];
                return (
                  <tr key={o.id} className={`border-t border-filet-ligne ${on ? "bg-ligne-active shadow-[inset_4px_0_0_var(--color-bordeaux)]" : ""}`}>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(o.id)}
                        aria-pressed={on}
                        className="min-h-10 text-left text-[15px] font-bold text-bordeaux underline underline-offset-[3px]"
                      >
                        n° {o.number}
                      </button>
                    </td>
                    <td className="px-2.5 py-3">
                      <span className={`${pill} ${channel.style}`}>{channel.label}</span>
                    </td>
                    <td className="px-2.5 py-3">{who(o)}</td>
                    <td className="px-2.5 py-3 text-right font-bold whitespace-nowrap">{formatPrice(o.total ?? 0)}</td>
                    <td className="px-2.5 py-3">
                      <span className={`${pill} ${pay.style}`}>{pay.label}</span>
                    </td>
                    <td className="px-2.5 py-3">
                      <span className={`${pill} ${status.style}`}>{status.label}</span>
                    </td>
                    <td className="py-3 pr-4 pl-2.5 whitespace-nowrap text-ticket-doux">{formatTime(o.created_at)}</td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-ticket-doux">
                    {orders.length === 0 ? "Aucune commande aujourd’hui pour le moment." : "Aucune commande ne correspond."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Détail */}
        <aside aria-label="Détail de la commande" className="flex max-w-[380px] min-w-[280px] flex-[1_1_320px] flex-col gap-3.5 rounded-[20px] border border-bordure bg-white p-5">
          {selected ? (
            <OrderDetail
              order={selected}
              role={user.role}
              pending={pending}
              cancelling={cancelling}
              reason={reason}
              onReason={setReason}
              onStartCancel={() => setCancelling(true)}
              onStopCancel={() => setCancelling(false)}
              onAdvance={() => advance(selected)}
              onCancel={() => cancel(selected)}
              onPay={() => openPayment(selected)}
              unpaidForTable={
                selected.session != null
                  ? orders.filter((o) => o.session === selected.session && isUnpaid(o)).reduce((s, o) => s + (o.total ?? 0), 0)
                  : null
              }
              sessionOpen={selected.session != null && sessions.some((s) => s.id === selected.session)}
            />
          ) : (
            <p className="py-8 text-center text-ticket-doux">Choisissez une commande dans la liste.</p>
          )}
        </aside>
      </div>

      {payTarget && (
        <PayDialog
          target={payTarget}
          onClose={() => setPayTarget(null)}
          onPaid={(receipt) => {
            flash(`Reçu ${receipt.reference} émis.`);
            reloadAll();
          }}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-full bg-encre px-5 py-3 text-sm font-bold text-white shadow-carte">
          {toast}
        </div>
      )}
    </>
  );
}

type DetailProps = {
  order: StaffOrder;
  role: string;
  pending: boolean;
  cancelling: boolean;
  reason: string;
  onReason: (value: string) => void;
  onStartCancel: () => void;
  onStopCancel: () => void;
  onAdvance: () => void;
  onCancel: () => void;
  onPay: () => void;
  unpaidForTable: number | null;
  sessionOpen: boolean;
};

function OrderDetail(props: DetailProps) {
  const { order, role } = props;
  const status = order.status ?? "received";
  const channel = CHANNEL[order.channel ?? "table"];
  const pay = payment(order);
  const next = NEXT[status];
  const canAdvance = next && (next.roles.includes(role) || role === "manager");
  const reached = FLOW.indexOf(status as (typeof FLOW)[number]);
  const receipt = receiptOf(order);
  const cancelled = status === "cancelled";

  return (
    <>
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <div className="font-display text-[26px] font-bold">n° {order.number}</div>
          <div className="text-sm text-ticket-doux">
            {who(order)} · {formatTime(order.created_at)}
            {order.created_by ? ` · saisie par ${order.created_by}` : ""}
          </div>
        </div>
        <span className={`${pill} ${channel.style}`}>{channel.label}</span>
      </div>

      {cancelled ? (
        <div className="rounded-xl bg-rose px-3 py-2.5 text-sm text-bordeaux">
          <strong>Commande annulée.</strong> {order.cancel_reason ? `Motif : ${order.cancel_reason}` : ""}
        </div>
      ) : (
        <ol className="flex gap-1">
          {FLOW.map((step, i) => (
            <li key={step} className="flex flex-1 flex-col gap-1.5">
              <span className={`h-1.5 rounded-full ${i <= reached ? "bg-bordeaux" : "bg-bordure"}`} />
              <span className={`text-[11.5px] font-bold ${i <= reached ? "text-encre" : "text-etape-inactive"}`}>{STATUS[step].label}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col gap-2 border-t border-bordure pt-3">
        {order.items.map((item, i) => (
          <div key={item.id ?? i} className="flex justify-between gap-2.5">
            <div>
              <div className="font-bold">
                {item.quantity}× {item.dish_name}
              </div>
              {item.options_label && <div className="text-[13px] text-ticket-doux">{item.options_label}</div>}
              {item.note && <div className="text-[13px] text-ticket-doux italic">« {item.note} »</div>}
            </div>
            <span className="whitespace-nowrap">{formatPrice(item.line_total ?? 0)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-bordure pt-2.5 font-display text-xl font-bold">
          <span>Total</span>
          <span className="text-bordeaux">{formatPrice(order.total ?? 0)}</span>
        </div>
      </div>

      {order.note && (
        <div className="rounded-xl bg-note px-3 py-2.5 text-[13.5px] text-note-texte">
          <strong>Note :</strong> {order.note}
        </div>
      )}
      <div className="text-sm">
        <span className="text-ticket-doux">Paiement :</span> <span className={`${pill} ${pay.style}`}>{pay.label}</span>
      </div>

      {!cancelled &&
        (next ? (
          canAdvance ? (
            <button type="button" onClick={props.onAdvance} disabled={props.pending} className="h-[52px] rounded-full bg-bordeaux text-base font-bold text-white disabled:opacity-60">
              {props.pending ? "…" : next.label}
            </button>
          ) : (
            <div className="flex h-[52px] items-center justify-center rounded-full bg-sable text-sm font-bold text-ticket-doux">{next.waiting}</div>
          )
        ) : (
          <div className="flex h-[52px] items-center justify-center rounded-full bg-pastille-ok font-bold text-texte-ok">Commande servie</div>
        ))}

      {!cancelled && receipt === null && CAN_PAY.includes(role) && (order.session == null || props.sessionOpen) && (
        <button type="button" onClick={props.onPay} className="h-12 rounded-full border-[1.5px] border-bordeaux font-bold text-bordeaux">
          {order.session != null && props.unpaidForTable
            ? `Encaisser la table · ${formatPrice(props.unpaidForTable)}`
            : `Encaisser · ${formatPrice(order.total ?? 0)}`}
        </button>
      )}

      {receipt !== null && CAN_PAY.includes(role) && (
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/gestion/recus/${receipt}/ticket`}
            target="_blank"
            rel="noopener"
            className="flex h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-encre bg-white text-sm font-bold"
          >
            <Printer size={18} aria-hidden="true" />
            Imprimer le reçu
          </a>
          <a
            href={`/api/gestion/receipts/${receipt}.pdf`}
            target="_blank"
            rel="noopener"
            className="flex h-11 items-center justify-center rounded-full border-[1.5px] border-encre bg-white text-sm font-bold"
          >
            Reçu PDF
          </a>
        </div>
      )}

      {CAN_CANCEL.includes(role) &&
        CANCELLABLE.includes(status) &&
        (props.cancelling ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-bordure p-3">
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Motif de l’annulation
              <input
                value={props.reason}
                onChange={(e) => props.onReason(e.target.value)}
                placeholder="Ex. plat en rupture, client parti…"
                maxLength={255}
                autoFocus
                className="h-11 rounded-xl border-[1.5px] border-bordure px-3 font-normal"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={props.onStopCancel} className="h-11 rounded-full border-[1.5px] border-bordure text-sm font-bold">
                Garder
              </button>
              <button type="button" onClick={props.onCancel} disabled={props.pending} className="h-11 rounded-full bg-encre text-sm font-bold text-white disabled:opacity-60">
                Confirmer l’annulation
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={props.onStartCancel} className="h-11 rounded-full border-[1.5px] border-bordure text-sm font-bold text-ticket-doux">
            Annuler la commande
          </button>
        ))}
    </>
  );
}
