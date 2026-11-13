// Reçu à l'écran (maquette phase3/RecuEcran) : ticket, téléchargement du PDF, partage WhatsApp.
// Lisible après le paiement, quand la session est fermée.
import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SuccessCheck } from "@/components/ui/SuccessCheck";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import { getSettings } from "@/lib/api/settings";
import { getTableReceipt, readSessionToken, type TableReceipt } from "@/lib/api/table";
import { formatPrice } from "@/lib/format";
import { requireTableSession } from "../../session";

export const dynamic = "force-dynamic";

const METHOD_DOT: Record<string, string> = {
  wave: "bg-wave",
  orange_money: "bg-orange-money",
  mtn_momo: "bg-mtn",
  cash: "bg-especes",
};

/** « 30 oct. 2026 · 14:32 », heure d'Abidjan */
function receiptDate(iso: string) {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Abidjan", day: "numeric", month: "short", year: "numeric" }).format(date);
  const time = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Abidjan", hour: "2-digit", minute: "2-digit" }).format(date);
  return `${day} · ${time}`;
}

/** Texte partagé sur WhatsApp : le client choisit à qui l'envoyer (wa.me sans numéro). */
function shareText(receipt: TableReceipt, restaurant: string) {
  const lines = receipt.orders.flatMap((order) =>
    order.items.map(
      (item) =>
        `${item.quantity} × ${item.dish_name}${item.options_label ? ` (${item.options_label})` : ""} : ${formatPrice(item.line_total)}`,
    ),
  );
  return [
    `Reçu ${receipt.reference} · ${restaurant}`,
    `${receipt.table_number ? `Table ${receipt.table_number} · ` : ""}${receiptDate(receipt.paid_at)}`,
    ...lines,
    `Total payé : ${formatPrice(receipt.total)} (${receipt.method_display})`,
  ].join("\n");
}

type Props = { params: Promise<{ token: string; number: string }> };

export default async function TableReceiptPage({ params }: Props) {
  const { token: qr, number } = await params;
  if (!/^\d{1,9}$/.test(number)) notFound();
  await requireTableSession(qr, { allowClosed: true });
  const [receipt, settings] = await Promise.all([
    getTableReceipt((await readSessionToken())!, Number(number)),
    getSettings(),
  ]);
  if (!receipt) notFound();
  const base = `/t/${encodeURIComponent(qr)}`;
  const items = receipt.orders.flatMap((order) => order.items);
  const restaurant = settings.name ?? "Les Délices d’Orodis";

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col pb-44">
      <div className="flex flex-col items-center gap-2.5 px-5 pt-[26px] text-center">
        <SuccessCheck size={72} />
        <h1 className="text-[28px]">Paiement confirmé</h1>
        <p className="text-[15px] text-texte-doux">Merci ! Voici votre reçu.</p>
      </div>

      {/* Ticket */}
      <div className="mx-5 mt-[18px] rounded-t-[20px] bg-white px-5 pt-[18px] pb-3.5 shadow-carte">
        <div className="flex items-center justify-between">
          <Image src="/logo-delices-orodis-web.png" alt={restaurant} width={61} height={54} className="h-[54px] w-auto" />
          <div className="text-right text-[12.5px] leading-snug text-texte-doux">
            Reçu n° <strong className="text-encre">{receipt.reference}</strong>
            <br />
            {receiptDate(receipt.paid_at)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[12.5px] font-bold">
          {receipt.table_number && <span className="rounded-full bg-sable px-2.5 py-1">Table {receipt.table_number}</span>}
          {receipt.orders.map((order) => (
            <span key={order.number} className="rounded-full bg-sable px-2.5 py-1">
              Commande n° {order.number}
            </span>
          ))}
          <span className="rounded-full bg-sable px-2.5 py-1">{receipt.table_number ? "Sur place" : "Comptoir"}</span>
        </div>

        <div className="my-3.5 border-t-[1.5px] border-dashed border-bordure" />
        <ul className="flex flex-col gap-2.5 text-[14.5px]">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between gap-2.5">
              <div>
                <strong>
                  {item.quantity}× {item.dish_name}
                </strong>
                {(item.options_label || item.note) && (
                  <div className="text-[12.5px] text-texte-doux">
                    {[item.options_label, item.note && `« ${item.note} »`].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <span className="whitespace-nowrap">{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="my-3 border-t-[1.5px] border-dashed border-bordure" />
        <div className="flex justify-between text-sm text-texte-doux">
          <span>Sous-total</span>
          <span>{formatPrice(receipt.total)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm text-texte-doux">
          <span>Service à table</span>
          <span>Inclus</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-display text-xl font-bold">Total payé</span>
          <span className="font-display text-[26px] font-bold text-bordeaux">{formatPrice(receipt.total)}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-whatsapp/10 px-3 py-2 text-[13px] font-bold">
          <span className="flex items-center gap-2">
            <span className={`size-4 rounded-full ${METHOD_DOT[receipt.method] ?? "bg-especes"}`} aria-hidden="true" />
            Payé par {receipt.method_display}
          </span>
          {receipt.transaction_ref && <span className="font-medium">Réf. {receipt.transaction_ref}</span>}
        </div>
        <p className="mt-3 text-center text-xs text-texte-doux">Prix TTC en francs CFA · Merci de votre visite&nbsp;!</p>
      </div>
      {/* Bord dentelé du ticket */}
      <svg viewBox="0 0 350 14" preserveAspectRatio="none" aria-hidden="true" className="mx-5 block h-3.5 w-[calc(100%-40px)]">
        <path
          className="fill-white"
          d="M0 0H350V2L340 12L330 2L320 12L310 2L300 12L290 2L280 12L270 2L260 12L250 2L240 12L230 2L220 12L210 2L200 12L190 2L180 12L170 2L160 12L150 2L140 12L130 2L120 12L110 2L100 12L90 2L80 12L70 2L60 12L50 2L40 12L30 2L20 12L10 2L0 12Z"
        />
      </svg>

      {/* Actions */}
      <div className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-[448px] flex-col gap-2.5">
        <a
          href={`${base}/recu/${number}/pdf`}
          className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-bordeaux font-bold text-creme shadow-relief"
        >
          <Download size={20} className="text-jaune" aria-hidden="true" />
          Télécharger le reçu (PDF)
        </a>
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText(receipt, restaurant))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[52px] items-center justify-center gap-2 rounded-full border-[1.5px] border-whatsapp bg-white text-[14.5px] font-bold text-encre"
          >
            <WhatsAppLogo size={20} />
            Sur WhatsApp
          </a>
          <Link
            href={base}
            className="flex h-[52px] items-center justify-center rounded-full border-[1.5px] border-bordure bg-white text-[14.5px] font-bold text-encre"
          >
            Terminer
          </Link>
        </div>
      </div>
    </main>
  );
}
