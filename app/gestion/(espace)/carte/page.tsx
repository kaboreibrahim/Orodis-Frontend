// Carte & menus (maquette phase3/AdminCarte) : catégories, sous-catégories, plats, options et photos.
// Réservée au gérant. Chaque enregistrement vide le cache de la carte publique côté Django.
import type { Metadata } from "next";
import { MenuBoard } from "@/components/staff/MenuBoard";
import { type ManageCategory, requireStaff, staffApi } from "@/lib/api/staff";

export const metadata: Metadata = { title: "Carte & menus" };
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  await requireStaff(["manager"], "/gestion/carte");
  const initial = await staffApi<ManageCategory[]>("/manage/menu/");
  return <MenuBoard initial={initial} />;
}
