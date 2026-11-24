// Vue d'ensemble du gérant (maquette phase3/AdminDashboard) : chiffres de la période, recettes, affluence par heure,
// catégories, moyens de paiement, plats les plus vendus, état de la salle et rapports PDF. Réservée au gérant.
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
