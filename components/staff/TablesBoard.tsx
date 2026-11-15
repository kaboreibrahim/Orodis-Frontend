"use client";

// Tables & QR codes (maquette phase3/Tables) : les tables regroupées par zone avec leur état calculé,
// filtres par zone et par état, et la fiche d'une table (QR, chevalet, activation, modification, suppression).
// L'ajout de tables se fait sur /gestion/tables/nouvelle. Réservé au gérant.
import { Bell, Clock, Download, Pencil, Plus, Printer, RefreshCw, Trash2, Users, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StaffOrder, StaffSession, StaffTable, StaffZone } from "@/lib/api/staff";
import { formatPrice } from "@/lib/format";
import { Switch } from "./DishEditor";
import { pill } from "./labels";
import { CountUp, EASE, Reveal, RevealTitle, stagger } from "./reveal";
import { useStaffEvents } from "./useStaffEvents";

type State = "inactive" | "free" | "occupied" | "ordering" | "bill";

const STATES: Record<State, { label: string; border: string; dot: string; style: string }> = {
  free: { label: "Libre", border: "border-l-whatsapp", dot: "bg-whatsapp", style: "bg-pastille-ok text-texte-ok" },
  occupied: { label: "Occupée", border: "border-l-en-preparation", dot: "bg-en-preparation", style: "bg-pastille-preparation text-texte-preparation" },
  ordering: { label: "Commande en cours", border: "border-l-bordeaux", dot: "bg-bordeaux", style: "bg-rose text-bordeaux" },
  bill: { label: "À encaisser", border: "border-l-a-encaisser", dot: "bg-a-encaisser", style: "bg-pastille-encaisser text-note-texte" },
  inactive: { label: "Désactivée", border: "border-l-etape-inactive", dot: "bg-etape-inactive", style: "bg-pastille-terminee text-ticket-doux" },
};
const ORDER: State[] = ["free", "occupied", "ordering", "bill", "inactive"];
const CARD = "rounded-[22px] border border-bordure bg-white p-5";
const FIELD = "h-12 w-full rounded-xl border border-bordure bg-white px-3.5 text-[15px]";
const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/** « 25 min », « 1 h 05 » depuis l'ouverture de la session. */
function since(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}

type Info = { state: State; session?: StaffSession; waiter: boolean };
type Props = { initialTables: StaffTable[]; zones: StaffZone[]; initialSessions: StaffSession[]; initialActive: StaffOrder[] };

export function TablesBoard({ initialTables, zones, initialSessions, initialActive }: Props) {
  const [tables, setTables] = useState(initialTables);
  const [sessions, setSessions] = useState(initialSessions);
  const [active, setActive] = useState(initialActive);
  const [zone, setZone] = useState<number | "all">("all");
  const [filter, setFilter] = useState<State | "all">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState<number | null>(null); // lu après le montage : l'heure du serveur et celle du navigateur diffèrent

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Sur téléphone, la fiche s'affiche sous la liste : on l'amène à l'écran quand une table est choisie.
  const sheet = useRef<HTMLElement>(null);
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
    window.setTimeout(() => setToast(null), 3500);
  }

  const reload = useCallback(async () => {
    try {
      const [s, o] = await Promise.all([
        fetch("/api/gestion/sessions", { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
        fetch("/api/gestion/orders?status=received,preparing,ready", { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      ]);
      setSessions(s);
      setActive(o.results);
    } catch {
      // l'état sera rechargé à la prochaine connexion
    }
  }, []);

  // Toute activité des tables (commande, statut, appel, paiement) change leur état : on recharge.
  const { online } = useStaffEvents(() => reload(), reload);

  const infos = useMemo(() => {
    const map = new Map<number, Info>();
    for (const table of tables) {
      if (!table.is_active) {
        map.set(table.id, { state: "inactive", waiter: false });
        continue;
      }
      const session = sessions.find((s) => s.table.number === table.number);
      const waiter = session?.open_requests.includes("waiter") ?? false;
      let state: State = "free";
      if (session && (session.status === "bill_requested" || session.open_requests.includes("bill"))) state = "bill";
      // Une commande encore en cuisine compte même si l'addition a déjà été réglée (paiement « maintenant »).
      else if (active.some((o) => o.table_number === table.number)) state = "ordering";
      else if (session) state = "occupied";
      map.set(table.id, { state, session, waiter });
    }
    return map;
  }, [tables, sessions, active]);
  const infoOf = (table: StaffTable): Info => infos.get(table.id) ?? { state: "free", waiter: false };

  const inZone = useMemo(() => tables.filter((t) => zone === "all" || t.zone === zone), [tables, zone]);
  const counts = useMemo(() => {
    const result: Record<State, number> = { free: 0, occupied: 0, ordering: 0, bill: 0, inactive: 0 };
    for (const table of inZone) result[infos.get(table.id)?.state ?? "free"] += 1;
    return result;
  }, [inZone, infos]);
  const shown = inZone.filter((t) => filter === "all" || infoOf(t).state === filter);
  const groups = (zone === "all" ? zones : zones.filter((z) => z.id === zone))
    .map((z) => ({ zone: z, tables: shown.filter((t) => t.zone === z.id) }))
    .filter((group) => group.tables.length > 0);

  const selected = tables.find((t) => t.id === selectedId) ?? null;
  const seats = tables.filter((t) => t.is_active).reduce((n, t) => n + (t.seats ?? 0), 0);
  const running = sessions.reduce((sum, s) => sum + s.total, 0);
  const calls = sessions.filter((s) => s.open_requests.length > 0).length;
  const busyTables = tables.filter((t) => ["occupied", "ordering", "bill"].includes(infoOf(t).state)).length;
  const freeTables = tables.filter((t) => infoOf(t).state === "free").length;

  async function send<T = StaffTable>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T | null> {
    setBusy(true);
    try {
      const response = await fetch(url, {
        method,
        cache: "no-store",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (response.status === 401) {
        window.location.assign("/gestion/connexion?suite=/gestion/tables");
        return null;
      }
      const data = response.status === 204 ? {} : await response.json().catch(() => null);
      if (!response.ok) {
        const first = data && typeof data === "object" ? Object.values(data as Record<string, unknown>)[0] : null;
        flash((Array.isArray(first) ? String(first[0]) : typeof first === "string" ? first : null) ?? "Action impossible pour le moment.");
        return null;
      }
      return data as T;
    } catch {
      flash("Connexion difficile : réessayez dans un instant.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const replace = (table: StaffTable) => setTables((list) => list.map((t) => (t.id === table.id ? table : t)).sort((a, b) => a.number - b.number));

  async function toggleActive(table: StaffTable) {
    const updated = await send(`/api/gestion/tables/${table.id}`, "PATCH", { is_active: !table.is_active });
    if (updated) {
      replace(updated);
      flash(updated.is_active ? `Table ${updated.number} réactivée.` : `Table ${updated.number} désactivée : son QR ne prend plus de commande.`);
    }
  }

  async function regenerate(table: StaffTable) {
    const updated = await send(`/api/gestion/tables/${table.id}/regenerate-qr`, "POST");
    if (updated) {
      replace(updated);
      flash(`Nouveau QR pour la table ${updated.number} (v${updated.qr_version}) : imprimez le nouveau chevalet.`);
    }
    return Boolean(updated);
  }

  async function update(table: StaffTable, changes: { number: number; zone: number; seats: number }) {
    const updated = await send(`/api/gestion/tables/${table.id}`, "PATCH", changes);
    if (updated) {
      replace(updated);
      flash(`Table ${updated.number} enregistrée.`);
    }
    return Boolean(updated);
  }

  async function remove(table: StaffTable) {
    const done = await send<object>(`/api/gestion/tables/${table.id}`, "DELETE");
    if (done) {
      setTables((list) => list.filter((t) => t.id !== table.id));
      setSelectedId(null);
      flash(`Table ${table.number} supprimée.`);
    }
    return Boolean(done);
  }

  const stats = [
    { label: "Tables libres", value: freeTables, hint: `sur ${tables.filter((t) => t.is_active).length} actives`, dot: "bg-whatsapp" },
    { label: "Tables occupées", value: busyTables, hint: `${seats} places au total`, dot: "bg-en-preparation" },
    { label: "Appels en attente", value: calls, hint: calls > 0 ? "serveur ou addition demandés" : "aucune demande", dot: "bg-bordeaux" },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <RevealTitle text="Tables & QR codes" className="text-[32px]" />
          <p className="text-sm text-ticket-doux">
            {tables.length} {tables.length > 1 ? "tables" : "table"} · {zones.length} {zones.length > 1 ? "zones" : "zone"}
            {!online && " · hors ligne, reconnexion…"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <a
            href="/api/gestion/tables/qr-sheet.pdf"
            target="_blank"
            rel="noopener"
            className="flex h-11 items-center gap-2 rounded-full border-[1.5px] border-encre bg-white px-[18px] text-sm font-bold"
          >
            <Printer size={18} aria-hidden="true" />
            Imprimer tous les chevalets
          </a>
          <Link href="/gestion/tables/nouvelle" className="flex h-11 items-center gap-1.5 rounded-full bg-bordeaux px-[18px] text-sm font-bold text-white shadow-bouton">
            <Plus size={17} aria-hidden="true" />
            Ajouter une table
          </Link>
        </div>
      </div>

      {/* La salle en quatre chiffres */}
      <motion.div variants={stagger} initial="hidden" animate="shown" className="grid grid-cols-2 gap-3 sm:gap-[18px] xl:grid-cols-4">
        <Reveal className="col-span-2 flex flex-col gap-1.5 rounded-[22px] bg-bordeaux p-5 text-white shadow-relief xl:col-span-1">
          <span className="text-sm font-medium text-texte-nav">Additions en cours</span>
          <CountUp value={running} format={formatPrice} className="font-display text-[30px] font-bold leading-none" />
          <span className="text-[13px] text-texte-nav">
            {sessions.length} {sessions.length > 1 ? "tables ouvertes" : "table ouverte"}
          </span>
        </Reveal>
        {stats.map((stat, index) => (
          <Reveal key={stat.label} className={`${CARD} flex flex-col gap-1.5 ${index === 2 ? "col-span-2 xl:col-span-1" : ""}`}>
            <span className="flex items-center gap-2 text-sm font-medium text-ticket-doux">
              <span className={`size-2.5 rounded-full ${stat.dot}`} aria-hidden="true" />
              {stat.label}
            </span>
            <CountUp value={stat.value} className="font-display text-[30px] font-bold leading-none" />
            <span className="text-[13px] text-ticket-doux">{stat.hint}</span>
          </Reveal>
        ))}
      </motion.div>

      {/* Filtres : zone, puis état */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5">
        <div role="group" aria-label="Filtrer par zone" className="flex flex-wrap gap-1 rounded-[26px] bg-encre p-1">
          {[{ id: "all" as const, name: "Toutes les zones" }, ...zones].map((z) => {
            const on = zone === z.id;
            return (
              <button key={z.id} type="button" aria-pressed={on} onClick={() => setZone(z.id)} className={`relative h-11 rounded-full px-4 text-sm font-bold transition-colors ${on ? "text-encre" : "text-texte-nav hover:text-white"}`}>
                {on && <motion.span layoutId="zone-filtre" className="absolute inset-0 rounded-full bg-creme" transition={SPRING} aria-hidden="true" />}
                <span className="relative">{z.name}</span>
              </button>
            );
          })}
        </div>
        <div role="group" aria-label="Filtrer par état" className="flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={`h-11 rounded-full border-[1.5px] px-3.5 text-[13px] font-bold ${filter === "all" ? "border-encre bg-white" : "border-transparent text-ticket-doux"}`}>
            Tous {inZone.length}
          </button>
          {ORDER.map((state) => {
            const on = filter === state;
            return (
              <button
                key={state}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(on ? "all" : state)}
                disabled={counts[state] === 0 && !on}
                className={`flex h-11 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-[13px] font-bold disabled:opacity-40 ${on ? "border-encre bg-white" : "border-transparent text-texte-doux"}`}
              >
                <span className={`size-2.5 rounded-full ${STATES[state].dot}`} aria-hidden="true" />
                {STATES[state].label} {counts[state]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-[18px]">
        {/* Tables par zone */}
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          {tables.length === 0 && (
            <div className={`${CARD} flex flex-col items-center gap-3 py-10 text-center`}>
              <p className="max-w-[340px] text-ticket-doux">Aucune table pour l’instant. Créez les tables de la salle : chacune reçoit son QR code à poser sur un chevalet.</p>
              <Link href="/gestion/tables/nouvelle" className="flex h-11 items-center rounded-full bg-bordeaux px-5 text-sm font-bold text-white">
                Créer les premières tables
              </Link>
            </div>
          )}
          {tables.length > 0 && groups.length === 0 && <p className="py-8 text-center text-ticket-doux">Aucune table ne correspond à ces filtres.</p>}
          {groups.map((group) => (
            <section key={group.zone.id} aria-label={`Zone ${group.zone.name}`} className="flex flex-col gap-2.5">
              <h2 className="flex items-baseline gap-2 text-xl">
                {group.zone.name}
                <span className="font-sans text-[13px] font-medium text-ticket-doux">
                  {group.tables.length} {group.tables.length > 1 ? "tables" : "table"} · {group.tables.reduce((n, t) => n + (t.seats ?? 0), 0)} places
                </span>
              </h2>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {group.tables.map((table) => {
                    const { state, session, waiter } = infoOf(table);
                    const s = STATES[state];
                    const on = table.id === selectedId;
                    return (
                      <motion.li
                        layout
                        key={table.id}
                        initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                        transition={{ duration: 0.35, ease: EASE }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedId(on ? null : table.id)}
                          aria-pressed={on}
                          aria-label={`Table ${table.number}, ${s.label}`}
                          className={`flex min-h-[132px] w-full flex-col items-start gap-1.5 rounded-[18px] border-l-[5px] bg-white p-3.5 text-left transition-shadow ${s.border} ${
                            on ? "shadow-[0_0_0_3px_var(--color-bordeaux)]" : "shadow-pilule hover:shadow-carte"
                          } ${state === "inactive" ? "opacity-70" : ""}`}
                        >
                          <span className="flex w-full items-start justify-between">
                            <span className="font-display text-[34px] font-bold leading-none">{table.number}</span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-ticket-doux">
                              {waiter && (
                                <span className="flex size-6 items-center justify-center rounded-full bg-bordeaux text-white" title="Appel serveur">
                                  <Bell size={13} aria-label="Appel serveur" />
                                </span>
                              )}
                              <Users size={14} aria-hidden="true" />
                              {table.seats}
                            </span>
                          </span>
                          <span className={`${pill} ${s.style}`}>{s.label}</span>
                          {session ? (
                            <span className="mt-auto flex w-full items-end justify-between gap-2 text-xs text-ticket-doux">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={13} aria-hidden="true" />
                                {now ? since(session.created_at, now) : "…"}
                              </span>
                              {session.total > 0 && <span className="text-sm font-bold tabular-nums text-encre">{formatPrice(session.total)}</span>}
                            </span>
                          ) : (
                            <span className="mt-auto text-xs text-ticket-doux">{state === "inactive" ? "QR hors service" : state === "ordering" ? "Commande en cuisine" : "Prête à accueillir"}</span>
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </section>
          ))}
        </div>

        {/* Fiche de la table choisie */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.aside
              key={selected.id}
              ref={sheet}
              aria-label={`Table ${selected.number}`}
              initial={{ opacity: 0, x: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className={`${CARD} flex min-w-[280px] max-w-full flex-[1_1_320px] scroll-mt-4 flex-col gap-4 xl:max-w-[380px]`}
            >
              <TableSheet
                table={selected}
                info={infoOf(selected)}
                zones={zones}
                now={now}
                busy={busy}
                onClose={() => setSelectedId(null)}
                onToggle={() => toggleActive(selected)}
                onRegenerate={() => regenerate(selected)}
                onUpdate={(changes) => update(selected, changes)}
                onRemove={() => remove(selected)}
              />
            </motion.aside>
          ) : (
            tables.length > 0 && (
              <motion.aside key="vide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden min-w-[280px] flex-[1_1_320px] rounded-[22px] border-[1.5px] border-dashed border-bordure p-6 text-center text-sm text-ticket-doux xl:block xl:max-w-[380px]">
                Choisissez une table pour voir son QR code, imprimer son chevalet ou la modifier.
              </motion.aside>
            )
          )}
        </AnimatePresence>
      </div>

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

type SheetProps = {
  table: StaffTable;
  info: Info;
  zones: StaffZone[];
  now: number | null;
  busy: boolean;
  onClose: () => void;
  onToggle: () => void;
  onRegenerate: () => Promise<boolean>;
  onUpdate: (changes: { number: number; zone: number; seats: number }) => Promise<boolean>;
  onRemove: () => Promise<boolean>;
};

/** Fiche d'une table : état, QR, chevalet, activation, puis modification, régénération et suppression (confirmées sur place). */
function TableSheet({ table, info, zones, now, busy, onClose, onToggle, onRegenerate, onUpdate, onRemove }: SheetProps) {
  const [mode, setMode] = useState<"view" | "edit" | "regenerate" | "remove">("view");
  const [number, setNumber] = useState(String(table.number));
  const [zone, setZone] = useState(table.zone);
  const [seats, setSeats] = useState(String(table.seats ?? 4));
  const s = STATES[info.state];
  const { session } = info;
  const occupied = Boolean(session);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const ok = await onUpdate({ number: Number(number) || table.number, zone, seats: Math.max(1, Number(seats) || 1) });
    if (ok) setMode("view");
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[28px] leading-tight">Table {table.number}</h2>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ticket-doux">
            <span className={`${pill} ${s.style}`}>{s.label}</span>
            {table.zone_name} · {table.seats} {(table.seats ?? 0) > 1 ? "places" : "place"}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer la fiche" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-sable">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {session && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-creme p-3.5 text-sm">
          <span>
            <span className="font-bold">
              {session.orders_count} {session.orders_count > 1 ? "commandes" : "commande"} · {formatPrice(session.total)}
            </span>
            <span className="block text-[13px] text-ticket-doux">
              Ouverte depuis {now ? since(session.created_at, now) : "…"}
              {info.waiter && " · appel serveur en attente"}
            </span>
          </span>
          <Link href="/gestion" className="flex h-11 shrink-0 items-center rounded-full bg-encre px-4 text-sm font-bold text-white">
            Voir
          </Link>
        </div>
      )}

      <div className="relative flex w-[200px] flex-col items-center gap-2.5 self-center rounded-[18px] border border-bordure bg-creme p-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- image servie par le relais authentifié, non optimisable */}
        <img
          src={`/api/gestion/tables/${table.id}/qr.png?v=${table.qr_version}`}
          alt={`QR code de la table ${table.number}`}
          width={168}
          height={168}
          className={`size-[168px] transition-opacity ${table.is_active ? "" : "opacity-25"}`}
        />
        {!table.is_active && (
          <span className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-encre px-3 py-1.5 text-xs font-bold whitespace-nowrap text-white">QR désactivé</span>
        )}
        <span className="text-center text-xs break-all text-ticket-doux">{table.qr_url.replace(/^https?:\/\//, "")}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={`/api/gestion/tables/qr-sheet.pdf?number=${table.number}`}
          target="_blank"
          rel="noopener"
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-bordeaux px-2 text-sm font-bold whitespace-nowrap text-white"
        >
          <Printer size={16} aria-hidden="true" />
          Chevalet
        </a>
        <a
          href={`/api/gestion/tables/${table.id}/qr.png?v=${table.qr_version}`}
          download={`table-${table.number}-qr.png`}
          className="flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-encre bg-white text-sm font-bold"
        >
          <Download size={16} aria-hidden="true" />
          Image PNG
        </a>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-creme p-3.5 text-sm">
        <span>
          <span className="font-bold">Table active</span>
          <span className="block text-[13px] text-ticket-doux">{table.is_active ? "Son QR code accepte les commandes." : "Son QR code ne prend plus de commande."}</span>
        </span>
        <Switch checked={table.is_active ?? true} onChange={() => !busy && onToggle()} label={`Table ${table.number} active`} />
      </div>

      {mode === "view" && (
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("edit")} className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-bordure px-2 text-[13px] font-bold">
            <Pencil size={15} aria-hidden="true" />
            Modifier
          </button>
          <button type="button" onClick={() => setMode("regenerate")} className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-bordure px-2 text-[13px] font-bold whitespace-nowrap">
            <RefreshCw size={15} aria-hidden="true" />
            Nouveau QR
          </button>
          <button type="button" onClick={() => setMode("remove")} aria-label={`Supprimer la table ${table.number}`} className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-bordure text-retard hover:bg-rose">
            <Trash2 size={17} aria-hidden="true" />
          </button>
        </div>
      )}

      {mode === "edit" && (
        <form onSubmit={save} className="flex flex-col gap-3 rounded-2xl border border-bordure p-3.5" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Numéro
              <input className={FIELD} inputMode="numeric" value={number} onChange={(event) => setNumber(event.target.value.replace(/\D/g, ""))} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Places
              <input className={FIELD} inputMode="numeric" value={seats} onChange={(event) => setSeats(event.target.value.replace(/\D/g, ""))} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Zone
            <select className={FIELD} value={zone} onChange={(event) => setZone(Number(event.target.value))}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
          <p className="text-[12.5px] text-ticket-doux">Changer le numéro ne change pas le QR code : pensez seulement à réimprimer le chevalet, qui affiche le numéro.</p>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="h-11 flex-1 rounded-full bg-bordeaux px-4 text-sm font-bold text-white disabled:opacity-60">
              Enregistrer
            </button>
            <button type="button" onClick={() => setMode("view")} className="h-11 rounded-full border-[1.5px] border-bordure px-4 text-sm font-bold text-ticket-doux">
              Annuler
            </button>
          </div>
        </form>
      )}

      {mode === "regenerate" && (
        <div role="alertdialog" aria-label="Régénérer le QR code" className="flex flex-col gap-3 rounded-2xl bg-pastille-attente p-3.5 text-sm text-texte-attente">
          <p>
            <span className="font-bold">Créer un nouveau QR code ?</span> L’ancien chevalet ne fonctionnera plus : il faudra imprimer le nouveau. Utile si un chevalet a été photographié et partagé.
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={async () => (await onRegenerate()) && setMode("view")} className="h-11 flex-1 rounded-full bg-encre px-4 text-sm font-bold text-white disabled:opacity-60">
              Oui, nouveau QR
            </button>
            <button type="button" onClick={() => setMode("view")} className="h-11 rounded-full border-[1.5px] border-texte-attente px-4 text-sm font-bold">
              Annuler
            </button>
          </div>
        </div>
      )}

      {mode === "remove" && (
        <div role="alertdialog" aria-label="Supprimer la table" className="flex flex-col gap-3 rounded-2xl bg-rose p-3.5 text-sm text-retard">
          <p>
            <span className="font-bold">Supprimer la table {table.number} ?</span>{" "}
            {occupied ? "Elle est occupée en ce moment : encaissez d’abord." : "Son QR code cessera de fonctionner. Une table qui a déjà reçu des clients ne peut qu’être désactivée."}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={busy || occupied} onClick={async () => (await onRemove()) || setMode("view")} className="h-11 flex-1 rounded-full bg-retard px-4 text-sm font-bold text-white disabled:opacity-50">
              Supprimer
            </button>
            <button type="button" onClick={() => setMode("view")} className="h-11 rounded-full border-[1.5px] border-retard px-4 text-sm font-bold">
              Annuler
            </button>
          </div>
        </div>
      )}

      <p className="text-[12.5px] text-ticket-doux">QR code version {table.qr_version}.</p>
    </>
  );
}
