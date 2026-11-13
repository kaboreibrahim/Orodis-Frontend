// Tables & QR codes (maquette phase3/Tables) : réservé au gérant (routes /manage/tables/ côté Django).
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TablesBoard } from "@/components/staff/TablesBoard";
import { requireStaff, type StaffOrder, type StaffSession, type StaffTable, type StaffZone, staffApi } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Tables & QR codes" };
export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const user = await requireStaff(["manager", "cashier", "waiter"], "/gestion/tables");
  if (user.role !== "manager") redirect("/gestion");
  const [tables, zones, sessions, active] = await Promise.all([
    staffApi<StaffTable[]>("/manage/tables/"),
    staffApi<StaffZone[]>("/manage/zones/"),
    staffApi<StaffSession[]>("/manage/sessions/"),
    staffApi<{ results: StaffOrder[] }>("/manage/orders/?status=received,preparing,ready"),
  ]);
  return <TablesBoard initialTables={tables} zones={zones} initialSessions={sessions} initialActive={active.results} />;
}
