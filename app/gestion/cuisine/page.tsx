// Écran cuisine (maquette phase3/Cuisine) : tablette en paysage, plein écran, sans barre latérale.
// Ouvert à tout le personnel ; seule la cuisine (et le gérant) fait avancer les tickets jusqu'à « Prête ».
import type { Metadata } from "next";
import { KitchenBoard } from "@/components/staff/KitchenBoard";
import { requireStaff, type StaffDish, type StaffOrder, staffApi } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Écran cuisine" };
export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = "received,preparing,ready";
const CAN_SET_AVAILABILITY = ["manager", "cashier", "kitchen"];

export default async function KitchenPage() {
  const user = await requireStaff(undefined, "/gestion/cuisine");
  const [orders, dishes] = await Promise.all([
    staffApi<{ results: StaffOrder[] }>(`/manage/orders/?status=${ACTIVE_STATUSES}`),
    CAN_SET_AVAILABILITY.includes(user.role) ? staffApi<StaffDish[]>("/manage/dishes/") : Promise.resolve(null),
  ]);
  return <KitchenBoard user={user} initialOrders={orders.results} initialDishes={dishes} />;
}
