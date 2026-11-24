// Le client ne veut plus être prévenu : retrait de l'abonnement de ce téléphone (/table/push/remove/).
import { forwardTablePush } from "@/lib/api/table-push";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return forwardTablePush("push/remove/", { method: "POST", body: await request.text() });
}
