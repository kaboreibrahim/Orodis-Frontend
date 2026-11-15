"use client";

// Gestion des commandes (maquette phase3/Gestion) : indicateurs du jour (cliquables pour filtrer), filtres,
// liste des commandes avec l'action suivante sur chaque ligne, fiche de la commande (avancement, annulation,
// encaissement, reçus) et alertes « appel serveur » / « addition » en tête.
// Temps réel par polling (useStaffEvents) ; à l’ouverture et après chaque coupure, tout est rechargé par REST.
import { BellRing, Clock, Printer, QrCode, ReceiptText, Search, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
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
import { CountUp, EASE, Reveal, RevealTitle, stagger } from "./reveal";
import { type StaffEvent, useStaffEvents } from "./useStaffEvents";
import { useStaffSound } from "./useStaffSound";

const SOUND_KEY = "orodis-gestion-son";
const NEW_ORDER = "/sons/nouvelle-commande.mp3";
const CALL = "/sons/appel-serveur.mp3";
const TIMESTAMP: Record<string, keyof StaffOrder> = { preparing: "accepted_at", ready: "ready_at", served: "served_at" };

const ACTIVE = ["received", "preparing", "ready"];
const LATE_MINUTES = 20; // au-delà, la durée d'une commande en cours passe en rouge
const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

type Filter = "all" | "active" | "unpaid" | "table" | "counter" | "received" | "preparing" | "ready";

/** « à l’instant », « 12 min », « 1 h 05 ». */
function elapsed(iso: string, now: number): { text: string; minutes: number } {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));
  const text = minutes === 0 ? "à l’instant" : minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
  return { text, minutes };
}

/** « 2× Kedjenou de poulet, 1× Alloco » : les plats d'une commande sur une ligne. */
const summary = (order: StaffOrder) => order.items.map((item) => `${item.quantity}× ${item.dish_name}`).join(", ");

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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [fresh, setFresh] = useState<number[]>([]); // commandes arrivées pendant que l'écran est ouvert : surlignées quelques secondes
  const [pending, setPending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [payTarget, setPayTarget] = useState<PayTarget | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null); // lu après le montage : l'heure du serveur et celle du navigateur diffèrent
  const sheet = useRef<HTMLElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const { soundOn, toggleSound, play } = useStaffSound(SOUND_KEY);
  const canPay = CAN_PAY.includes(user.role);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  // Sur téléphone, la fiche s'affiche sous la liste : on l'amène à l'écran quand une commande est choisie.
  useEffect(() => {
    if (selectedId === null) return;
    const timer = window.setTimeout(() => {
      const box = sheet.current?.getBoundingClientRect();
      if (box && (box.top > window.innerHeight - 120 || box.bottom < 0)) sheet.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [selectedId]);

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
      setFresh((list) => [...list, order.id]);
      window.setTimeout(() => setFresh((list) => list.filter((id) => id !== order.id)), 6000);
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
      active: orders.filter((o) => ACTIVE.includes(o.status ?? "")).length,
      unpaid: orders.filter(isUnpaid).length,
      table: orders.filter((o) => o.channel === "table").length,
      counter: orders.filter((o) => o.channel === "counter").length,
    }),
    [orders],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^n°\s*/, "");
    return orders.filter((o) => {
      if (filter === "active" && !ACTIVE.includes(o.status ?? "")) return false;
      if (ACTIVE.includes(filter) && o.status !== filter) return false;
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
    const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;
    return [
      { key: "received" as Filter, label: "Nouvelles", value: by("received"), money: false, dot: "bg-jaune", hint: "à lancer en cuisine" },
      { key: "preparing" as Filter, label: "En préparation", value: by("preparing"), money: false, dot: "bg-en-preparation", hint: "en cuisine" },
      { key: "ready" as Filter, label: "Prêtes", value: by("ready"), money: false, dot: "bg-whatsapp", hint: "à servir" },
      { key: "unpaid" as Filter, label: "À encaisser", value: unpaidTotal, money: true, dot: "bg-a-encaisser", hint: plural(orders.filter(isUnpaid).length, "commande", "commandes") },
      { key: null, label: "Encaissé aujourd’hui", value: paidTotal, money: true, dot: "", hint: plural(orders.filter(isPaid).length, "commande payée", "commandes payées") },
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
    <MotionConfig reducedMotion="user">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <RevealTitle text="Commandes" className="text-[32px]" />
          <p className="text-sm text-ticket-doux">{capitalize(formatDate(`${today}T12:00:00Z`))}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-bordure bg-white px-3.5 sm:flex-none">
            <Search size={18} className="shrink-0 text-ticket-doux" aria-hidden="true" />
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
            <span className="relative flex size-[9px]" aria-hidden="true">
              {online && <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-60 motion-reduce:hidden" />}
              <span className={`relative size-[9px] rounded-full ${online ? "bg-whatsapp" : "bg-retard"}`} />
            </span>
            {online ? "En direct" : "Hors ligne · reconnexion…"}
          </span>
        </div>
      </div>

      {/* Alertes : appels serveur et additions demandées */}
      <ul className="flex flex-col gap-2 empty:hidden" aria-label="Demandes des tables">
        <AnimatePresence initial={false}>
          {requests.map((r) => {
            const bill = r.kind === "bill";
            return (
              <motion.li
                layout
                key={r.id}
                initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-l-[5px] bg-white px-4 py-3 shadow-pilule ${
                  bill ? "border-a-encaisser" : "border-bordeaux"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bill ? "bg-pastille-encaisser text-texte-attente" : "bg-rose text-bordeaux"}`}>
                    {bill ? <ReceiptText size={20} aria-hidden="true" /> : <BellRing size={20} aria-hidden="true" />}
                  </span>
                  <span>
                    <strong>Table {r.table_number}</strong> {bill ? "demande l’addition" : "appelle un serveur"}
                    <span className="block text-[13px] text-ticket-doux">{now ? (elapsed(r.created_at, now).minutes === 0 ? "à l’instant" : `il y a ${elapsed(r.created_at, now).text}`) : ""}</span>
                  </span>
                </span>
                <span className="flex gap-2">
                  {bill && canPay && (
                    <button type="button" onClick={() => openSessionPayment(r.session, r.table_number)} className="h-11 rounded-full bg-bordeaux px-4 text-sm font-bold text-white">
                      Encaisser
                    </button>
                  )}
                  <button type="button" onClick={() => markDone(r)} className="h-11 rounded-full border-[1.5px] border-bordure px-4 text-sm font-bold">
                    C’est fait
                  </button>
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      {/* Indicateurs : un clic filtre la liste */}
      <motion.div variants={stagger} initial="hidden" animate="shown" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-[18px] xl:grid-cols-5">
        {kpis.map((k) => {
          const on = k.key !== null && filter === k.key;
          const body = (
            <>
              <span className={`flex items-center gap-2 text-sm font-medium ${k.key === null ? "text-texte-nav" : "text-ticket-doux"}`}>
                {k.dot && <span className={`size-2.5 rounded-full ${k.dot}`} aria-hidden="true" />}
                {k.label}
              </span>
              <CountUp value={k.value} format={k.money ? formatPrice : String} className="font-display text-[28px] font-bold leading-none whitespace-nowrap" />
              <span className={`text-[13px] ${k.key === null ? "text-texte-nav" : "text-ticket-doux"}`}>{k.hint}</span>
            </>
          );
          return k.key === null ? (
            <Reveal key={k.label} className="col-span-2 flex flex-col gap-1.5 rounded-[22px] bg-bordeaux p-4 text-white shadow-relief sm:col-span-1 sm:p-5">
              {body}
            </Reveal>
          ) : (
            <Reveal key={k.label}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(on ? "all" : (k.key as Filter))}
                className={`flex h-full w-full flex-col gap-1.5 rounded-[22px] border bg-white p-4 text-left transition-shadow sm:p-5 ${
                  on ? "border-encre shadow-[0_0_0_2px_var(--color-encre)]" : "border-bordure hover:shadow-pilule"
                }`}
              >
                {body}
              </button>
            </Reveal>
          );
        })}
      </motion.div>

      {/* Filtres */}
      <div role="group" aria-label="Filtrer les commandes" className="flex max-w-full gap-1 self-start overflow-x-auto rounded-[26px] bg-encre p-1">
        {filters.map((f) => {
          const on = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f.key)}
              className={`relative inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition-colors ${on ? "text-encre" : "text-texte-nav hover:text-white"}`}
            >
              {on && <motion.span layoutId="filtre-commandes" className="absolute inset-0 rounded-full bg-creme" transition={SPRING} aria-hidden="true" />}
              <span className="relative">
                {f.label} <span className="ml-1 font-medium opacity-70">{counts[f.key as keyof typeof counts]}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-start gap-[18px]">
        {/* Liste des commandes */}
        <section aria-label="Commandes du jour" className="min-w-0 flex-[999_1_520px]">
          {shown.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[22px] border border-bordure bg-white px-5 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-sable text-ticket-doux">
                <QrCode size={26} aria-hidden="true" />
              </span>
              {orders.length === 0 ? (
                <>
                  <p className="font-display text-xl font-bold">Aucune commande pour le moment</p>
                  <p className="max-w-[380px] text-sm text-ticket-doux">
                    Les commandes passées depuis les QR codes des tables arrivent ici toutes seules, avec un signal sonore.
                  </p>
                  {user.role === "manager" && (
                    <Link href="/gestion/tables" className="flex h-11 items-center rounded-full border-[1.5px] border-encre px-5 text-sm font-bold">
                      Voir les tables et leurs QR codes
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <p className="font-display text-xl font-bold">Aucune commande ne correspond</p>
                  <button type="button" onClick={() => (setFilter("all"), setQuery(""))} className="h-11 rounded-full border-[1.5px] border-encre px-5 text-sm font-bold">
                    Tout afficher
                  </button>
                </>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((o) => {
                  const on = o.id === selectedId;
                  const pay = payment(o);
                  const status = o.status ?? "received";
                  const next = NEXT[status];
                  const canAdvance = next && (next.roles.includes(user.role) || user.role === "manager");
                  const running = ACTIVE.includes(status);
                  const wait = now && running ? elapsed(o.created_at, now) : null;
                  return (
                    <motion.li
                      layout
                      key={o.id}
                      initial={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(6px)" }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[18px] border bg-white p-2.5 transition-shadow ${
                        on ? "border-bordeaux shadow-[0_0_0_2px_var(--color-bordeaux)]" : fresh.includes(o.id) ? "border-jaune shadow-[0_0_0_3px_var(--color-jaune)]" : "border-bordure hover:shadow-pilule"
                      } ${status === "cancelled" ? "opacity-70" : ""}`}
                    >
                      <button type="button" onClick={() => setSelectedId(on ? null : o.id)} aria-pressed={on} className="flex min-h-14 min-w-[240px] flex-1 items-center gap-3 rounded-xl px-1.5 text-left">
                        <span className="flex w-[68px] shrink-0 flex-col">
                          <span className="font-display text-[22px] font-bold leading-none text-bordeaux">n° {o.number}</span>
                          <span className="mt-1 text-xs text-ticket-doux tabular-nums">{formatTime(o.created_at)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold">{who(o)}</span>
                            <span className={`${pill} ${STATUS[status].style}`}>{STATUS[status].label}</span>
                          </span>
                          <span className="mt-0.5 block truncate text-[13px] text-ticket-doux">{summary(o)}</span>
                        </span>
                      </button>
                      <span className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 pr-1.5">
                        {wait && (
                          <span className={`inline-flex items-center gap-1 text-[13px] ${wait.minutes >= LATE_MINUTES ? "font-bold text-retard" : "text-ticket-doux"}`}>
                            <Clock size={14} aria-hidden="true" />
                            {wait.text}
                          </span>
                        )}
                        <span className="flex flex-col items-end">
                          <span className="font-bold tabular-nums whitespace-nowrap">{formatPrice(o.total ?? 0)}</span>
                          <span className={`${pill} ${pay.style}`}>{pay.label}</span>
                        </span>
                        {canAdvance && (
                          <button type="button" onClick={() => advance(o)} disabled={pending} className="h-11 rounded-full bg-encre px-4 text-[13px] font-bold whitespace-nowrap text-white disabled:opacity-60">
                            {next.label}
                          </button>
                        )}
                      </span>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </section>

        {/* Fiche de la commande */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.aside
              key={selected.id}
              ref={sheet}
              aria-label={`Commande n° ${selected.number}`}
              initial={{ opacity: 0, x: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex max-w-full min-w-[280px] flex-[1_1_320px] scroll-mt-4 flex-col gap-3.5 rounded-[22px] border border-bordure bg-white p-5 xl:max-w-[380px]"
            >
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
                onClose={() => setSelectedId(null)}
                unpaidForTable={
                  selected.session != null
                    ? orders.filter((o) => o.session === selected.session && isUnpaid(o)).reduce((s, o) => s + (o.total ?? 0), 0)
                    : null
                }
                sessionOpen={selected.session != null && sessions.some((s) => s.id === selected.session)}
              />
            </motion.aside>
          ) : (
            orders.length > 0 && (
              <motion.aside key="vide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden min-w-[280px] flex-[1_1_320px] rounded-[22px] border-[1.5px] border-dashed border-bordure p-6 text-center text-sm text-ticket-doux xl:block xl:max-w-[380px]">
                Choisissez une commande pour voir son détail, l’encaisser ou imprimer son reçu.
              </motion.aside>
            )
          )}
        </AnimatePresence>
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

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className="fixed bottom-5 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-[22px] bg-encre px-5 py-3 text-center text-sm font-bold text-white shadow-carte"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
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
  onClose: () => void;
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
          <h2 className="text-[26px] leading-tight">n° {order.number}</h2>
          <div className="text-sm text-ticket-doux">
            {who(order)} · {formatTime(order.created_at)}
            {order.created_by ? ` · saisie par ${order.created_by}` : ""}
          </div>
        </div>
        <span className="flex items-center gap-1">
          <span className={`${pill} ${channel.style}`}>{channel.label}</span>
          <button type="button" onClick={props.onClose} aria-label="Fermer la fiche" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-sable">
            <X size={20} aria-hidden="true" />
          </button>
        </span>
      </div>

      {cancelled ? (
        <div className="rounded-xl bg-rose px-3 py-2.5 text-sm text-bordeaux">
          <strong>Commande annulée.</strong> {order.cancel_reason ? `Motif : ${order.cancel_reason}` : ""}
        </div>
      ) : (
        <ol className="flex gap-1">
          {FLOW.map((step, i) => (
            <li key={step} className="flex flex-1 flex-col gap-1.5">
              <span className="h-1.5 overflow-hidden rounded-full bg-bordure">
                <motion.span className="block h-full rounded-full bg-bordeaux" initial={false} animate={{ width: i <= reached ? "100%" : "0%" }} transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }} />
              </span>
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
