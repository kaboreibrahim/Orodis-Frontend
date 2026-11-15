"use client";

// Paiements d'une journée (maquette phase3/AdminPaiements). Les données viennent de /manage/payments/ ;
// le jour affiché est relu à chaque événement du restaurant quand c'est aujourd'hui. Le filtre par moyen
// de paiement se fait ici, sans nouvel appel. Le détail d'un reçu est lu à la demande.
import { ChevronLeft, ChevronRight, FileText, Printer, Wallet, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReceiptRow, StaffPayments, StaffReceipt } from "@/lib/api/staff";
import { capitalize, formatDate, formatPrice, formatTime, todayIso } from "@/lib/format";
import { METHODS } from "./labels";
import { CountUp, EASE, Grow, Reveal, RevealTitle, stagger } from "./reveal";
import { useStaffEvents } from "./useStaffEvents";

const CARD = "rounded-[22px] border border-bordure bg-white p-5";
const REFRESH_GAP = 2000;

const dot = (method: string) => METHODS.find((m) => m.value === method)?.dot ?? "bg-encre";
const shiftDay = (iso: string, days: number) => new Date(Date.parse(`${iso}T12:00:00Z`) + days * 864e5).toISOString().slice(0, 10);
const place = (table: number | null) => (table ? `Table ${table}` : "Comptoir");

export function PaymentsBoard({ initial }: { initial: StaffPayments }) {
  const [data, setData] = useState(initial);
  const [filter, setFilter] = useState<string>("all");
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<ReceiptRow | null>(null);
  const [detail, setDetail] = useState<StaffReceipt | "error" | null>(null);
  const wanted = useRef(initial.date);
  const timer = useRef<number | undefined>(undefined);
  const today = todayIso();
  const isToday = data.date === today;

  const load = useCallback(async (day: string) => {
    try {
      const response = await fetch(`/api/gestion/payments?date=${day}`, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const fresh = (await response.json()) as StaffPayments;
      if (wanted.current === day) setData(fresh);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  const refreshSoon = useCallback(() => {
    if (wanted.current !== todayIso() || timer.current !== undefined) return;
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      load(wanted.current);
    }, REFRESH_GAP);
  }, [load]);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useStaffEvents(refreshSoon, refreshSoon);

  function go(day: string) {
    if (!day || day > today) return;
    wanted.current = day;
    setOpen(null);
    load(day);
  }

  async function show(row: ReceiptRow) {
    setOpen(row);
    setDetail(null);
    try {
      const response = await fetch(`/api/gestion/receipts/${row.number}`, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      setDetail((await response.json()) as StaffReceipt);
    } catch {
      setDetail("error");
    }
  }

  const rows = filter === "all" ? data.receipts : data.receipts.filter((r) => r.method === filter);
  const filtered = rows.reduce((sum, r) => sum + r.total, 0);
  const top = Math.max(1, ...data.by_method.map((m) => m.total));
  const tabs = [{ value: "all", label: "Tous", count: data.receipts_count }, ...data.by_method.map((m) => ({ value: m.method, label: m.label, count: m.count }))];

  return (
    <MotionConfig reducedMotion="user">
      {/* En-tête : titre et choix du jour */}
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <RevealTitle text="Paiements" className="text-[32px]" />
          <p className="text-sm text-ticket-doux">
            {capitalize(formatDate(data.date))}
            {isToday && " · aujourd’hui"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => go(shiftDay(data.date, -1))} aria-label="Jour précédent" className="flex size-11 items-center justify-center rounded-full border border-bordure bg-white hover:bg-sable">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <input
            type="date"
            aria-label="Jour affiché"
            value={data.date}
            max={today}
            onChange={(event) => go(event.target.value)}
            className="h-11 rounded-full border border-bordure bg-white px-4 text-sm font-bold"
          />
          <button
            type="button"
            onClick={() => go(shiftDay(data.date, 1))}
            disabled={isToday}
            aria-label="Jour suivant"
            className="flex size-11 items-center justify-center rounded-full border border-bordure bg-white hover:bg-sable disabled:opacity-40"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          {!isToday && (
            <button type="button" onClick={() => go(today)} className="h-11 rounded-full bg-encre px-4 text-sm font-bold text-white">
              Aujourd’hui
            </button>
          )}
        </div>
      </div>

      {failed && (
        <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
          Les paiements n’ont pas pu être relus. Ceux affichés peuvent dater de quelques minutes.
        </p>
      )}

      <AnimatePresence mode="wait" initial>
        <motion.div key={data.date} variants={stagger} initial="hidden" animate="shown" exit="gone" className="flex flex-col gap-[18px]">
          {/* Totaux : encaissé du jour, puis chaque moyen de paiement */}
          <div className="grid grid-cols-2 gap-3 sm:gap-[18px] xl:grid-cols-5">
            <Reveal className="flex flex-col gap-2 rounded-[22px] bg-bordeaux p-5 text-white shadow-relief col-span-2 xl:col-span-1">
              <span className="text-sm font-medium text-texte-nav">Encaissé</span>
              <CountUp value={data.revenue} format={formatPrice} className="font-display text-[30px] font-bold leading-none" />
              <span className="text-[13px] text-texte-nav">
                {data.receipts_count} {data.receipts_count > 1 ? "reçus" : "reçu"}
              </span>
            </Reveal>
            {data.by_method.map((method, index) => (
              <Reveal key={method.method} className={`${CARD} flex flex-col gap-2`}>
                <span className="flex items-center gap-2 text-sm font-medium text-ticket-doux">
                  <span className={`size-2.5 rounded-full ${dot(method.method)}`} aria-hidden="true" />
                  {method.label}
                </span>
                <CountUp value={method.total} format={formatPrice} className="font-display text-[22px] font-bold leading-none sm:text-[26px]" />
                <div className="h-2 overflow-hidden rounded-full bg-sable">
                  <Grow axis="x" ratio={method.total / top} delay={0.3 + index * 0.08} className={`h-full rounded-full ${dot(method.method)}`} />
                </div>
                <span className="text-[13px] text-ticket-doux">
                  {method.count} {method.count > 1 ? "paiements" : "paiement"}
                </span>
              </Reveal>
            ))}
          </div>

          {/* Reste à encaisser : état à l'instant, quel que soit le jour affiché */}
          {data.to_collect.total > 0 && (
            <Reveal className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[22px] bg-pastille-encaisser px-5 py-4">
              <div className="flex items-center gap-3">
                <Wallet size={22} className="shrink-0 text-texte-attente" aria-hidden="true" />
                <div>
                  <div className="font-bold text-texte-attente">{formatPrice(data.to_collect.total)} à encaisser en ce moment</div>
                  <div className="text-[13px] text-texte-attente">
                    {data.to_collect.tables.map((t) => `${place(t.table_number)} : ${formatPrice(t.total)}`).join(" · ")}
                  </div>
                </div>
              </div>
              <Link href="/gestion" className="flex h-11 items-center rounded-full bg-encre px-5 text-sm font-bold text-white">
                Encaisser
              </Link>
            </Reveal>
          )}

          <div className="flex flex-wrap items-start gap-[18px]">
            {/* Liste des reçus */}
            <Reveal as="section" className={`${CARD} flex min-w-0 flex-[999_1_520px] flex-col gap-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl">Reçus</h2>
                <div role="group" aria-label="Moyen de paiement" className="flex flex-wrap gap-1 rounded-[22px] bg-sable p-1">
                  {tabs.map((tab) => {
                    const on = filter === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setFilter(tab.value)}
                        className={`relative h-11 rounded-full px-3.5 text-sm font-bold transition-colors ${on ? "text-white" : "text-ticket-doux hover:text-encre"}`}
                      >
                        {on && (
                          <motion.span
                            layoutId="moyen-actif"
                            className="absolute inset-0 rounded-full bg-encre"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative">
                          {tab.label} <span className="font-medium opacity-70">{tab.count}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-ticket-doux">
                  {data.receipts_count === 0 ? "Aucun paiement ce jour-là." : "Aucun paiement avec ce moyen ce jour-là."}
                </p>
              ) : (
                <ul className="flex flex-col">
                  {rows.map((row) => {
                    const active = open?.number === row.number;
                    return (
                      <li key={row.number} className="border-t border-filet-ligne first:border-t-0">
                        <button
                          type="button"
                          onClick={() => show(row)}
                          aria-expanded={active}
                          className={`flex min-h-14 w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors ${active ? "bg-ligne-active" : "hover:bg-creme"}`}
                        >
                          <span className="w-[52px] shrink-0 tabular-nums text-ticket-doux">{formatTime(row.paid_at)}</span>
                          <span className="w-[86px] shrink-0 font-bold">{row.reference}</span>
                          <span className="min-w-[90px] flex-1">
                            {place(row.table_number)}
                            {row.orders_count > 1 && <span className="text-ticket-doux"> · {row.orders_count} commandes</span>}
                          </span>
                          <span className="flex min-w-[130px] items-center gap-2">
                            <span className={`size-2.5 shrink-0 rounded-full ${dot(row.method)}`} aria-hidden="true" />
                            {row.method_display}
                          </span>
                          <span className="ml-auto shrink-0 font-bold tabular-nums">{formatPrice(row.total)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {rows.length > 0 && (
                <div className="flex justify-between border-t border-bordure pt-3 text-sm font-bold">
                  <span>
                    {rows.length} {rows.length > 1 ? "reçus" : "reçu"}
                  </span>
                  <span className="tabular-nums">{formatPrice(filtered)}</span>
                </div>
              )}
            </Reveal>

            {/* Détail du reçu choisi */}
            <AnimatePresence mode="wait">
              {open && (
                <motion.aside
                  key={open.number}
                  aria-label={`Reçu ${open.reference}`}
                  initial={{ opacity: 0, x: 18, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={`${CARD} flex min-w-[280px] max-w-full flex-[1_1_320px] flex-col gap-4 xl:max-w-[380px]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl">Reçu {open.reference}</h2>
                      <p className="text-[13px] text-ticket-doux">
                        {place(open.table_number)} · {formatTime(open.paid_at)}
                        {open.cashier && ` · encaissé par ${open.cashier}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => setOpen(null)} aria-label="Fermer le reçu" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-sable">
                      <X size={20} aria-hidden="true" />
                    </button>
                  </div>

                  {detail === null && <p className="text-sm text-ticket-doux">Chargement du reçu…</p>}
                  {detail === "error" && (
                    <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
                      Le détail du reçu n’a pas pu être lu. Réessayez.
                    </p>
                  )}
                  {detail && detail !== "error" && (
                    <ul className="flex flex-col gap-3">
                      {detail.orders.map((order) => (
                        <li key={order.number} className="flex flex-col gap-1.5 rounded-2xl bg-creme px-3.5 py-3">
                          <span className="text-xs font-bold uppercase tracking-wide text-ticket-doux">Commande n° {order.number}</span>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between gap-3 text-sm">
                              <span>
                                <span className="font-bold">{item.quantity} ×</span> {item.dish_name}
                                {item.options_label && <span className="block text-[13px] text-ticket-doux">{item.options_label}</span>}
                              </span>
                              <span className="shrink-0 tabular-nums">{formatPrice(item.line_total)}</span>
                            </div>
                          ))}
                        </li>
                      ))}
                    </ul>
                  )}

                  <dl className="flex flex-col gap-1.5 border-t border-bordure pt-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ticket-doux">Moyen de paiement</dt>
                      <dd className="flex items-center gap-2 font-bold">
                        <span className={`size-2.5 rounded-full ${dot(open.method)}`} aria-hidden="true" />
                        {open.method_display}
                      </dd>
                    </div>
                    {open.transaction_ref && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-ticket-doux">Référence</dt>
                        <dd className="break-all text-right font-bold">{open.transaction_ref}</dd>
                      </div>
                    )}
                    <div className="flex items-baseline justify-between gap-3 pt-1">
                      <dt className="font-bold">Total payé</dt>
                      <dd className="font-display text-2xl font-bold text-bordeaux">{formatPrice(open.total)}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2">
                    <a href={`/gestion/recus/${open.number}/ticket`} target="_blank" rel="noopener" className="flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-bordeaux px-4 text-sm font-bold text-white">
                      <Printer size={17} aria-hidden="true" />
                      Ticket 80 mm
                    </a>
                    <a href={`/api/gestion/receipts/${open.number}.pdf`} target="_blank" rel="noopener" className="flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-encre px-4 text-sm font-bold">
                      <FileText size={17} aria-hidden="true" />
                      Reçu PDF
                    </a>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
