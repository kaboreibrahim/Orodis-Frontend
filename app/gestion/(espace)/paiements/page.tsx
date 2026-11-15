// Paiements du jour (maquette phase3/AdminPaiements) : reçus, totaux par moyen de paiement, reste à encaisser.
// Caisse et gérant. Le jour affiché se choisit dans la page ; ?jour=AAAA-MM-JJ ouvre directement un jour donné.
import type { Metadata } from "next";
import { PaymentsBoard } from "@/components/staff/PaymentsBoard";
import { requireStaff, type StaffPayments, staffApi } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Paiements" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ jour?: string }> };

export default async function PaymentsPage({ searchParams }: Props) {
  await requireStaff(["manager", "cashier"], "/gestion/paiements");
  const { jour } = await searchParams;
  const day = jour && /^\d{4}-\d{2}-\d{2}$/.test(jour) ? `?date=${jour}` : "";
  const initial = await staffApi<StaffPayments>(`/manage/payments/${day}`);
  return <PaymentsBoard initial={initial} />;
}
