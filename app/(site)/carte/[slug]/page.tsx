// Fiche d'un plat : photo (ou initiale), description, prix, options. Une page statique par plat,
// régénérée toutes les 10 minutes ; un plat ajouté depuis est généré à la première visite.
import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DishImage } from "@/components/menu/DishImage";
import { DishOptions } from "@/components/menu/DishOptions";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import { getDish, getDishSlugs, getMenu } from "@/lib/api/menu";
import { getSettings } from "@/lib/api/settings";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 600;

type DishPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getDishSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DishPageProps): Promise<Metadata> {
  const dish = await getDish((await params).slug);
  if (!dish) return { title: "Plat introuvable" };
  return {
    title: dish.name,
    description: `${dish.name}, ${formatPrice(dish.price)}${dish.description ? ` : ${dish.description}` : ""}`,
    openGraph: dish.photo ? { images: [dish.photo] } : undefined,
  };
}

export default async function DishPage({ params }: DishPageProps) {
  const { slug } = await params;
  const [dish, menu, settings] = await Promise.all([getDish(slug), getMenu(), getSettings()]);
  if (!dish) notFound();

  const categoryName = menu.find((category) => category.slug === dish.category)?.name;
  const path = [categoryName, dish.subcategory].filter(Boolean).join(" · ");

  return (
    <main className="mx-auto max-w-[1100px] px-5 pt-8 pb-24">
      <Link href="/carte" className="inline-flex items-center gap-2 py-3 font-bold text-bordeaux hover:underline">
        <ArrowLeft size={18} aria-hidden="true" /> Toute la carte
      </Link>

      <article className="mt-4 flex flex-wrap gap-x-12 gap-y-8">
        <div className="relative aspect-[4/3] min-w-0 flex-[1_1_420px] overflow-hidden rounded-[26px] bg-rose">
          <DishImage dish={dish} sizes="(min-width: 1100px) 560px, 100vw" priority initialClassName="text-[140px]" />
        </div>

        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4">
          {path && <span className="text-xs font-bold tracking-[0.12em] text-bordeaux uppercase">{path}</span>}
          <h1 className="text-[clamp(34px,4.4vw,54px)] leading-[1.04]">{dish.name}</h1>
          {dish.description && <p className="text-lg text-texte-doux">{dish.description}</p>}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-display text-3xl font-bold">{formatPrice(dish.price)}</span>
            {dish.prep_minutes ? (
              <span className="inline-flex items-center gap-1.5 text-texte-doux">
                <Clock size={18} aria-hidden="true" /> environ {dish.prep_minutes} min de préparation
              </span>
            ) : null}
          </div>

          <DishOptions groups={dish.option_groups} />

          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href={whatsappLink(settings.whatsapp, `Bonjour, je voudrais commander : ${dish.name} (${formatPrice(dish.price)}).`)}
              className="flex h-14 items-center gap-2 rounded-full bg-whatsapp px-7 text-[17px] font-bold text-creme"
            >
              <WhatsAppLogo size={26} className="ring-2 ring-creme/60" /> Commander sur WhatsApp
            </a>
            <Link
              href="/reserver"
              className="flex h-14 items-center rounded-full border-[1.5px] border-encre px-7 text-[17px] font-bold text-encre hover:bg-sable"
            >
              Réserver une table
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
