// Espace du personnel (/gestion et /api/gestion) : sans session, retour à la connexion.
// Le jeton d'accès (30 min) est rafraîchi ici, juste avant d'expirer, avec le jeton de rafraîchissement :
// les pages et les routes relais reçoivent toujours un jeton valable, sans que le navigateur le voie.
import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  jwtExpiresAt,
  LOGIN_PATH,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  staffCookieOptions,
} from "@/lib/staff-session";

export const config = { matcher: ["/gestion/:path*", "/api/gestion/:path*"] };

const REFRESH_MARGIN = 60; // secondes

async function refreshTokens(refresh: string): Promise<{ access: string; refresh: string } | null> {
  const base = process.env.API_URL;
  if (!base) return null;
  try {
    const response = await fetch(`${base.replace(/\/+$/, "")}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.access === "string" ? { access: data.access, refresh: data.refresh ?? refresh } : null;
  } catch {
    return null;
  }
}

function unauthenticated(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const response = isApi
    ? NextResponse.json({ detail: "Session expirée. Reconnectez-vous." }, { status: 401 })
    : NextResponse.redirect(
        new URL(`${LOGIN_PATH}?suite=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`, request.url),
      );
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === LOGIN_PATH) return NextResponse.next();

  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const expiresAt = jwtExpiresAt(access);
  if (access && expiresAt && expiresAt - Date.now() / 1000 > REFRESH_MARGIN) return NextResponse.next();
  if (!refresh) return unauthenticated(request);

  const tokens = await refreshTokens(refresh);
  if (!tokens) return unauthenticated(request);

  // Nouveaux jetons visibles tout de suite par la page (cookies de la requête) et gardés par le navigateur (réponse).
  request.cookies.set(ACCESS_COOKIE, tokens.access);
  request.cookies.set(REFRESH_COOKIE, tokens.refresh);
  const response = NextResponse.next({ request });
  response.cookies.set(ACCESS_COOKIE, tokens.access, staffCookieOptions(ACCESS_MAX_AGE));
  response.cookies.set(REFRESH_COOKIE, tokens.refresh, staffCookieOptions(REFRESH_MAX_AGE));
  return response;
}
