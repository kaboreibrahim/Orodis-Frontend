// Personnel : comptes du personnel, rôles, accès et mots de passe provisoires. Réservé au gérant.
import type { Metadata } from "next";
import { StaffBoard } from "@/components/staff/StaffBoard";
import { requireStaff, type StaffMember, staffApi } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Personnel" };
export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const user = await requireStaff(["manager"], "/gestion/personnel");
  const members = await staffApi<StaffMember[]>("/manage/staff/");
  return <StaffBoard initial={members} meId={user.id} />;
}
