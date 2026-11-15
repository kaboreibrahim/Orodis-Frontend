// Vue d'ensemble du gérant (maquette phase3/AdminDashboard) : chiffres de la période, 7 derniers jours,
// moyens de paiement, plats les plus vendus et état de la salle. Réservée au gérant.
import type { Metadata } from "next";
import { DashboardBoard } from "@/components/staff/DashboardBoard";
import { requireStaff, type StaffDashboard, staffApi } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Vue d’ensemble" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireStaff(["manager"], "/gestion/tableau-de-bord");
  const initial = await staffApi<StaffDashboard>("/manage/dashboard/?period=today");
  return <DashboardBoard name={user.name} initial={initial} />;
}
