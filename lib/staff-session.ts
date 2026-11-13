// Session du personnel (docs/phase3.md, « Connexion du personnel côté Next.js ») : constantes partagées par
// middleware.ts (runtime edge) et le code serveur. Le JWT vit dans deux cookies httpOnly ; le navigateur ne le lit jamais.

export const ACCESS_COOKIE = "orodis_acces";
export const REFRESH_COOKIE = "orodis_rafraichissement";

/** Durées alignées sur SIMPLE_JWT du backend : accès 30 min, rafraîchissement 7 jours. */
export const ACCESS_MAX_AGE = 30 * 60;
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export const LOGIN_PATH = "/gestion/connexion";

export function staffCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Expiration (secondes depuis 1970) lue dans le JWT, sans vérifier la signature : sert seulement
 *  à le rafraîchir à temps. La vérification reste faite par Django à chaque appel. */
export function jwtExpiresAt(token: string | undefined): number | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

/** Page de retour après connexion : uniquement une page de /gestion, jamais une adresse extérieure. */
export function safeNext(value: string | null | undefined): string {
  return value && value.startsWith("/gestion") && !value.startsWith("//") && value !== LOGIN_PATH ? value : "/gestion";
}
