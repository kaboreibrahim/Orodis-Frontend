// Création d'une table ou d'un lot de tables (maquette phase3/AdminTableNew). Réservée au gérant.
// Le QR de l'aperçu est un exemple : le vrai jeton est créé par Django avec la table.
import type { Metadata } from "next";
import QRCode from "qrcode";
import { TableCreator } from "@/components/staff/TableCreator";
import { requireStaff, type StaffTable, type StaffZone, staffApi } from "@/lib/api/staff";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = { title: "Nouvelle table" };
export const dynamic = "force-dynamic";

export default async function NewTablePage() {
  await requireStaff(["manager"], "/gestion/tables/nouvelle");
  const [tables, zones, sampleQr] = await Promise.all([
    staffApi<StaffTable[]>("/manage/tables/"),
    staffApi<StaffZone[]>("/manage/zones/"),
    QRCode.toString(`${siteUrl}/t/exemple`, { type: "svg", margin: 0, errorCorrectionLevel: "M" }),
  ]);
  return (
    <TableCreator
      taken={tables.map((table) => table.number)}
      initialZones={zones}
      sampleQr={sampleQr}
      siteHost={siteUrl.replace(/^https?:\/\//, "")}
    />
  );
}
