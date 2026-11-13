// Écran 5 de l'app de table (maquette phase3/Suivi) : état de la commande en direct.
// Reste lisible après le paiement (session fermée) : le lien vers le reçu y apparaît.
import { notFound } from "next/navigation";
import { OrderTracking } from "@/components/table/OrderTracking";
import { getTableOrder, readSessionToken } from "@/lib/api/table";
import { requireTableSession } from "../../session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string; number: string }> };

export default async function TableTrackingPage({ params }: Props) {
  const { token: qr, number } = await params;
  if (!/^\d{1,9}$/.test(number)) notFound();
  const session = await requireTableSession(qr, { allowClosed: true });
  const order = await getTableOrder((await readSessionToken())!, Number(number));
  if (!order) notFound();
  return (
    <OrderTracking qr={qr} tableNumber={session.table.number} order={order} sessionClosed={session.status === "closed"} />
  );
}
