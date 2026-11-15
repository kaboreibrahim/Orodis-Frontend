"use client";

// Vue d'ensemble du gérant (maquette phase3/AdminDashboard). Les chiffres viennent de /manage/dashboard/ ;
// ils sont relus à chaque événement du restaurant (commande, encaissement, rupture), au plus une fois toutes les 2 s.
// Changer de période fait sortir le contenu dans le flou, puis le nouveau entre carte après carte.
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BellRing, ChefHat, QrCode, Wallet } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardPeriod, StaffDashboard } from "@/lib/api/staff";
import { capitalize, formatDate, formatPrice } from "@/lib/format";
import { METHODS } from "./labels";
import { CountUp, Grow, Reveal, RevealTitle, stagger } from "./reveal";
import { useStaffEvents } from "./useStaffEvents";

const PERIODS: { value: DashboardPeriod; label: string; before: string; against: string }[] = [
  { value: "today", label: "Aujourd’hui", before: "hier", against: "par rapport à hier" },
  { value: "week", label: "7 jours", before: "7 jours précédents", against: "par rapport aux 7 jours précédents" },
  { value: "month", label: "30 jours", before: "30 jours précédents", against: "par rapport aux 30 jours précédents" },
];

const CARD = "rounded-[22px] border border-bordure bg-white p-5";
const REFRESH_GAP = 2000;

const dayLabel = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { weekday: "short", timeZone: "Africa/Abidjan" }).format(new Date(`${iso}T12:00:00Z`)).replace(".", "");

/** Écart avec la période précédente : +12 %, −8 % ; rien à comparer si elle est vide. */
function Delta({ now, before, against }: { now: number; before: number; against: string }) {
  if (!before) return <span className="text-[13px] text-ticket-doux">Pas de comparaison possible</span>;
  const percent = Math.round(((now - before) / before) * 100);
  const up = percent >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="flex items-center gap-1 text-[13px] text-ticket-doux">
      <span className={`flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 font-bold ${up ? "bg-pastille-ok text-texte-ok" : "bg-rose text-retard"}`}>
        <Icon size={14} aria-hidden="true" />
        {up ? "+" : "−"}
        {Math.abs(percent)} %
      </span>
      {against}
    </span>
  );
}

type Props = { name: string; initial: StaffDashboard };

export function DashboardBoard({ name, initial }: Props) {
  const [data, setData] = useState(initial);
  const [period, setPeriod] = useState<DashboardPeriod>(initial.period);
  const [failed, setFailed] = useState(false);
  const wanted = useRef<DashboardPeriod>(initial.period);
  const timer = useRef<number | undefined>(undefined);

  const load = useCallback(async (target: DashboardPeriod) => {
    try {
      const response = await fetch(`/api/gestion/dashboard?period=${target}`, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const fresh = (await response.json()) as StaffDashboard;
      if (wanted.current === target) setData(fresh); // une réponse en retard ne remplace pas la période choisie depuis
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  const refreshSoon = useCallback(() => {
    if (timer.current !== undefined) return;
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      load(wanted.current);
    }, REFRESH_GAP);
  }, [load]);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  const { online } = useStaffEvents(refreshSoon, refreshSoon);

  function choose(target: DashboardPeriod) {
    wanted.current = target;
    setPeriod(target);
    load(target);
  }

  const { current, previous, live } = data;
  const { before, against } = PERIODS.find((p) => p.value === data.period)!;
  const peak = Math.max(1, ...data.trend.map((day) => day.revenue));
  const methodsTotal = Math.max(1, ...data.by_method.map((m) => m.total));
  const topQuantity = Math.max(1, ...data.top_dishes.map((dish) => dish.quantity));
  const freeTables = Math.max(0, live.tables_total - live.tables_open);

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
      href: "/gestion/cuisine",
    },
  ].filter((alert) => alert !== false);

  return (
    <MotionConfig reducedMotion="user">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <RevealTitle text={`Bonjour, ${name}`} className="text-[32px]" />
          <p className="text-sm text-ticket-doux">
            Vue d’ensemble · {capitalize(formatDate(data.end))}
            {!online && <span className="ml-2 rounded-full bg-pastille-attente px-2 py-0.5 font-bold text-texte-attente">Hors ligne</span>}
          </p>
        </div>
        <div role="group" aria-label="Période" className="flex rounded-full bg-encre p-1 shadow-pilule">
          {PERIODS.map(({ value, label }) => {
            const on = period === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => choose(value)}
                className={`relative h-11 rounded-full px-4 text-sm font-bold transition-colors ${on ? "text-encre" : "text-texte-nav hover:text-white"}`}
              >
                {on && (
                  <motion.span
                    layoutId="periode-active"
                    className="absolute inset-0 rounded-full bg-creme"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden="true"
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {failed && (
        <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
          Les chiffres n’ont pas pu être relus. Ceux affichés peuvent dater de quelques minutes.
        </p>
      )}

      <AnimatePresence mode="wait" initial>
        <motion.div key={data.period} variants={stagger} initial="hidden" animate="shown" exit="gone" className="flex flex-col gap-[18px]">
          {/* Chiffres de la période */}
          <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            <Reveal className="flex flex-col gap-2 rounded-[22px] bg-bordeaux p-5 text-white shadow-relief">
              <span className="text-sm font-medium text-texte-nav">Chiffre d’affaires encaissé</span>
              <CountUp value={current.revenue} format={formatPrice} className="font-display text-[34px] font-bold leading-none" />
              <span className="text-[13px] text-texte-nav">
                {current.receipts_count} {current.receipts_count > 1 ? "reçus" : "reçu"} · {before} : {previous.revenue ? formatPrice(previous.revenue) : "rien"}
              </span>
            </Reveal>
            <Reveal className={`${CARD} flex flex-col gap-2`}>
              <span className="text-sm font-medium text-ticket-doux">Commandes</span>
              <CountUp value={current.orders_count} className="font-display text-[34px] font-bold leading-none" />
              <Delta now={current.orders_count} before={previous.orders_count} against={against} />
            </Reveal>
            <Reveal className={`${CARD} flex flex-col gap-2`}>
              <span className="text-sm font-medium text-ticket-doux">Ticket moyen</span>
              <CountUp value={current.average_ticket} format={formatPrice} className="font-display text-[34px] font-bold leading-none" />
              <Delta now={current.average_ticket} before={previous.average_ticket} against={against} />
            </Reveal>
            <Reveal className={`${CARD} flex flex-col gap-2`}>
              <span className="text-sm font-medium text-ticket-doux">Reste à encaisser</span>
              <CountUp value={live.to_collect} format={formatPrice} className="font-display text-[34px] font-bold leading-none text-bordeaux" />
              <span className="text-[13px] text-ticket-doux">
                {current.cancelled_count > 0
                  ? `${current.cancelled_count} ${current.cancelled_count > 1 ? "commandes annulées" : "commande annulée"} sur la période`
                  : "Aucune annulation sur la période"}
              </span>
            </Reveal>
          </div>

          <div className="grid gap-[18px] xl:grid-cols-[1.5fr_1fr]">
            {/* Recettes des 7 derniers jours */}
            <Reveal as="section" className={`${CARD} flex flex-col gap-4`}>
              <div>
                <h2 className="text-xl">Recettes des 7 derniers jours</h2>
                <p className="text-[13px] text-ticket-doux">Encaissé chaque jour, tous moyens de paiement confondus.</p>
              </div>
              <ol className="flex h-[220px] items-end gap-2 sm:gap-3">
                {data.trend.map((day, index) => {
                  const last = index === data.trend.length - 1;
                  return (
                    <li key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1.5">
                      <span className="truncate text-[11px] font-bold text-ticket-doux sm:text-xs">
                        {day.revenue ? formatPrice(day.revenue).replace(/\s?F$/, "") : "–"}
                      </span>
                      <div className="flex w-full flex-1 items-end justify-center rounded-xl bg-sable">
                        <Grow
                          ratio={day.revenue / peak}
                          delay={0.25 + index * 0.06}
                          className={`w-full rounded-xl ${last ? "bg-bordeaux" : "bg-encre"}`}
                        />
                      </div>
                      <span className={`text-xs ${last ? "font-bold text-bordeaux" : "text-ticket-doux"}`}>{capitalize(dayLabel(day.date))}</span>
                      <span className="sr-only">
                        {formatDate(day.date)} : {formatPrice(day.revenue)}, {day.orders_count} commandes
                      </span>
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
                          <span className="text-ticket-doux"> · {Math.round((method.total / Math.max(1, current.revenue)) * 100)} %</span>
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-sable">
                        <Grow
                          axis="x"
                          ratio={method.total / methodsTotal}
                          delay={0.3 + index * 0.08}
                          className={`h-full rounded-full ${METHODS.find((m) => m.value === method.method)?.dot ?? "bg-encre"}`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
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
                          <span className="shrink-0 tabular-nums text-ticket-doux">
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
                    <dd className="font-display text-[28px] font-bold leading-none">
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
