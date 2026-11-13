// Écran 3 de l'app de table (maquette phase3/Fiche) : options, précision pour la cuisine, quantité, ajout au panier.
import { notFound } from "next/navigation";
import { DishOrder } from "@/components/table/DishOrder";
import { getDish, getMenu } from "@/lib/api/menu";
import { requireTableSession } from "../../session";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string; slug: string }> };

export default async function TableDishPage({ params }: Props) {
  const { token: qr, slug } = await params;
  await requireTableSession(qr);
  const [dish, menu] = await Promise.all([getDish(slug), getMenu()]);
  if (!dish) notFound(); // plat inconnu, retiré ou en rupture
  // L'API donne l'identifiant de la catégorie : son nom vient de la carte (même logique que /carte/[slug])
  const categoryName = menu.find((category) => category.slug === dish.category)?.name;
  const path = [categoryName, dish.subcategory].filter(Boolean).join(" · ");
  return <DishOrder qr={qr} dish={dish} path={path} />;
}
