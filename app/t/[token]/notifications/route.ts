// Notifications push du téléphone de la table : clé publique (GET) et abonnement (POST) vers /table/push/.
// Sous /t/<qr> : seul chemin où le cookie httpOnly de la session est envoyé ; le jeton reste côté serveur.
import { forwardTablePush } from "@/lib/api/table-push";

export const dynamic = "force-dynamic";

export async function GET() {
  return forwardTablePush("push/");
}

export async function POST(request: Request) {
  return forwardTablePush("push/", { method: "POST", body: await request.text() });
}
