// Appels de l'API au nom du personnel connecté, côté serveur uniquement (pages /gestion, Server Actions, relais).
// Le jeton d'accès est lu dans le cookie httpOnly ; middleware.ts l'a rafraîchi s'il allait expirer.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ACCESS_COOKIE, LOGIN_PATH } from "@/lib/staff-session";
import { ApiError, api } from "./client";
import type { components } from "./schema";

type Schemas = components["schemas"];
export type StaffUser = Schemas["Me"];
export type StaffOrder = Schemas["StaffOrder"];
export type StaffDish = Schemas["StaffDish"];
export type StaffRequest = Schemas["StaffServiceRequest"];
export type StaffSession = Schemas["OpenSessionSummary"];
export type StaffReceipt = Schemas["StaffReceipt"];
export type StaffTable = Schemas["Table"];
export type StaffZone = Schemas["Zone"];
export type StaffDashboard = Schemas["Dashboard"];
export type DashboardPeriod = StaffDashboard["period"];
export type StaffPayments = Schemas["Payments"];
export type ReceiptRow = Schemas["ReceiptRow"];
export type ManageCategory = Schemas["ManageCategory"];
export type ManageSubCategory = Schemas["ManageSubCategory"];
export type ManageDish = Schemas["ManageDish"];
export type ManageOptionGroup = Schemas["ManageOptionGroup"];
export type StaffMember = Schemas["StaffMember"];
export type StaffCredentials = Schemas["StaffCredentials"];
export type StaffRole = "manager" | "cashier" | "waiter" | "kitchen";

/** Page où l'on choisit son mot de passe ; obligatoire après un mot de passe provisoire donné par le gérant. */
export const PASSWORD_PATH = "/gestion/mot-de-passe";

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

/** Appel authentifié, sans cache ; lève ApiError comme api(). */
export async function staffApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await readAccessToken();
  if (!token) throw new ApiError("Session du personnel absente.", 401);
  return api<T>(path, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
  });
}

/** Membre du personnel connecté (une seule lecture par rendu) ; null sans session valable. */
export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  try {
    return await staffApi<StaffUser>("/auth/me/");
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null;
    throw error;
  }
});

/** Page du personnel : renvoie vers la connexion sans session, vers le choix du mot de passe tant que le compte
 *  a un mot de passe provisoire, et vers l'écran cuisine si le rôle n'a pas accès à la page
 *  (la cuisine ne voit que /gestion/cuisine). */
export async function requireStaff(roles?: readonly StaffRole[], from = "/gestion"): Promise<StaffUser> {
  const user = await getStaffUser();
  if (!user) redirect(`${LOGIN_PATH}?suite=${encodeURIComponent(from)}`);
  if (user.must_change_password && from !== PASSWORD_PATH) redirect(PASSWORD_PATH);
  if (roles && !roles.includes(user.role as StaffRole)) redirect("/gestion/cuisine");
  return user;
}

/** Page d'accueil de chaque rôle après la connexion. */
export function homeFor(role: string): string {
  return role === "kitchen" ? "/gestion/cuisine" : "/gestion";
}

/** Toutes les pages d'une liste paginée de commandes (100 par page ; 10 pages au plus, soit 1 000 commandes). */
export async function staffOrders(query: string): Promise<StaffOrder[]> {
  const all: StaffOrder[] = [];
  for (let page = 1; page <= 10; page++) {
    const data = await staffApi<{ results: StaffOrder[]; next: string | null }>(`/manage/orders/?${query}&page=${page}`);
    all.push(...data.results);
    if (!data.next) break;
  }
  return all;
}
