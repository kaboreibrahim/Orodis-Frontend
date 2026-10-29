// Appelé par Django quand le gérant modifie la carte, les réglages ou les formules :
// POST {"tags": ["menu"]} avec l'en-tête x-revalidate-secret ; vide le cache Next.js de ces tags.
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const ALLOWED_TAGS = ["menu", "settings", "catering"];

function isValidSecret(provided: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isValidSecret(request.headers.get("x-revalidate-secret"))) {
    return NextResponse.json({ detail: "Secret de revalidation invalide." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const requested =
    body && typeof body === "object" && Array.isArray((body as { tags?: unknown }).tags)
      ? (body as { tags: unknown[] }).tags
      : ["menu"];
  const revalidated = ALLOWED_TAGS.filter((tag) => requested.includes(tag));
  for (const tag of revalidated) revalidateTag(tag);

  return NextResponse.json({ revalidated });
}
