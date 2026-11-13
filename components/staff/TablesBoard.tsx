"use client";

// Tables & QR codes (maquette phase3/Tables) : plan par zone avec l'état calculé de chaque table,
// QR code, activation, régénération, chevalet A5 et ajout de table. Réservé au gérant.
import { Bell, Download, Printer, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { StaffOrder, StaffSession, StaffTable, StaffZone } from "@/lib/api/staff";
import { formatPrice } from "@/lib/format";
import { pill } from "./labels";
import { useStaffEvents } from "./useStaffEvents";

type State = "inactive" | "free" | "occupied" | "ordering" | "bill";

const STATES: Record<State, { label: string; border: string; dot: string; style: string }> = {
  free: { label: "Libre", border: "border-l-whatsapp", dot: "bg-whatsapp", style: "bg-pastille-ok text-texte-ok" },
  occupied: { label: "Occupée", border: "border-l-en-preparation", dot: "bg-en-preparation", style: "bg-pastille-preparation text-texte-preparation" },
  ordering: { label: "Commande en cours", border: "border-l-bordeaux", dot: "bg-bordeaux", style: "bg-rose text-bordeaux" },
  bill: { label: "À encaisser", border: "border-l-a-encaisser", dot: "bg-a-encaisser", style: "bg-pastille-encaisser text-note-texte" },
  inactive: { label: "Désactivée", border: "border-l-etape-inactive", dot: "bg-etape-inactive", style: "bg-pastille-terminee text-ticket-doux" },
};
const LEGEND: State[] = ["free", "occupied", "ordering", "bill", "inactive"];

type Props = { initialTables: StaffTable[]; zones: StaffZone[]; initialSessions: StaffSession[]; initialActive: StaffOrder[] };

export function TablesBoard({ initialTables, zones, initialSessions, initialActive }: Props) {
  const [tables, setTables] = useState(initialTables);
  const [sessions, setSessions] = useState(initialSessions);
  const [active, setActive] = useState(initialActive);
  const [zone, setZone] = useState<number | "all">("all");
  const [selectedId, setSelectedId] = useState<number | null>(initialTables[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const stateOf = useCallback(
    (table: StaffTable): { state: State; session?: StaffSession; waiter: boolean } => {
      if (!table.is_active) return { state: "inactive", waiter: false };
      const session = sessions.find((s) => s.table.number === table.number);
      const waiter = session?.open_requests.includes("waiter") ?? false;
      if (session && (session.status === "bill_requested" || session.open_requests.includes("bill"))) return { state: "bill", session, waiter };
      // Une commande encore en cuisine compte même si l'addition a déjà été réglée (paiement « maintenant »).
      if (active.some((o) => o.table_number === table.number)) return { state: "ordering", session, waiter };
      if (session) return { state: "occupied", session, waiter };
      return { state: "free", waiter: false };
    },
    [sessions, active],
  );

  const shown = useMemo(() => tables.filter((t) => zone === "all" || t.zone === zone), [tables, zone]);
  const selected = tables.find((t) => t.id === selectedId) ?? null;
  const seats = tables.filter((t) => t.is_active).reduce((n, t) => n + (t.seats ?? 0), 0);
  const free = tables.filter((t) => stateOf(t).state === "free").length;

  async function send(url: string, method: "POST" | "PATCH", body?: unknown): Promise<StaffTable | null> {
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
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const first = data && typeof data === "object" ? Object.values(data as Record<string, unknown>)[0] : null;
        flash((Array.isArray(first) ? String(first[0]) : typeof first === "string" ? first : null) ?? "Action impossible pour le moment.");
        return null;
      }
      return data as StaffTable;
    } catch {
      flash("Connexion difficile : réessayez dans un instant.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const replace = (table: StaffTable) => setTables((list) => list.map((t) => (t.id === table.id ? table : t)));

  async function toggleActive(table: StaffTable) {
    const updated = await send(`/api/gestion/tables/${table.id}`, "PATCH", { is_active: !table.is_active });
    if (updated) {
      replace(updated);
      flash(updated.is_active ? `Table ${updated.number} réactivée.` : `Table ${updated.number} désactivée : son QR ne prend plus de commande.`);
    }
  }

  async function regenerate(table: StaffTable) {
    if (!window.confirm(`Régénérer le QR de la table ${table.number} ? L’ancien chevalet ne fonctionnera plus.`)) return;
    const updated = await send(`/api/gestion/tables/${table.id}/regenerate-qr`, "POST");
    if (updated) {
      replace(updated);
      flash(`Nouveau QR pour la table ${updated.number} (v${updated.qr_version}) : imprimez le nouveau chevalet.`);
    }
  }

  async function addTable(form: FormData) {
    const created = await send("/api/gestion/tables", "POST", {
      number: Number(form.get("number")),
      zone: Number(form.get("zone")),
      seats: Number(form.get("seats")),
    });
    if (created) {
      setTables((list) => [...list, created].sort((a, b) => a.number - b.number));
      setSelectedId(created.id);
      setAdding(false);
      flash(`Table ${created.number} ajoutée.`);
    }
  }

  const nextNumber = tables.reduce((n, t) => Math.max(n, t.number), 0) + 1;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <div>
          <h1 className="text-[32px]">Tables &amp; QR codes</h1>
          <p className="text-sm text-ticket-doux">
            {tables.length} tables · {seats} places · {free} libre{free > 1 ? "s" : ""} en ce moment
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
            Imprimer tous les QR codes
          </a>
          <button type="button" onClick={() => setAdding((v) => !v)} className="h-11 rounded-full bg-bordeaux px-[18px] text-sm font-bold text-white">
            + Ajouter une table
          </button>
        </div>
      </div>

      {adding && (
        <form action={addTable} className="flex flex-wrap items-end gap-3 rounded-[20px] border border-bordure bg-white p-4">
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Numéro
            <input name="number" type="number" min={1} defaultValue={nextNumber} required className="h-11 w-24 rounded-xl border-[1.5px] border-bordure px-3 font-normal" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Zone
            <select name="zone" defaultValue={zone === "all" ? zones[0]?.id : zone} className="h-11 min-w-36 rounded-xl border-[1.5px] border-bordure bg-white px-3 font-normal">
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Places
            <input name="seats" type="number" min={1} max={30} defaultValue={4} required className="h-11 w-24 rounded-xl border-[1.5px] border-bordure px-3 font-normal" />
          </label>
          <button type="submit" disabled={busy || zones.length === 0} className="h-11 rounded-full bg-encre px-5 text-sm font-bold text-white disabled:opacity-60">
            Créer la table
          </button>
          {zones.length === 0 && <p className="text-sm text-bordeaux">Créez d’abord une zone dans l’admin.</p>}
        </form>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div role="tablist" aria-label="Filtrer par zone" className="flex flex-wrap gap-2">
          {[{ id: "all" as const, name: "Toutes" }, ...zones].map((z) => {
            const on = zone === z.id;
            return (
              <button
                key={z.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setZone(z.id)}
                className={`h-[42px] rounded-full border-[1.5px] px-4 text-sm font-bold ${on ? "border-encre bg-encre text-white" : "border-bordure bg-white"}`}
              >
                {z.name}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3.5 text-[13px] text-texte-doux">
          {LEGEND.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${STATES[s].dot}`} aria-hidden="true" />
              {STATES[s].label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-[18px]">
        <div className="grid min-w-0 flex-[999_1_520px] grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          {shown.map((table) => {
            const { state, session, waiter } = stateOf(table);
            const s = STATES[state];
            const on = table.id === selectedId;
            return (
              <button
                key={table.id}
                type="button"
                onClick={() => setSelectedId(table.id)}
                aria-pressed={on}
                className={`flex min-h-[120px] flex-col items-start gap-1.5 rounded-[18px] border-l-[5px] bg-white p-3.5 text-left ${s.border} ${
                  on ? "shadow-[0_0_0_3px_var(--color-bordeaux)]" : "shadow-pilule"
                }`}
              >
                <span className="flex w-full items-start justify-between">
                  <span className="font-display text-[28px] leading-none font-bold">{table.number}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-ticket-doux">
                    {waiter && <Bell size={14} className="text-bordeaux" aria-label="Appel serveur" />}
                    <Users size={14} aria-hidden="true" />
                    {table.seats}
                  </span>
                </span>
                <span className="text-[12.5px] text-ticket-doux">{table.zone_name}</span>
                <span className={`${pill} ${s.style}`}>{s.label}</span>
                {session && session.total > 0 && <span className="text-xs font-bold">{formatPrice(session.total)}</span>}
              </button>
            );
          })}
          {shown.length === 0 && <p className="col-span-full py-8 text-center text-ticket-doux">Aucune table dans cette zone.</p>}
        </div>

        {selected && (
          <aside aria-label="Détail de la table" className="flex max-w-[380px] min-w-[280px] flex-[1_1_320px] flex-col gap-3.5 rounded-[20px] border border-bordure bg-white p-5">
            {(() => {
              const { state, session } = stateOf(selected);
              const s = STATES[state];
              return (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-display text-[28px] font-bold">Table {selected.number}</div>
                      <div className="text-sm text-ticket-doux">
                        {selected.zone_name} · {selected.seats} places
                      </div>
                    </div>
                    <span className={`${pill} ${s.style}`}>{s.label}</span>
                  </div>
                  {session && (
                    <p className="text-sm text-ticket-doux">
                      {session.orders_count} commande{session.orders_count > 1 ? "s" : ""} · {formatPrice(session.total)} en cours
                    </p>
                  )}
                  <div className="relative flex w-[200px] flex-col items-center gap-2.5 self-center rounded-[18px] border border-bordure bg-creme p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element -- image servie par le relais authentifié, non optimisable */}
                    <img
                      src={`/api/gestion/tables/${selected.id}/qr.png?v=${selected.qr_version}`}
                      alt={`QR code de la table ${selected.number}`}
                      width={168}
                      height={168}
                      className={`size-[168px] ${selected.is_active ? "" : "opacity-25"}`}
                    />
                    {!selected.is_active && (
                      <span className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-encre px-3 py-1.5 text-xs font-bold text-white">
                        QR désactivé
                      </span>
                    )}
                    <span className="text-center text-xs break-all text-ticket-doux">{selected.qr_url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-bold">
                    Table active (accepte les commandes)
                    <input
                      type="checkbox"
                      checked={selected.is_active ?? true}
                      onChange={() => toggleActive(selected)}
                      disabled={busy}
                      className="size-[22px] cursor-pointer accent-bordeaux"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`/api/gestion/tables/qr-sheet.pdf?number=${selected.number}`}
                      target="_blank"
                      rel="noopener"
                      className="flex h-11 items-center justify-center rounded-full bg-bordeaux px-2 text-center text-sm font-bold text-white"
                    >
                      Imprimer le chevalet
                    </a>
                    <a
                      href={`/api/gestion/tables/${selected.id}/qr.png?v=${selected.qr_version}`}
                      download={`table-${selected.number}-qr.png`}
                      className="flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-encre bg-white text-sm font-bold"
                    >
                      <Download size={16} aria-hidden="true" />
                      PNG
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => regenerate(selected)}
                    disabled={busy}
                    className="h-11 rounded-full border-[1.5px] border-bordure text-sm font-bold text-ticket-doux disabled:opacity-60"
                  >
                    Régénérer le QR code
                  </button>
                  <p className="text-[12.5px] text-ticket-doux">
                    Régénérer rend l’ancien QR code inutilisable, par exemple si un chevalet a été photographié et partagé. Version actuelle :
                    v{selected.qr_version}.
                  </p>
                </>
              );
            })()}
          </aside>
        )}
      </div>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-full bg-encre px-5 py-3 text-sm font-bold text-white shadow-carte">
          {toast}
        </div>
      )}
    </>
  );
}
