"use client";

// Écran cuisine (maquette phase3/Cuisine) : 3 colonnes Nouvelles → En préparation → Prêtes, un gros bouton
// par ticket, minuteur depuis la commande (ticket en rouge au-delà de 15 min), son à chaque nouvelle commande,
// ruptures de stock en un clic. Temps réel par polling (useStaffEvents) ; à l’ouverture et après chaque coupure, tout est rechargé par REST.
import { ArrowLeft, Ban, Volume2, VolumeX, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StaffDish, StaffOrder, StaffUser } from "@/lib/api/staff";
import { formatTime } from "@/lib/format";
import { AppControls } from "./AppControls";
import { LogoutButton } from "./LogoutButton";
import { type StaffEvent, useStaffEvents } from "./useStaffEvents";
import { useRepeatingSound, useStaffSound } from "./useStaffSound";

const ACTIVE = ["received", "preparing", "ready"] as const;
type ActiveStatus = (typeof ACTIVE)[number];
const LATE_AFTER_MIN = 15;
const SOUND_KEY = "orodis-cuisine-son";
const BELL = "/sons/nouvelle-commande.mp3";

const COLUMNS: { status: ActiveStatus; name: string; bar: string }[] = [
  { status: "received", name: "Nouvelles", bar: "border-jaune" },
  { status: "preparing", name: "En préparation", bar: "border-en-preparation" },
  { status: "ready", name: "Prêtes", bar: "border-prete" },
];
const TOP_STRIP: Record<ActiveStatus, string> = { received: "bg-jaune", preparing: "bg-en-preparation", ready: "bg-prete" };

/** Bouton de chaque colonne et rôles qui peuvent faire avancer (règles de services.advance côté Django). */
const ACTIONS: Record<ActiveStatus, { label: string; style: string; roles: string[]; waiting: string }> = {
  received: { label: "Commencer", style: "bg-encre text-white", roles: ["kitchen", "manager"], waiting: "En attente de la cuisine" },
  preparing: { label: "Marquer prête", style: "bg-bordeaux text-white", roles: ["kitchen", "manager"], waiting: "En préparation" },
  ready: { label: "Servie / remise", style: "bg-servie text-white", roles: ["waiter", "cashier", "manager"], waiting: "En attente du serveur" },
};

const isActive = (status: string | undefined): status is ActiveStatus => ACTIVE.includes(status as ActiveStatus);
const minutesSince = (iso: string, now: number) => Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));

type Props = { user: StaffUser; initialOrders: StaffOrder[]; initialDishes: StaffDish[] | null };

export function KitchenBoard({ user, initialOrders, initialDishes }: Props) {
  const [orders, setOrders] = useState<StaffOrder[]>(initialOrders.filter((o) => isActive(o.status)));
  const [dishes, setDishes] = useState(initialDishes);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<string | null>(null);
  const [showStock, setShowStock] = useState(false);
  const { soundOn, toggleSound, play } = useStaffSound(SOUND_KEY);
  const ordersRef = useRef(orders);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Horloge et minuteurs des tickets
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  function flash(text: string) {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  }

  const reload = useCallback(async () => {
    try {
      const response = await fetch(`/api/gestion/orders?status=${ACTIVE.join(",")}`, { cache: "no-store" });
      if (response.status === 401) return window.location.assign("/gestion/connexion?suite=/gestion/cuisine");
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as { results: StaffOrder[] };
      setOrders(data.results.filter((o) => isActive(o.status)));
      if (initialDishes) {
        const list = await fetch("/api/gestion/dishes", { cache: "no-store" });
        if (list.ok) setDishes(await list.json());
      }
    } catch {
      flash("Connexion difficile : les tickets seront remis à jour dès que possible.");
    }
  }, [initialDishes]);

  function onEvent(event: StaffEvent) {
    const data = event.data;
    if (event.type === "order.created") {
      const order = data as unknown as StaffOrder;
      if (!isActive(order.status)) return;
      setOrders((list) => [...list.filter((o) => o.id !== order.id), order]);
      setFresh((ids) => new Set(ids).add(order.id));
      play(BELL);
    } else if (event.type === "order.status") {
      const id = data.id as number;
      const status = data.status as string;
      if (isActive(status) && !ordersRef.current.some((o) => o.id === id)) {
        reload(); // ticket inconnu de cet écran (ouvert pendant une coupure) : on recharge tout
        return;
      }
      setOrders((list) =>
        isActive(status) ? list.map((o) => (o.id === id ? { ...o, status } : o)) : list.filter((o) => o.id !== id),
      );
    } else if (event.type === "order.cancelled") {
      setOrders((list) => list.filter((o) => o.id !== data.id));
      flash(`Commande n° ${data.number} annulée${data.reason ? ` : ${data.reason}` : "."}`);
    } else if (event.type === "dish.availability") {
      setDishes((list) => list?.map((d) => (d.id === data.dish_id ? { ...d, is_available: Boolean(data.is_available) } : d)) ?? list);
    }
  }

  const { online } = useStaffEvents(onEvent, reload);
  // La sonnerie reprend toutes les 3 s tant qu'une commande n'est pas commencée.
  const waiting = orders.filter((o) => o.status === "received").length;
  useRepeatingSound(play, BELL, waiting > 0);

  async function advance(order: StaffOrder) {
    setFresh((ids) => {
      const next = new Set(ids);
      next.delete(order.id);
      return next;
    });
    setPending((ids) => new Set(ids).add(order.id));
    try {
      const response = await fetch(`/api/gestion/orders/${order.id}/advance`, { method: "POST", cache: "no-store" });
      if (response.status === 401) return window.location.assign("/gestion/connexion?suite=/gestion/cuisine");
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = body?.detail ?? body?.status?.[0];
        flash(detail ?? "Action impossible pour le moment.");
        if (response.status === 400) reload(); // l'état a changé ailleurs
        return;
      }
      const updated = body as StaffOrder;
      setOrders((list) =>
        isActive(updated.status) ? list.map((o) => (o.id === updated.id ? updated : o)) : list.filter((o) => o.id !== updated.id),
      );
    } catch {
      flash("Connexion difficile : réessayez dans un instant.");
    } finally {
      setPending((ids) => {
        const next = new Set(ids);
        next.delete(order.id);
        return next;
      });
    }
  }

  async function setAvailability(dish: StaffDish, isAvailable: boolean) {
    setDishes((list) => list?.map((d) => (d.id === dish.id ? { ...d, is_available: isAvailable } : d)) ?? list);
    try {
      const response = await fetch(`/api/gestion/dishes/${dish.id}/availability`, {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: isAvailable }),
      });
      if (!response.ok) throw new Error(String(response.status));
      flash(isAvailable ? `${dish.name} : de nouveau disponible.` : `${dish.name} : en rupture, retiré de la carte.`);
    } catch {
      setDishes((list) => list?.map((d) => (d.id === dish.id ? { ...d, is_available: !isAvailable } : d)) ?? list);
      flash("Modification impossible pour le moment.");
    }
  }

  // Plus ancienne commande en haut de chaque colonne : c'est elle qui attend depuis le plus longtemps.
  const columns = useMemo(
    () =>
      COLUMNS.map((column) => ({
        ...column,
        tickets: orders
          .filter((o) => o.status === column.status)
          .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)),
      })),
    [orders],
  );
  const outOfStock = dishes?.filter((d) => !d.is_available).length ?? 0;
  const isKitchen = user.role === "kitchen";

  return (
    <div className="flex min-h-dvh flex-col bg-cuisine-fond text-white md:h-dvh">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-cuisine-filet px-4 py-3 md:h-[76px] md:px-6 md:py-0">
        <div className="flex items-center gap-4">
          {!isKitchen && (
            <Link href="/gestion" aria-label="Retour à la gestion" className="flex size-11 items-center justify-center rounded-full hover:bg-white/10">
              <ArrowLeft size={22} aria-hidden="true" />
            </Link>
          )}
          <Image src="/logo-delices-orodis-blanc-web.png" alt="Les Délices d’Orodis" width={56} height={50} className="h-[50px] w-auto" priority />
          <div className="hidden h-9 w-px bg-cuisine-filet sm:block" />
          <div>
            <h1 className="text-[22px] tracking-normal">Cuisine · commandes en cours</h1>
            <p className="text-[13px] text-cuisine-texte">Commandes à table et au comptoir</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => toggleSound(BELL)}
            aria-pressed={soundOn}
            className={`flex h-11 items-center gap-2 rounded-full border-[1.5px] px-4 text-sm font-bold ${
              soundOn ? "border-prete/60 text-white" : "border-jaune bg-jaune text-encre"
            }`}
          >
            {soundOn ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
            {soundOn ? "Son activé" : "Activer le son"}
          </button>
          {isKitchen && <AppControls variant="cuisine" />}
          {dishes && (
            <button
              type="button"
              onClick={() => setShowStock(true)}
              className="flex h-11 items-center gap-2 rounded-full border-[1.5px] border-bordure-encre px-4 text-sm font-bold hover:bg-white/5"
            >
              <Ban size={18} aria-hidden="true" />
              Ruptures
              {outOfStock > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-jaune px-1.5 text-xs text-encre">{outOfStock}</span>
              )}
            </button>
          )}
          <div className="flex items-center gap-2 rounded-full bg-cuisine-barre px-3.5 py-2 text-sm font-bold" role="status">
            <span className={`size-[9px] rounded-full ${online ? "bg-prete" : "bg-retard"}`} aria-hidden="true" />
            {online ? "Service ouvert" : "Hors ligne · reconnexion…"}
          </div>
          <div className="font-display text-[26px] font-bold tabular-nums" aria-label="Heure">
            {formatTime(new Date(now))}
          </div>
          {isKitchen && (
            <LogoutButton size={20} className="flex size-11 items-center justify-center rounded-full text-cuisine-texte hover:bg-white/10" />
          )}
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 md:min-h-0 md:grid-cols-3 md:px-5 md:pt-[18px] md:pb-5">
        {columns.map((column) => (
          <section key={column.status} aria-label={column.name} className="flex min-h-0 flex-col rounded-[20px] bg-cuisine-colonne">
            <div className={`flex items-center justify-between border-b-[3px] px-4 py-3.5 ${column.bar}`}>
              <h2 className="font-sans text-lg font-bold tracking-normal">{column.name}</h2>
              <span className="flex h-7 min-w-8 items-center justify-center rounded-full bg-cuisine-pastille px-2.5 font-bold">{column.tickets.length}</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3.5">
              {column.tickets.map((order) => {
                const action = ACTIONS[column.status];
                const allowed = action.roles.includes(user.role) || user.role === "manager";
                const minutes = minutesSince(order.created_at, now);
                const late = minutes >= LATE_AFTER_MIN;
                const table = order.table_number != null;
                return (
                  <article
                    key={order.id}
                    onPointerDown={() =>
                      fresh.has(order.id) &&
                      setFresh((ids) => {
                        const next = new Set(ids);
                        next.delete(order.id);
                        return next;
                      })
                    }
                    className={`shrink-0 overflow-hidden rounded-2xl bg-white text-encre ${
                      fresh.has(order.id) ? "ticket-nouveau" : "shadow-[0_10px_24px_rgb(0_0_0/0.35)]"
                    }`}
                  >
                    <div className={`h-1.5 ${TOP_STRIP[column.status]}`} />
                    <div className="flex flex-col gap-2 px-3.5 pt-3 pb-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-2xl font-bold">{table ? `Table ${order.table_number}` : "Comptoir"}</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${table ? "bg-canal-table" : "bg-canal-comptoir"}`}>
                          {table ? "Sur place" : "Comptoir"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 text-[13px] text-ticket-doux">
                        <span>
                          {table ? "Sur place" : "Au comptoir"} · n° {order.number}
                        </span>
                        <span className={late ? "font-bold text-retard" : undefined}>
                          {minutes === 0 ? "à l’instant" : `il y a ${minutes} min`}
                        </span>
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {order.items.map((item, i) => (
                          <li key={item.id ?? i} className="text-[15px] leading-snug">
                            <strong>
                              {item.quantity}× {item.dish_name}
                            </strong>
                            {item.options_label && <span className="block text-[13px] text-ticket-doux">{item.options_label}</span>}
                            {item.note && <span className="block text-[13px] text-ticket-doux italic">« {item.note} »</span>}
                          </li>
                        ))}
                      </ul>
                      {order.note && (
                        <div className="rounded-[10px] bg-note px-2.5 py-2 text-[13px] text-note-texte">
                          <strong>Note :</strong> {order.note}
                        </div>
                      )}
                      {allowed ? (
                        <button
                          type="button"
                          onClick={() => advance(order)}
                          disabled={pending.has(order.id)}
                          className={`h-12 rounded-xl text-base font-bold disabled:opacity-60 ${action.style}`}
                        >
                          {pending.has(order.id) ? "…" : action.label}
                        </button>
                      ) : (
                        <p className="flex h-12 items-center justify-center rounded-xl bg-sable text-sm font-bold text-ticket-doux">{action.waiting}</p>
                      )}
                    </div>
                  </article>
                );
              })}
              {column.tickets.length === 0 && <p className="my-5 text-center text-sm text-cuisine-vide">Aucune commande</p>}
            </div>
          </section>
        ))}
      </div>

      {showStock && dishes && <StockPanel dishes={dishes} onClose={() => setShowStock(false)} onToggle={setAvailability} />}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-white px-5 py-3 text-sm font-bold text-encre shadow-carte">
          {toast}
        </div>
      )}
    </div>
  );
}

/** Ruptures de stock : un interrupteur par plat, groupés comme la carte. */
function StockPanel({
  dishes,
  onClose,
  onToggle,
}: {
  dishes: StaffDish[];
  onClose: () => void;
  onToggle: (dish: StaffDish, isAvailable: boolean) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, StaffDish[]>();
    for (const dish of dishes) {
      const key = `${dish.category} · ${dish.subcategory}`;
      map.set(key, [...(map.get(key) ?? []), dish]);
    }
    return [...map.entries()];
  }, [dishes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Ruptures de stock"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[420px] flex-col bg-cuisine-colonne text-white"
      >
        <div className="flex items-center justify-between border-b border-cuisine-filet px-5 py-4">
          <div>
            <h2 className="text-[22px] tracking-normal">Ruptures de stock</h2>
            <p className="text-[13px] text-cuisine-texte">Un plat en rupture disparaît aussitôt de la carte des clients.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10">
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {groups.map(([group, list]) => (
            <div key={group} className="mb-5">
              <h3 className="mb-2 font-sans text-xs font-bold tracking-[0.08em] text-cuisine-texte uppercase">{group}</h3>
              <ul className="flex flex-col gap-1">
                {list.map((dish) => (
                  <li key={dish.id}>
                    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 hover:bg-white/5">
                      <span className={dish.is_available ? "font-medium" : "font-medium text-cuisine-vide line-through"}>{dish.name}</span>
                      <span className="flex items-center gap-2.5 text-xs font-bold">
                        <span className={dish.is_available ? "text-prete" : "text-jaune"}>{dish.is_available ? "Disponible" : "En rupture"}</span>
                        <input
                          type="checkbox"
                          role="switch"
                          checked={dish.is_available ?? true}
                          onChange={(e) => onToggle(dish, e.target.checked)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className="relative h-7 w-12 rounded-full bg-cuisine-pastille transition-colors peer-checked:bg-servie peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-jaune after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"
                        />
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
