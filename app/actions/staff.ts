"use server";

// Connexion et déconnexion du personnel (docs/phase3.md, « Connexion du personnel côté Next.js »).
// Les jetons JWT vont dans des cookies httpOnly : le JavaScript du navigateur ne les voit jamais.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, api } from "@/lib/api/client";
import { homeFor, type StaffUser } from "@/lib/api/staff";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  LOGIN_PATH,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  safeNext,
  staffCookieOptions,
} from "@/lib/staff-session";

export type LoginState = { error?: string; username?: string };

export async function login(_previous: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!username || !password) return { error: "Saisissez votre identifiant et votre mot de passe.", username };

  let tokens: { access: string; refresh: string };
  try {
    tokens = await api("/auth/token/", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 401 || error.status === 400) return { error: "Identifiant ou mot de passe incorrect.", username };
    if (error.status === 403 || error.status === 429) {
      return { error: "Trop d’essais : ce compte est bloqué un moment. Réessayez plus tard ou prévenez le gérant.", username };
    }
    console.error(error);
    return { error: "Connexion impossible pour le moment. Réessayez dans un instant.", username };
  }

  let user: StaffUser;
  try {
    user = await api<StaffUser>("/auth/me/", { cache: "no-store", headers: { Authorization: `Bearer ${tokens.access}` } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { error: "Ce compte n’a pas accès à l’espace du personnel.", username };
    }
    console.error(error);
    return { error: "Connexion impossible pour le moment. Réessayez dans un instant.", username };
  }

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.access, staffCookieOptions(ACCESS_MAX_AGE));
  jar.set(REFRESH_COOKIE, tokens.refresh, staffCookieOptions(REFRESH_MAX_AGE));

  // Page demandée avant la connexion ; sinon l'accueil du rôle. La cuisine n'a accès qu'à son écran.
  const next = safeNext(String(form.get("suite") ?? ""));
  const home = homeFor(user.role);
  redirect(next === "/gestion" || (user.role === "kitchen" && !next.startsWith("/gestion/cuisine")) ? home : next);
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    // Jeton de rafraîchissement mis en liste noire ; un échec réseau n'empêche pas de se déconnecter ici.
    await api("/auth/logout/", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => undefined);
  }
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  redirect(LOGIN_PATH);
}
