// Ticket de caisse 80 mm (maquette phase3/Ticket80) : imprimé depuis le navigateur sur l'imprimante thermique
// installée sur l'ordinateur de caisse. Mêmes données que le reçu à l'écran et le PDF A4 (Receipt + réglages).
import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "@/components/staff/PrintButton";
import { ApiError } from "@/lib/api/client";
import { getSettings } from "@/lib/api/settings";
import { requireStaff, type StaffReceipt, staffApi } from "@/lib/api/staff";
import { formatPhone, summarizeHours } from "@/lib/format";
import { siteUrl } from "@/lib/seo";

const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = { title: "Ticket de caisse" };
export const dynamic = "force-dynamic";

const TO_FILL = "[À COMPLÉTER]";
const amount = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ");

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ imprimer?: string }> };

export default async function TicketPage({ params, searchParams }: Props) {
  const { number } = await params;
  if (!/^\d{1,9}$/.test(number)) notFound();
  await requireStaff(["cashier", "manager"], `/gestion/recus/${number}/ticket`);

  let receipt: StaffReceipt;
  try {
    receipt = await staffApi<StaffReceipt>(`/manage/receipts/${number}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const settings = await getSettings();
  const qr = await QRCode.toString(siteUrl, { type: "svg", margin: 0, errorCorrectionLevel: "M" });

  const paidAt = new Date(receipt.paid_at);
  const date = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Abidjan",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(paidAt)
    .replace(",", "");
  const items = receipt.orders.flatMap((o) => o.items);
  const articles = items.reduce((n, i) => n + i.quantity, 0);
  const legal = receipt.legal;
  const hours = summarizeHours(settings.opening_hours)[0];
  const row = "flex justify-between gap-2";

  return (
    <div className="flex min-h-dvh flex-col items-center gap-5 bg-sable py-8 print:block print:min-h-0 print:bg-white print:p-0">
      {/* Papier thermique de 80 mm, sans marge ; seulement sur cette page (le reste du site s'imprime en A4).
          La hauteur est ajustée au ticket par PrintButton ; 297 mm tant que le script n'a pas mesuré. */}
      <style id="ticket-page">{"@page { size: 80mm 297mm; margin: 0; }"}</style>
      <style>{"@media print { body { background: white; } }"}</style>
      <div className="flex items-center gap-3 print:hidden">
        <PrintButton auto={(await searchParams).imprimer === "1"} />
      </div>

      <article
        id="ticket"
        className={`${mono.className} flex w-[80mm] flex-col gap-2.5 bg-white px-[5mm] py-[6mm] text-[12px] leading-[1.45] text-black shadow-carte print:shadow-none`}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <Image
            src="/logo-delices-orodis-web.png"
            alt="Les Délices d’Orodis"
            width={150}
            height={133}
            className="h-auto w-[38mm] contrast-[1.6] brightness-[0.85] grayscale"
            priority
          />
          <div className="mt-1 text-[13px] font-bold tracking-[0.04em]">LES DÉLICES D’ORODIS</div>
          <div>Pâtisserie · Restauration · Service</div>
          <div className="whitespace-pre-line">{settings.address || "[Adresse, quartier]"}</div>
          {settings.phone && <div>Tél. {formatPhone(settings.phone)}</div>}
          {settings.whatsapp && <div>WhatsApp {formatPhone(settings.whatsapp)}</div>}
          <div>RCCM {legal.rccm || TO_FILL}</div>
          <div>N° CC {legal.ncc || TO_FILL}</div>
        </div>

        <div className="border-t-[1.5px] border-dashed border-black" />

        <div className="flex flex-col gap-0.5">
          <div className={row}>
            <span>Reçu</span>
            <span className="font-bold">{receipt.reference}</span>
          </div>
          <div className={row}>
            <span>Date</span>
            <span>{date}</span>
          </div>
          <div className={row}>
            <span>Commande{receipt.orders.length > 1 ? "s" : ""}</span>
            <span className="text-right">{receipt.orders.map((o) => `n° ${o.number}`).join(", ")}</span>
          </div>
          <div className={row}>
            <span>{receipt.table_number != null ? "Table" : "Vente"}</span>
            <span>{receipt.table_number != null ? `${receipt.table_number} · sur place` : "au comptoir"}</span>
          </div>
          {receipt.cashier && (
            <div className={row}>
              <span>Caisse</span>
              <span>{receipt.cashier}</span>
            </div>
          )}
        </div>

        <div className="border-t-[1.5px] border-dashed border-black" />

        <div className={`${row} font-bold`}>
          <span>QTÉ ARTICLE</span>
          <span>MONTANT</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div key={i}>
              <div className={row}>
                <span>
                  {item.quantity} {item.dish_name}
                </span>
                <span className="whitespace-nowrap">{amount(item.line_total ?? 0)}</span>
              </div>
              {item.options_label && <div className="pl-4">{item.options_label.replace(/ · /g, ", ")}</div>}
            </div>
          ))}
        </div>

        <div className="border-t-[1.5px] border-dashed border-black" />

        <div className="flex flex-col gap-0.5">
          <div className={row}>
            <span>Sous-total</span>
            <span>{amount(receipt.total)}</span>
          </div>
          <div className={row}>
            <span>Service</span>
            <span>inclus</span>
          </div>
          <div className={row}>
            <span>Articles</span>
            <span>{articles}</span>
          </div>
          {legal.vat_rate && (
            <div className={row}>
              <span>dont TVA</span>
              <span>{String(Number(legal.vat_rate)).replace(".", ",")} %</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between border-y-2 border-black py-1.5 font-bold">
          <span className="text-[14px]">TOTAL TTC</span>
          <span className="text-[18px]">{amount(receipt.total)} F</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className={row}>
            <span>Payé par</span>
            <span>{receipt.method_display}</span>
          </div>
          {receipt.transaction_ref && (
            <div className={row}>
              <span>Réf.</span>
              <span className="break-all text-right">{receipt.transaction_ref}</span>
            </div>
          )}
        </div>

        <div className="border-t-[1.5px] border-dashed border-black" />

        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="size-[26mm] [&_svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
          <div>
            Scannez pour retrouver notre carte
            <br />
            et réserver votre table
          </div>
        </div>

        <div className="mt-1 text-center font-bold">MERCI DE VOTRE VISITE !</div>
        <div className="text-center">
          {hours && (
            <>
              {hours.replace(", ", " · ")}
              <br />
            </>
          )}
          {new URL(siteUrl).host}
        </div>
        <div className="text-center text-[11px]">Montants en francs CFA, TTC</div>
      </article>
    </div>
  );
}
