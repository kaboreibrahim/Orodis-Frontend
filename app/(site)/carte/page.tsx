// Carte complète : anneau des catégories, CouvertureFlow des sous-catégories et des plats.
import type { Metadata } from "next";
import { MenuExplorer } from "@/components/menu/MenuExplorer";
import { MenuIndex } from "@/components/menu/MenuIndex";
import { NoCubeBadge } from "@/components/menu/NoCubeBadge";
import { JsonLd } from "@/components/seo/JsonLd";
import { getMenu } from "@/lib/api/menu";
import { getSettings } from "@/lib/api/settings";
import { breadcrumbJsonLd, LOCATION, menuJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 600;

export const metadata: Metadata = pageMetadata({
  title: "La carte et les prix",
  description: `Plats ivoiriens et européens, grillades, sauces, desserts et boissons : toute la carte des Délices d’Orodis à ${LOCATION.city}, avec les prix.`,
  path: "/carte",
});

export default async function CartePage() {
  const [menu, settings] = await Promise.all([getMenu(), getSettings()]);

  return (
    <main className="pb-16">
      <section className="mx-auto flex max-w-[1200px] flex-col items-center gap-1.5 px-5 pt-9 text-center">
        <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">Notre carte</span>
        <h1 className="text-[clamp(32px,4vw,54px)] leading-[1.04]">
          Que désirez-vous <span className="text-bordeaux italic">aujourd’hui&nbsp;?</span>
        </h1>
        <NoCubeBadge className="mt-2" />
      </section>
      <div className="mt-2">
        <MenuExplorer categories={menu} whatsapp={settings.whatsapp} headingLevel="h2" />
      </div>
      <MenuIndex menu={menu} />
      <JsonLd items={[menuJsonLd(menu), breadcrumbJsonLd([["La carte", "/carte"]])]} />
    </main>
  );
}
