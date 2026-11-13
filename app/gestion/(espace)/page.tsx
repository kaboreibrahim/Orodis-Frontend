// Commandes (maquette phase3/Gestion) : commandes du jour, alertes des tables, encaissement et reçus.
import type { Metadata } from "next";
import { OrdersBoard } from "@/components/staff/OrdersBoard";
import { requireStaff, type StaffRequest, type StaffSession, staffApi, staffOrders } from "@/lib/api/staff";
import { todayIso } from "@/lib/format";

export const metadata: Metadata = { title: "Commandes" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireStaff(["manager", "cashier", "waiter"]);
  const today = todayIso();
  const [orders, requests, sessions] = await Promise.all([
    staffOrders(`date=${today}`),
    staffApi<StaffRequest[]>("/manage/requests/"),
    staffApi<StaffSession[]>("/manage/sessions/"),
  ]);
  return <OrdersBoard user={user} today={today} initialOrders={orders} initialRequests={requests} initialSessions={sessions} />;
}
