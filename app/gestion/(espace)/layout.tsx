// Gestion (ordinateur) : barre latérale de la maquette phase3/Gestion + contenu.
// La cuisine n'a pas accès à ces pages : requireStaff la renvoie vers son écran.
import { StaffSidebar } from "@/components/staff/StaffSidebar";
import { requireStaff } from "@/lib/api/staff";

export const dynamic = "force-dynamic";

export default async function ManagementLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff(["manager", "cashier", "waiter"]);
  return (
    <div className="flex min-h-dvh flex-col bg-creme md:flex-row">
      <StaffSidebar name={user.name} role={user.role} roleLabel={user.role_display} />
      <main className="flex min-w-0 flex-1 flex-col gap-5 px-5 py-6 md:px-7">{children}</main>
    </div>
  );
}
