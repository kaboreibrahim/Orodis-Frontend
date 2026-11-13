// Écran 4 de l'app de table (maquette phase3/Panier) : lignes modifiables, paiement, envoi en cuisine.
import { CartView } from "@/components/table/CartView";
import { requireTableSession } from "../session";

export const dynamic = "force-dynamic";

export default async function TableCartPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: qr } = await params;
  const session = await requireTableSession(qr);
  return <CartView qr={qr} tableNumber={session.table.number} />;
}
