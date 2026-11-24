"use client";

// Ticket qui sort de l'imprimante, affiché juste après un encaissement (PayDialog).
// Le papier descend de la fente par à-coups, comme une imprimante thermique, pendant que la tête « vibre »
// et que le voyant clignote ; onPrinted est appelé quand le ticket est entièrement sorti.
// Avec « réduire les animations », le ticket s'affiche directement et onPrinted est appelé tout de suite.
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo } from "react";
import type { StaffReceipt } from "@/lib/api/staff";
import { formatPrice } from "@/lib/format";

const SHOWN_LINES = 6; // au-delà, « … et N autres articles » : le ticket complet reste celui de « Imprimer le ticket »
const PRINT_SECONDS = 2.4;

/** 12 crans d'avance du papier : la courbe tient le papier immobile un instant entre deux crans. */
const FEED_STEPS = 12;
const feedKeyframes = Array.from({ length: FEED_STEPS * 2 + 1 }, (_, index) => {
  const step = Math.ceil(index / 2);
  return `${-100 + (100 * step) / FEED_STEPS}%`;
});

const amount = (n: number) => formatPrice(n).replace(/\s?F$/, "");

/** Code-barres décoratif tiré de la référence du reçu (toujours le même pour un même reçu). */
function bars(reference: string): number[] {
  let seed = [...reference].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  return Array.from({ length: 46 }, () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return 1 + (seed % 3);
  });
}

type Props = { receipt: StaffReceipt; onPrinted: () => void };

export function ReceiptPrintout({ receipt, onPrinted }: Props) {
  const reduced = useReducedMotion();
  const items = receipt.orders.flatMap((order) => order.items);
  const shown = items.slice(0, SHOWN_LINES);
  const hidden = items.length - shown.length;
  const barcode = useMemo(() => bars(receipt.reference), [receipt.reference]);
  const paidAt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Abidjan",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(receipt.paid_at))
    .replace(",", "");

  useEffect(() => {
    if (reduced) onPrinted();
  }, [reduced, onPrinted]);

  const rule = <div className="my-2 border-t border-dashed border-etape-inactive" aria-hidden="true" />;

  return (
    <div className="relative mx-auto w-full max-w-[320px]" aria-label={`Ticket du reçu ${receipt.reference}`} role="img">
      {/* Imprimante : la fente d'où sort le papier */}
      <motion.div
        className="relative z-10 h-[52px] rounded-[18px] bg-linear-to-b from-sable via-pastille-terminee to-etape-inactive p-[5px] shadow-carte"
        animate={reduced ? undefined : { x: [0, -0.6, 0.6, -0.4, 0.4, 0] }}
        transition={{ duration: 0.18, repeat: Math.round(PRINT_SECONDS / 0.18) - 1, ease: "linear" }}
        aria-hidden="true"
      >
        <div className="flex h-full items-center justify-between rounded-[14px] bg-linear-to-b from-pastille-terminee to-sable px-4">
          <span className="h-[10px] flex-1 rounded-full bg-encre/85 shadow-[inset_0_2px_3px_rgb(0_0_0/0.6)]" />
          <motion.span
            className="ml-3 size-2 shrink-0 rounded-full bg-whatsapp"
            initial={false}
            animate={reduced ? { opacity: 1 } : { opacity: [1, 0.25, 1, 0.25, 1, 0.25, 1, 0.25, 1, 0.25, 1, 0.25, 1] }}
            transition={{ duration: PRINT_SECONDS, ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* Papier : il sort de sous la fente ; le haut reste caché derrière l'imprimante */}
      <div className="relative -mt-[26px] overflow-hidden px-[18px] pt-[26px] pb-3">
        <motion.div
          initial={reduced ? false : { y: "-100%" }}
          animate={{ y: reduced ? "0%" : feedKeyframes }}
          transition={{ duration: PRINT_SECONDS, ease: "linear" }}
          onAnimationComplete={() => !reduced && onPrinted()}
          className="relative bg-linear-to-b from-white via-creme to-white px-4 pt-4 pb-6 font-mono text-[11.5px] leading-[1.45] text-encre shadow-[0_10px_24px_rgb(60_10_20/0.18)] [mask-image:radial-gradient(circle_at_6px_100%,transparent_4px,black_4.5px)] [mask-position:bottom] [mask-size:12px_100%] [mask-repeat:repeat-x]"
        >
          <div className="text-center">
            <div className="font-display text-[17px] font-bold tracking-wide">LES DÉLICES D’ORODIS</div>
            <div className="text-[10.5px] text-ticket-doux">Restaurant · Grand-Bassam</div>
          </div>
          {rule}
          <div className="flex justify-between gap-2">
            <span>Reçu</span>
            <span className="font-bold">{receipt.reference}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>{receipt.table_number ? `Table ${receipt.table_number}` : "Comptoir"}</span>
            <span>{paidAt}</span>
          </div>
          {receipt.cashier && (
            <div className="flex justify-between gap-2">
              <span>Caisse</span>
              <span>{receipt.cashier}</span>
            </div>
          )}
          {rule}
          <ul className="flex flex-col gap-0.5">
            {shown.map((item, index) => (
              <li key={index} className="flex items-baseline gap-1">
                <span className="shrink-0">{item.quantity}×</span>
                <span className="min-w-0 truncate">{item.dish_name}</span>
                <span className="min-w-3 flex-1 translate-y-[-3px] border-b border-dotted border-etape-inactive" aria-hidden="true" />
                <span className="shrink-0 tabular-nums">{amount(item.line_total)}</span>
              </li>
            ))}
            {hidden > 0 && (
              <li className="text-ticket-doux">
                … et {hidden} {hidden > 1 ? "autres articles" : "autre article"}
              </li>
            )}
          </ul>
          {rule}
          <div className="flex items-baseline justify-between gap-2 text-[14px] font-bold">
            <span>TOTAL</span>
            <span className="tabular-nums">{formatPrice(receipt.total)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Payé par</span>
            <span>{receipt.method_display}</span>
          </div>
          {receipt.transaction_ref && (
            <div className="flex justify-between gap-2">
              <span>Réf.</span>
              <span className="truncate">{receipt.transaction_ref}</span>
            </div>
          )}
          <div className="mt-3 text-center font-bold tracking-wide">MERCI DE VOTRE VISITE !</div>
          <div className="mt-2 flex h-9 items-stretch justify-center gap-px" aria-hidden="true">
            {barcode.map((width, index) => (
              <span key={index} className={index % 2 ? "bg-transparent" : "bg-encre"} style={{ width }} />
            ))}
          </div>
          <div className="mt-1 text-center text-[10px] tracking-[0.2em] text-ticket-doux">{receipt.reference}</div>
        </motion.div>
      </div>
    </div>
  );
}
