// Lien « Commandes de la table · N · total » : affiché dès qu'une commande existe dans la session.
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import type { TableSessionState } from "@/lib/api/table";
import { formatPrice } from "@/lib/format";

export function TableOrdersLink({ qr, session, className = "" }: { qr: string; session: TableSessionState; className?: string }) {
  const count = session.orders.filter((order) => order.status !== "cancelled").length;
  if (count === 0) return null;
  return (
    <Link
      href={`/t/${encodeURIComponent(qr)}/commandes`}
      className={`flex min-h-14 items-center justify-between gap-3 rounded-[18px] border-[1.5px] border-bordeaux bg-white px-4 font-bold text-bordeaux ${className}`}
    >
      <span className="flex items-center gap-2.5">
        <ReceiptText size={20} aria-hidden="true" />
        Commandes de la table · {count}
      </span>
      <span>{formatPrice(session.total)}</span>
    </Link>
  );
}
