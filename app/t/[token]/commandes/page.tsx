// Commandes de la table : tout ce qui a été commandé depuis l'ouverture de la session, par n'importe quel
// téléphone de la table, jusqu'à l'encaissement (la session se ferme alors et la liste repart à zéro).
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ServiceButtons } from "@/components/table/ServiceButtons";
import { STATUS_PILL } from "@/components/table/orderStatus";
import { TableHeader } from "@/components/table/TableHeader";
import { formatPrice, formatTime } from "@/lib/format";
import { requireTableSession } from "../session";

export const dynamic = "force-dynamic";

export default async function TableOrdersPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: qr } = await params;
  const session = await requireTableSession(qr);
  const base = `/t/${encodeURIComponent(qr)}`;
  const orders = [...session.orders].sort((a, b) => a.number - b.number);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col pb-10">
      <TableHeader tableNumber={session.table.number} backHref={base} />
      <div className="flex flex-col gap-3.5 px-5 pt-2.5">
        <h1 className="text-[30px] leading-[1.05]">
          Commandes de la <span className="text-bordeaux italic">table</span>
        </h1>
        <p className="text-sm text-texte-doux">Tout ce qui a été commandé à cette table, jusqu’au passage en caisse.</p>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[22px] bg-white p-6 text-center">
            <p className="text-texte-doux">Aucune commande pour le moment.</p>
            <Link href={`${base}/carte`} className="flex h-12 items-center rounded-full bg-bordeaux px-6 font-bold text-creme">
              Voir la carte
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.number}>
                <Link href={`${base}/suivi/${order.number}`} className="flex flex-col gap-2.5 rounded-[22px] bg-white p-4 shadow-pilule">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">
                      Commande n° {order.number}
                      <span className="ml-2 text-[13px] font-medium text-texte-doux">{formatTime(order.created_at)}</span>
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_PILL[order.status ?? "received"]}`}>
                      {order.status_display}
                    </span>
                  </div>
                  <ul className={`flex flex-col gap-1 text-[14.5px] ${order.status === "cancelled" ? "line-through opacity-60" : ""}`}>
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between gap-2.5">
                        <span>
                          {item.quantity}× {item.dish_name}
                          {item.options_label && <span className="text-[12.5px] text-texte-doux"> · {item.options_label}</span>}
                        </span>
                        <span className="whitespace-nowrap">{formatPrice(item.line_total)}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="flex items-center justify-end gap-1 text-sm font-bold text-bordeaux">
                    Suivre <ChevronRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {orders.length > 0 && (
          <div className="flex items-baseline justify-between rounded-[22px] bg-bordeaux px-5 py-4 text-creme">
            <span className="font-display text-xl font-bold">Addition en cours</span>
            <span className="font-display text-[26px] font-bold text-jaune">{formatPrice(session.total)}</span>
          </div>
        )}
        <ServiceButtons tableNumber={session.table.number} />
      </div>
    </main>
  );
}
