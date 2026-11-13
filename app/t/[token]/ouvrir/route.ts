// Ouvre (ou reprend) la session de la table scannée, range son jeton dans un cookie httpOnly,
// puis renvoie vers l'accueil de la table. QR inconnu, régénéré ou table désactivée → page « QR plus valable ».
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE, openTableSession } from "@/lib/api/table";

export const dynamic = "force-dynamic";

/** Redirection relative : elle reste juste derrière un tunnel ou un proxy (zrok, Coolify). */
function redirect(location: string) {
  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const base = `/t/${encodeURIComponent(token)}`;

  let opened;
  try {
    opened = await openTableSession(token);
  } catch (error) {
    console.error(error);
    return redirect(`${base}/invalide?raison=indisponible`);
  }
  if (!opened) return redirect(`${base}/invalide`);

  (await cookies()).set(SESSION_COOKIE, opened.session_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: base,
    maxAge: SESSION_MAX_AGE,
  });
  return redirect(base);
}
