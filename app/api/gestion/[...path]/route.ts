// Relais des écrans du personnel vers /manage/* de l'API, avec le JWT du cookie httpOnly.
// Le navigateur appelle /api/gestion/orders/12/advance ; Django reçoit /api/v1/manage/orders/12/advance/.
import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api/client";
import { readAccessToken } from "@/lib/api/staff";

export const dynamic = "force-dynamic";

/** Seules les ressources du personnel passent par ce relais. */
const ALLOWED = new Set(["orders", "requests", "sessions", "dishes", "receipts", "tables", "zones", "reservations", "quotes", "events"]);

type Context = { params: Promise<{ path: string[] }> };

async function relay(request: Request, { params }: Context) {
  const { path } = await params;
  if (!path.length || !ALLOWED.has(path[0]) || path.some((part) => !/^[\w.-]+$/.test(part))) {
    return NextResponse.json({ detail: "Route inconnue." }, { status: 404 });
  }
  const token = await readAccessToken();
  if (!token) return NextResponse.json({ detail: "Session expirée. Reconnectez-vous." }, { status: 401 });

  const last = path.at(-1)!;
  const target = `/manage/${path.join("/")}${/\.(pdf|png)$/.test(last) ? "" : "/"}${new URL(request.url).search}`;
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(apiUrl(target), {
      method: request.method,
      cache: "no-store",
      headers: {
        Accept: request.headers.get("accept") ?? "application/json",
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body || undefined,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ detail: "L’API ne répond pas." }, { status: 503 });
  }

  return new Response(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      ...(upstream.headers.get("content-disposition")
        ? { "Content-Disposition": upstream.headers.get("content-disposition")! }
        : {}),
      "Cache-Control": "no-store",
    },
  });
}

export { relay as GET, relay as POST, relay as PATCH };
