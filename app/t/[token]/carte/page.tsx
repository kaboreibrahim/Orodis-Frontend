// Écran 2 de l'app de table (maquette phase3/Carte) : anneau des catégories, CouvertureFlow des plats, barre du panier.
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { NoCubeBadge } from "@/components/menu/NoCubeBadge";
import { AddedToast } from "@/components/table/AddedToast";
import { CartBar } from "@/components/table/CartBar";
import { TableHeader } from "@/components/table/TableHeader";
import { TableOrdersLink } from "@/components/table/TableOrdersLink";
import { getMenu } from "@/lib/api/menu";
import { requireTableSession } from "../session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ ajoute?: string }> };

export default async function TableMenuPage({ params, searchParams }: Props) {
  const [{ token: qr }, { ajoute }] = await Promise.all([params, searchParams]);
  const session = await requireTableSession(qr);
  const categories = await getMenu();
  const base = `/t/${encodeURIComponent(qr)}`;

  return (
    <main className="mx-auto min-h-dvh max-w-[1200px] pb-28">
      <TableHeader tableNumber={session.table.number} backHref={base} />
      <h1 className="mx-[22px] mt-1.5 text-[30px] leading-[1.05]">
        Que désirez-vous
        <br />
        <span className="text-bordeaux italic">aujourd’hui&nbsp;?</span>
      </h1>
      <NoCubeBadge className="mx-[22px] mt-2.5 text-[13px]" />
      <TableOrdersLink qr={qr} session={session} className="mx-[22px] mt-2.5" />
      <div className="mt-2">
        <MenuExplorer categories={categories} dishHrefBase={`${base}/plat`} compact />
      </div>
      <CartBar qr={qr} />
      <AddedToast name={ajoute?.slice(0, 80)} />
    </main>
  );
}
