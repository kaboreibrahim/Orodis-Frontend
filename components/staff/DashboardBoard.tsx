"use client";

// Vue d'ensemble du gérant (maquette phase3/AdminDashboard). Les chiffres viennent de /manage/dashboard/ ;
// ils sont relus à chaque événement du restaurant (commande, encaissement, rupture), au plus une fois toutes les 2 s.
// Période : aujourd'hui, 7 jours, 30 jours ou dates libres (un an au plus). Rapports PDF de la période choisie
// par le menu « Télécharger un rapport ». Changer de période fait sortir le contenu dans le flou, puis le nouveau
// entre carte après carte.
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  CalendarRange,
  ChefHat,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Flame,
  Loader2,
  QrCode,
  Receipt,
  Wallet,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StaffDashboard } from "@/lib/api/staff";
import { capitalize, formatDate, formatPrice, todayIso } from "@/lib/format";
import { METHODS } from "./labels";
import { CountUp, EASE, Grow, Reveal, RevealTitle, stagger } from "./reveal";
import { useStaffEvents } from "./useStaffEvents";

type Preset = "today" | "week" | "month";
type Selection = { kind: "preset"; period: Preset } | { kind: "custom"; start: string; end: string };

const PRESETS: { value: Preset; label: string }[] = [
  { value: "today", label: "Aujourd’hui" },
  { value: "week", label: "7 jours" },
  { value: "month", label: "30 jours" },
];
const MAX_DAYS = 366;
const CARD = "rounded-[22px] border border-bordure bg-white p-5";
const REFRESH_GAP = 2000;
const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
/** Couleurs des catégories, dans l'ordre (la plus vendue en bordeaux). */
const PALETTE = ["bg-bordeaux", "bg-en-preparation", "bg-a-encaisser", "bg-servie", "bg-canal-comptoir", "bg-texte-doux", "bg-etape-inactive"];

const query = (s: Selection) => (s.kind === "preset" ? `period=${s.period}` : `start=${s.start}&end=${s.end}`);
const key = (s: Selection) => (s.kind === "preset" ? s.period : `${s.start}_${s.end}`);
const daysBetween = (start: string, end: string) => Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 864e5) + 1;
const dateFmt = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Abidjan", ...options }).format(new Date(`${iso}T12:00:00Z`));

/** « Samedi 21 novembre 2026 » ou « Du 1er au 15 novembre 2026 ». */
function periodLabel(start: string, end: string): string {
  if (start === end) return capitalize(formatDate(end));
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const from = dateFmt(start, { day: "numeric", month: "long", ...(sameYear ? {} : { year: "numeric" }) });
  return `Du ${from} au ${dateFmt(end, { day: "numeric", month: "long", year: "numeric" })}`;
}

/** « par rapport à la veille », « par rapport aux 7 jours précédents ». */
const against = (days: number) => (days === 1 ? "par rapport à la veille" : `par rapport aux ${days} jours précédents`);

/** Écart avec la période précédente : +12 %, −8 % ; rien à comparer si elle est vide. */
function Delta({ now, before, days }: { now: number; before: number; days: number }) {
  if (!before) return <span className="text-[13px] text-ticket-doux">Pas de comparaison possible</span>;
  const percent = Math.round(((now - before) / before) * 100);
  const up = percent >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="flex items-center gap-1 text-[13px] text-ticket-doux">
      <span className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 font-bold whitespace-nowrap ${up ? "bg-pastille-ok text-texte-ok" : "bg-rose text-retard"}`}>
        <Icon size={14} aria-hidden="true" />
        {up ? "+" : "−"}
        {Math.abs(percent)} %
      </span>
      {against(days)}
    </span>
  );
}

type Props = { name: string; initial: StaffDashboard };

export function DashboardBoard({ name, initial }: Props) {
  const [data, setData] = useState(initial);
  const [selection, setSelection] = useState<Selection>({ kind: "preset", period: initial.period === "custom" ? "today" : (initial.period as Preset) });
  const [picking, setPicking] = useState(false);
  const [failed, setFailed] = useState(false);
  const wanted = useRef(key(selection));
  const current = useRef<Selection>(selection);
  const timer = useRef<number | undefined>(undefined);

  const load = useCallback(async (target: Selection) => {
    try {
      const response = await fetch(`/api/gestion/dashboard?${query(target)}`, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const fresh = (await response.json()) as StaffDashboard;
      if (wanted.current === key(target)) setData(fresh); // une réponse en retard ne remplace pas la période choisie depuis
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  const refreshSoon = useCallback(() => {
    if (timer.current !== undefined) return;
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      load(current.current);
    }, REFRESH_GAP);
  }, [load]);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  const { online } = useStaffEvents(refreshSoon, refreshSoon);

  function choose(target: Selection) {
    wanted.current = key(target);
    current.current = target;
    setSelection(target);
    load(target);
  }

  const { current: sales, previous, live } = data;
  const peak = Math.max(1, ...data.trend.map((day) => day.revenue));
  const methodsTotal = Math.max(1, ...data.by_method.map((m) => m.total));
  const topQuantity = Math.max(1, ...data.top_dishes.map((dish) => dish.quantity));
  const freeTables = Math.max(0, live.tables_total - live.tables_open);
  const weekly = data.trend_unit === "week";
  const dense = data.trend.length > 14; // barres fines : montants seulement au survol, une date sur plusieurs
  const labelEvery = Math.ceil(data.trend.length / 10);
  const trendTitle = weekly ? "Recettes par semaine" : data.trend.length === 7 && data.days < 7 ? "Recettes des 7 derniers jours" : "Recettes jour par jour";

  const alerts = [
    live.to_collect > 0 && { icon: Wallet, text: `${formatPrice(live.to_collect)} à encaisser`, href: "/gestion" },
    live.open_requests > 0 && {
      icon: BellRing,
      text: live.open_requests > 1 ? `${live.open_requests} demandes de tables en attente` : "1 demande de table en attente",
      href: "/gestion",
    },
    live.unavailable_dishes.length > 0 && {
      icon: AlertTriangle,
      text: `En rupture : ${live.unavailable_dishes.slice(0, 3).join(", ")}${live.unavailable_dishes.length > 3 ? "…" : ""}`,
      href: "/gestion/carte",
    },
  ].filter((alert) => alert !== false);

  return (
    <MotionConfig reducedMotion="user">
      {/* En-tête : salutation, période, rapports */}
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <RevealTitle text={`Bonjour, ${name}`} className="text-[32px]" />
          <p className="text-sm text-ticket-doux">
            Vue d’ensemble · {periodLabel(data.start, data.end)}
            {!online && <span className="ml-2 rounded-full bg-pastille-attente px-2 py-0.5 font-bold text-texte-attente">Hors ligne</span>}
          </p>
        </div>
        <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2.5">
          <div role="group" aria-label="Période" className="flex max-w-full min-w-0 gap-0.5 overflow-x-auto rounded-full bg-encre p-1 shadow-pilule">
            {PRESETS.map(({ value, label }) => {
              const on = selection.kind === "preset" && selection.period === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => (setPicking(false), choose({ kind: "preset", period: value }))}
                  className={`relative h-11 shrink-0 rounded-full px-3.5 text-sm font-bold whitespace-nowrap transition-colors sm:px-4 ${on ? "text-encre" : "text-texte-nav hover:text-white"}`}
                >
                  {on && <motion.span layoutId="periode-active" className="absolute inset-0 rounded-full bg-creme" transition={SPRING} aria-hidden="true" />}
                  <span className="relative">{label}</span>
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={selection.kind === "custom"}
              aria-expanded={picking}
              onClick={() => setPicking((open) => !open)}
              className={`relative flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold whitespace-nowrap transition-colors sm:px-4 ${
                selection.kind === "custom" ? "text-encre" : "text-texte-nav hover:text-white"
              }`}
            >
              {selection.kind === "custom" && <motion.span layoutId="periode-active" className="absolute inset-0 rounded-full bg-creme" transition={SPRING} aria-hidden="true" />}
              <CalendarRange size={16} className="relative" aria-hidden="true" />
              <span className="relative">Dates</span>
            </button>
          </div>
          <ReportMenu selection={selection} data={data} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {picking && (
          <RangePicker
            initial={selection.kind === "custom" ? selection : { start: data.start, end: data.end }}
            onCancel={() => setPicking(false)}
            onApply={(start, end) => {
              setPicking(false);
              choose({ kind: "custom", start, end });
            }}
          />
        )}
      </AnimatePresence>

      {failed && (
        <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
          Les chiffres n’ont pas pu être relus. Ceux affichés peuvent dater de quelques minutes.
        </p>
      )}

      <AnimatePresence mode="wait" initial>
        <motion.div key={`${data.start}_${data.end}`} variants={stagger} initial="hidden" animate="shown" exit="gone" className="flex flex-col gap-[18px]">
          {/* Chiffres de la période */}
          <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            <Reveal className="flex flex-col gap-2 rounded-[22px] bg-bordeaux p-5 text-white shadow-relief">
              <span className="text-sm font-medium text-texte-nav">Chiffre d’affaires encaissé</span>
              <CountUp value={sales.revenue} format={formatPrice} className="font-display text-[34px] leading-none font-bold" />
              <span className="text-[13px] text-texte-nav">
                {sales.receipts_count} {sales.receipts_count > 1 ? "reçus" : "reçu"} · période précédente : {previous.revenue ? formatPrice(previous.revenue) : "rien"}
              </span>
            </Reveal>
            <Reveal className={`${CARD} flex flex-col gap-2`}>
              <span className="text-sm font-medium text-ticket-doux">Commandes</span>
              <CountUp value={sales.orders_count} className="font-display text-[34px] leading-none font-bold" />
              <Delta now={sales.orders_count} before={previous.orders_count} days={data.days} />
            </Reveal>
            <Reveal className={`${CARD} flex flex-col gap-2`}>
              <span className="text-sm font-medium text-ticket-doux">Ticket moyen</span>
              <CountUp value={sales.average_ticket} format={formatPrice} className="font-display text-[34px] leading-none font-bold" />
              <Delta now={sales.average_ticket} before={previous.average_ticket} days={data.days} />
            </Reveal>
            <Reveal className={`${CARD} flex flex-col gap-2`}>
              <span className="text-sm font-medium text-ticket-doux">Reste à encaisser</span>
              <CountUp value={live.to_collect} format={formatPrice} className="font-display text-[34px] leading-none font-bold text-bordeaux" />
              <span className="text-[13px] text-ticket-doux">
                {sales.cancelled_count > 0
                  ? `${sales.cancelled_count} ${sales.cancelled_count > 1 ? "commandes annulées" : "commande annulée"} sur la période`
                  : "Aucune annulation sur la période"}
              </span>
            </Reveal>
          </div>

          <div className="grid gap-[18px] xl:grid-cols-[1.5fr_1fr]">
            {/* Recettes : jour par jour (7 jours au moins) ou par semaine */}
            <Reveal as="section" className={`${CARD} flex min-w-0 flex-col gap-4`}>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl">{trendTitle}</h2>
                  <p className="text-[13px] text-ticket-doux">{weekly ? "Encaissé chaque semaine (du lundi au dimanche)." : "Encaissé chaque jour, tous moyens de paiement confondus."}</p>
                </div>
                <span className="text-sm font-bold tabular-nums">{formatPrice(data.trend.reduce((sum, day) => sum + day.revenue, 0))}</span>
              </div>
              <ol className={`flex h-[220px] items-end ${dense ? "gap-[3px]" : "gap-2 sm:gap-3"}`}>
                {data.trend.map((day, index) => {
                  const last = index === data.trend.length - 1;
                  const showLabel = !dense || index % labelEvery === 0 || last;
                  const label = weekly ? dateFmt(day.date, { day: "numeric", month: "short" }) : dense ? dateFmt(day.date, { day: "numeric" }) : capitalize(dateFmt(day.date, { weekday: "short" }).replace(".", ""));
                  const detail = `${weekly ? `Semaine du ${formatDate(day.date)}` : capitalize(formatDate(day.date))} : ${formatPrice(day.revenue)}, ${day.orders_count} commande${day.orders_count > 1 ? "s" : ""}`;
                  return (
                    <li key={day.date} title={detail} className="group flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
                      {!dense && <span className="truncate text-[11px] font-bold text-ticket-doux sm:text-xs">{day.revenue ? formatPrice(day.revenue).replace(/\s?F$/, "") : "–"}</span>}
                      <div className={`flex w-full flex-1 items-end justify-center bg-sable ${dense ? "rounded-md" : "rounded-xl"}`}>
                        <Grow
                          ratio={day.revenue / peak}
                          delay={0.25 + Math.min(index, 20) * 0.04}
                          className={`w-full transition-colors group-hover:bg-en-preparation ${dense ? "rounded-md" : "rounded-xl"} ${last ? "bg-bordeaux" : "bg-encre"}`}
                        />
                      </div>
                      <span className={`h-4 text-[11px] whitespace-nowrap sm:text-xs ${last ? "font-bold text-bordeaux" : "text-ticket-doux"} ${showLabel ? "" : "invisible"}`}>{label}</span>
                      <span className="sr-only">{detail}</span>
                    </li>
                  );
                })}
              </ol>
            </Reveal>

            {/* Moyens de paiement */}
            <Reveal as="section" className={`${CARD} flex flex-col gap-4`}>
              <div>
                <h2 className="text-xl">Moyens de paiement</h2>
                <p className="text-[13px] text-ticket-doux">Répartition de l’encaissé sur la période.</p>
              </div>
              {data.by_method.length === 0 ? (
                <p className="text-sm text-ticket-doux">Aucun encaissement sur la période.</p>
              ) : (
                <ul className="flex flex-col gap-3.5">
                  {data.by_method.map((method, index) => (
                    <li key={method.method} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 font-bold">
                          <span className={`size-2.5 rounded-full ${METHODS.find((m) => m.value === method.method)?.dot ?? "bg-encre"}`} aria-hidden="true" />
                          {method.label}
                        </span>
                        <span className="tabular-nums">
                          <span className="font-bold">{formatPrice(method.total)}</span>
                          <span className="text-ticket-doux"> · {Math.round((method.total / Math.max(1, sales.revenue)) * 100)} %</span>
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-sable">
                        <Grow axis="x" ratio={method.total / methodsTotal} delay={0.3 + index * 0.08} className={`h-full rounded-full ${METHODS.find((m) => m.value === method.method)?.dot ?? "bg-encre"}`} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>

          <div className="grid gap-[18px] xl:grid-cols-[1.5fr_1fr]">
            <HourChart hours={data.by_hour} days={data.days} />
            <CategoryBreakdown categories={data.by_category} />
          </div>

          <div className="grid gap-[18px] xl:grid-cols-[1.5fr_1fr]">
            {/* Plats les plus vendus */}
            <Reveal as="section" className={`${CARD} flex flex-col gap-4`}>
              <h2 className="text-xl">Plats les plus commandés</h2>
              {data.top_dishes.length === 0 ? (
                <p className="text-sm text-ticket-doux">Aucune commande sur la période.</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {data.top_dishes.map((dish, index) => (
                    <li key={dish.dish_id} className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sable text-sm font-bold" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="truncate font-bold">{dish.dish_name}</span>
                          <span className="shrink-0 text-ticket-doux tabular-nums">
                            <span className="font-bold text-encre">× {dish.quantity}</span> · {formatPrice(dish.revenue)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-sable">
                          <Grow axis="x" ratio={dish.quantity / topQuantity} delay={0.35 + index * 0.07} className="h-full rounded-full bg-bordeaux" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Reveal>

            {/* En ce moment */}
            <Reveal as="aside" className="flex flex-col gap-4 rounded-[22px] bg-encre p-5 text-white">
              <h2 className="flex items-center gap-2 text-xl">
                <span className="relative flex size-2.5" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full bg-prete opacity-60 motion-reduce:hidden" />
                  <span className="relative size-2.5 rounded-full bg-prete" />
                </span>
                En ce moment
              </h2>
              <dl className="grid grid-cols-3 gap-2.5 text-center">
                {[
                  { icon: QrCode, value: live.tables_open, label: live.tables_open > 1 ? "tables occupées" : "table occupée" },
                  { icon: ChefHat, value: live.active_orders, label: live.active_orders > 1 ? "commandes en cours" : "commande en cours" },
                  { icon: QrCode, value: freeTables, label: freeTables > 1 ? "tables libres" : "table libre" },
                ].map(({ icon: Icon, value, label }, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 rounded-2xl bg-white/5 px-2 py-3">
                    <Icon size={18} className="text-texte-sur-encre" aria-hidden="true" />
                    <dd className="font-display text-[28px] leading-none font-bold">
                      <CountUp value={value} />
                    </dd>
                    <dt className="text-xs text-texte-sur-encre">{label}</dt>
                  </div>
                ))}
              </dl>
              {alerts.length === 0 ? (
                <p className="rounded-2xl bg-white/5 px-3.5 py-3 text-sm text-texte-sur-encre">Rien à signaler : tout est encaissé et servi.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {alerts.map(({ icon: Icon, text, href }) => (
                    <li key={text}>
                      <Link href={href} className="flex min-h-11 items-center gap-2.5 rounded-2xl bg-white/5 px-3.5 py-2 text-sm font-medium hover:bg-white/10">
                        <Icon size={18} className="shrink-0 text-jaune" aria-hidden="true" />
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}

/** Choix de dates libres : du … au …, un an au plus, jamais dans le futur. */
function RangePicker({ initial, onApply, onCancel }: { initial: { start: string; end: string }; onApply: (start: string, end: string) => void; onCancel: () => void }) {
  const today = todayIso();
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const days = start && end ? daysBetween(start, end) : 0;
  const error = !start || !end ? "Choisissez les deux dates." : start > end ? "La date de début doit précéder la date de fin." : end > today ? "La date de fin ne peut pas être dans le futur." : days > MAX_DAYS ? "La période ne peut pas dépasser un an." : null;
  const shortcuts = [
    { label: "Ce mois-ci", start: `${today.slice(0, 8)}01`, end: today },
    {
      label: "Mois dernier",
      start: (() => {
        const d = new Date(`${today.slice(0, 8)}01T12:00:00Z`);
        d.setUTCMonth(d.getUTCMonth() - 1);
        return d.toISOString().slice(0, 10);
      })(),
      end: todayIso(0, Date.parse(`${today.slice(0, 8)}01T12:00:00Z`) - 864e5),
    },
    { label: "Cette année", start: `${today.slice(0, 4)}-01-01`, end: today },
  ];

  return (
    <motion.form
      onSubmit={(event) => (event.preventDefault(), !error && onApply(start, end))}
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="overflow-hidden"
      aria-label="Dates libres"
    >
      <div className="flex flex-wrap items-end gap-3 rounded-[22px] border border-bordure bg-white p-4">
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Du
          <input type="date" value={start} max={today} onChange={(e) => setStart(e.target.value)} className="h-12 rounded-xl border-[1.5px] border-bordure px-3 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Au
          <input type="date" value={end} max={today} onChange={(e) => setEnd(e.target.value)} className="h-12 rounded-xl border-[1.5px] border-bordure px-3 font-normal" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {shortcuts.map((s) => (
            <button key={s.label} type="button" onClick={() => (setStart(s.start), setEnd(s.end))} className="h-11 rounded-full bg-sable px-3.5 text-[13px] font-bold">
              {s.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className={`text-[13px] ${error ? "font-bold text-retard" : "text-ticket-doux"}`} role={error ? "alert" : undefined}>
            {error ?? `${days} jour${days > 1 ? "s" : ""}`}
          </span>
          <button type="button" onClick={onCancel} className="h-11 rounded-full border-[1.5px] border-bordure px-4 text-sm font-bold">
            Annuler
          </button>
          <button type="submit" disabled={Boolean(error)} className="h-11 rounded-full bg-bordeaux px-5 text-sm font-bold text-white disabled:opacity-50">
            Afficher
          </button>
        </div>
      </div>
    </motion.form>
  );
}

/** Affluence par heure : une barre par heure d'activité, l'heure de pointe en bordeaux. */
function HourChart({ hours, days }: { hours: StaffDashboard["by_hour"]; days: number }) {
  const active = hours.filter((h) => h.orders_count > 0);
  const from = Math.min(active[0]?.hour ?? 11, 10);
  const to = Math.max(active.at(-1)?.hour ?? 22, 22);
  const shown = hours.filter((h) => h.hour >= from && h.hour <= to);
  const top = Math.max(1, ...shown.map((h) => h.orders_count));
  const busiest = active.reduce<(typeof hours)[number] | null>((best, h) => (!best || h.orders_count > best.orders_count ? h : best), null);
  const perDay = (n: number) => (days > 1 ? ` · ${(n / days).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} par jour en moyenne` : "");

  return (
    <Reveal as="section" className={`${CARD} flex min-w-0 flex-col gap-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-xl">Affluence par heure</h2>
          <p className="text-[13px] text-ticket-doux">Commandes passées à chaque heure{days > 1 ? ", cumulées sur la période" : ""}.</p>
        </div>
        {busiest && (
          <span className="flex items-center gap-1.5 rounded-full bg-pastille-preparation px-3 py-1.5 text-[13px] font-bold text-texte-preparation">
            <Flame size={15} aria-hidden="true" />
            Pointe : {busiest.hour} h – {busiest.hour + 1} h
          </span>
        )}
      </div>
      {active.length === 0 ? (
        <p className="text-sm text-ticket-doux">Aucune commande sur la période.</p>
      ) : (
        <ol className="flex h-[180px] items-end gap-[3px] sm:gap-1.5">
          {shown.map((h, index) => {
            const peak = busiest?.hour === h.hour;
            const detail = `${h.hour} h – ${h.hour + 1} h : ${h.orders_count} commande${h.orders_count > 1 ? "s" : ""}, ${formatPrice(h.amount)}${perDay(h.orders_count)}`;
            return (
              <li key={h.hour} title={detail} className="group flex h-full min-w-0 flex-1 flex-col items-center gap-1">
                <span className={`text-[10px] font-bold sm:text-[11px] ${peak ? "text-bordeaux" : "text-ticket-doux"} ${h.orders_count ? "" : "invisible"}`}>{h.orders_count}</span>
                <div className="flex w-full flex-1 items-end rounded-md bg-sable">
                  <Grow ratio={h.orders_count / top} delay={0.3 + index * 0.03} className={`w-full rounded-md transition-colors ${peak ? "bg-bordeaux" : "bg-en-preparation group-hover:bg-bordeaux"}`} />
                </div>
                <span className={`text-[10px] sm:text-[11px] ${peak ? "font-bold text-bordeaux" : "text-ticket-doux"} ${index % 2 && shown.length > 12 ? "invisible sm:visible" : ""}`}>{h.hour}h</span>
                <span className="sr-only">{detail}</span>
              </li>
            );
          })}
        </ol>
      )}
    </Reveal>
  );
}

/** Ventes par catégorie de la carte : barre empilée, puis le détail en montant et en part. */
function CategoryBreakdown({ categories }: { categories: StaffDashboard["by_category"] }) {
  return (
    <Reveal as="section" className={`${CARD} flex flex-col gap-4`}>
      <div>
        <h2 className="text-xl">Ventes par catégorie</h2>
        <p className="text-[13px] text-ticket-doux">Montant commandé, annulations exclues.</p>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-ticket-doux">Aucune commande sur la période.</p>
      ) : (
        <>
          <div className="flex h-4 overflow-hidden rounded-full bg-sable" aria-hidden="true">
            {categories.map((c, index) => (
              <motion.span
                key={c.name}
                className={`h-full ${PALETTE[index % PALETTE.length]} ${index ? "border-l-2 border-white" : ""}`}
                initial={{ width: 0 }}
                animate={{ width: `${c.share}%` }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.08, ease: EASE }}
              />
            ))}
          </div>
          <ul className="flex flex-col gap-2.5">
            {categories.map((c, index) => (
              <li key={c.name} className="flex items-center gap-2.5 text-sm">
                <span className={`size-3 shrink-0 rounded-full ${PALETTE[index % PALETTE.length]}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-bold">{c.name}</span>
                <span className="shrink-0 text-ticket-doux tabular-nums">
                  {c.quantity} art. · <span className="font-bold text-encre">{formatPrice(c.revenue)}</span>
                </span>
                <span className="w-12 shrink-0 text-right font-bold tabular-nums">{c.share.toLocaleString("fr-FR")} %</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Reveal>
  );
}

type Report = { id: string; title: string; text: string; icon: typeof FileText; url: string };

/** Menu « Télécharger un rapport » : trois PDF préparés par Django pour la période affichée. */
function ReportMenu({ selection, data }: { selection: Selection; data: StaffDashboard }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const range = selection.kind === "custom" ? query(selection) : `start=${data.start}&end=${data.end}`;
  const closingDay = data.end;

  const reports: Report[] = [
    { id: "activity", title: "Rapport d’activité", text: `Les chiffres de la période : ${periodLabel(data.start, data.end).toLowerCase()}`, icon: FileText, url: `/api/gestion/reports/activity.pdf?${range}` },
    { id: "sales", title: "Liste des ventes", text: "Chaque reçu de la période et les plats qu’il contient", icon: FileSpreadsheet, url: `/api/gestion/reports/sales.pdf?${range}` },
    { id: "closing", title: "Clôture de caisse", text: `Fiche de fin de service du ${dateFmt(closingDay, { day: "numeric", month: "long" })}, à signer`, icon: Receipt, url: `/api/gestion/reports/closing.pdf?date=${closingDay}` },
  ];

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => !box.current?.contains(event.target as Node) && setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => (document.removeEventListener("mousedown", onClick), window.removeEventListener("keydown", onKey));
  }, [open]);

  async function download(report: Report) {
    setBusy(report.id);
    setError(null);
    try {
      const response = await fetch(report.url, { cache: "no-store" });
      if (response.status === 401) return window.location.assign("/gestion/connexion?suite=/gestion/tableau-de-bord");
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const name = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? `orodis-${report.id}.pdf`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
      setOpen(false);
    } catch {
      setError("Le rapport n’a pas pu être préparé. Réessayez.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 items-center gap-2 rounded-full border-[1.5px] border-encre bg-white px-4 text-sm font-bold"
      >
        <Download size={17} aria-hidden="true" />
        Télécharger un rapport
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Rapports PDF"
            initial={{ opacity: 0, y: -6, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute right-0 z-30 mt-2 flex w-[min(340px,calc(100vw-32px))] origin-top-right flex-col gap-1 rounded-[22px] border border-bordure bg-white p-2 shadow-carte"
          >
            <p className="px-3 pt-1.5 pb-1 text-xs font-bold tracking-wide text-ticket-doux uppercase">PDF · {periodLabel(data.start, data.end)}</p>
            {reports.map((report) => {
              const Icon = busy === report.id ? Loader2 : report.icon;
              return (
                <button
                  key={report.id}
                  type="button"
                  role="menuitem"
                  disabled={busy !== null}
                  onClick={() => download(report)}
                  className="flex min-h-14 items-start gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-creme disabled:opacity-60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose text-bordeaux">
                    <Icon size={18} className={busy === report.id ? "animate-spin" : ""} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{busy === report.id ? "Préparation du PDF…" : report.title}</span>
                    <span className="block text-[13px] text-ticket-doux">{report.text}</span>
                  </span>
                </button>
              );
            })}
            {error && (
              <p role="alert" className="mx-1 rounded-xl bg-rose px-3 py-2 text-[13px] font-bold text-retard">
                {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
