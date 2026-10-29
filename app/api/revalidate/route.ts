// Appelé par Django quand la carte change : vérifie x-revalidate-secret puis revalidateTag("menu") (étape 8).

export function POST() {
  return Response.json({ detail: "Pas encore disponible." }, { status: 501 });
}
