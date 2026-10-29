// « Pourquoi Orodis » : grille de cartes (horaires, livraison, pâtisserie, plats mis en avant,
// WhatsApp, deux cuisines, réservation).
import { ArrowRight, Bike, Cake, CakeSlice, Croissant } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { DishImage } from "@/components/menu/DishImage";
import { FadeUp } from "@/components/motion/FadeUp";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import type { DishDetail, RestaurantSettings } from "@/lib/api/types";
import { formatPhone, formatPrice, openDaysCount, summarizeHours } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

const AFRICAIN = ["Kedjenou", "Garba", "Sauce graine"];
const EUROPEEN = ["Burger", "Pizza", "Salade niçoise"];

type BentoProps = {
  settings: RestaurantSettings;
  dishes: DishDetail[];
};

function Card({ children, className, delay = 0 }: { children: ReactNode; className: string; delay?: number }) {
  return (
    <FadeUp as="article" delay={delay} className={`flex flex-col gap-4 rounded-[28px] p-[30px] ${className}`}>
      {children}
    </FadeUp>
  );
}

function IconTile({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`flex size-[52px] items-center justify-center rounded-2xl ${className}`}>{children}</span>;
}

export function Bento({ settings, dishes }: BentoProps) {
  const hours = settings.opening_hours;
  const summary = summarizeHours(hours);
  const allDay = summary[0] === "Ouvert 24h/24, 7j/7";
  const openDays = openDaysCount(hours);

  return (
    <section className="mx-auto flex max-w-[1200px] flex-col gap-9 px-6 pt-[72px]">
      <FadeUp className="flex max-w-[680px] flex-col gap-2.5">
        <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">Pourquoi Orodis</span>
        <h2 className="text-[clamp(36px,4.4vw,60px)] leading-[1.02]">
          Deux cuisines, <span className="text-bordeaux italic">un seul</span> savoir-faire.
        </h2>
      </FadeUp>

      <div className="grid grid-flow-dense grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] gap-[18px]">
        <Card className="relative min-h-[320px] justify-between overflow-hidden bg-encre text-creme">
          <div>
            <h3 className="text-[28px]">
              {allDay ? "Ouvert jour et nuit." : openDays === 7 ? "Ouvert tous les jours." : "Nos horaires."}
            </h3>
            {summary.map((line) => (
              <p key={line} className="mt-2 max-w-[280px] text-texte-sur-encre">
                {line}
              </p>
            ))}
            <p className="mt-2 max-w-[280px] text-texte-sur-encre">Sur place ou à emporter.</p>
          </div>
          <span className="font-display text-[96px] leading-[0.9] font-bold text-jaune">
            {allDay ? "24/7" : `${openDays}j/7`}
          </span>
          <span
            aria-hidden="true"
            className="absolute -right-[50px] -bottom-[50px] size-[200px] rounded-full border-[18px] border-jaune/15"
          />
        </Card>

        <Card delay={0.06} className="min-h-[320px] border border-bordure bg-white">
          <IconTile className="bg-rose">
            <Bike size={28} className="text-bordeaux" />
          </IconTile>
          <h3 className="text-[28px]">Livré chaud, chez vous.</h3>
          <p className="text-texte-doux">
            Commandez par téléphone ou sur WhatsApp, payez par Mobile Money ou en espèces à la livraison.
          </p>
          <div aria-hidden="true" className="relative mt-auto h-[70px] overflow-hidden rounded-2xl bg-sable">
            <span className="absolute inset-x-0 top-[30px] h-2.5 bg-white" />
            <span className="absolute inset-y-0 left-[30%] w-2.5 bg-white" />
            <span className="absolute top-6 left-6 size-[22px] rounded-full border-[3px] border-white bg-bordeaux" />
            <span className="absolute top-[33px] right-[52px] left-[46px] border-t-4 border-dashed border-bordeaux" />
            <span className="absolute top-6 right-[26px] size-[22px] rounded-full border-[3px] border-white bg-encre" />
          </div>
        </Card>

        <Card delay={0.12} className="min-h-[320px] bg-bordeaux text-creme">
          <IconTile className="bg-creme/15">
            <Cake size={28} className="text-jaune" />
          </IconTile>
          <h3 className="text-[28px]">Pâtisserie maison.</h3>
          <p className="text-rose">
            Croissants du matin, gâteaux d’anniversaire, douceurs du goûter : tout est préparé sur place.
          </p>
          <div aria-hidden="true" className="mt-auto grid grid-cols-3 gap-2">
            {[Croissant, CakeSlice, Cake].map((Icon, i) => (
              <span key={i} className="flex h-[70px] items-center justify-center rounded-xl bg-creme/12">
                <Icon size={30} className="text-rose" strokeWidth={1.6} />
              </span>
            ))}
          </div>
        </Card>

        {dishes.length > 0 && (
          <Card delay={0.06} className="border border-bordure bg-white md:col-span-2">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-[28px]">Nos incontournables.</h3>
              <Link href="/carte" className="inline-flex items-center gap-1.5 py-2 font-bold text-bordeaux hover:underline">
                Toute la carte <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {dishes.slice(0, 4).map((dish) => (
                <li key={dish.id}>
                  <Link
                    href={dish.slug ? `/carte/${dish.slug}` : "/carte"}
                    className="group flex items-center gap-4 rounded-[20px] bg-sable p-3 transition-colors hover:bg-rose"
                  >
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl">
                      <DishImage dish={dish} sizes="80px" initialClassName="text-4xl" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-display text-lg leading-tight font-bold">{dish.name}</span>
                      {dish.description && <span className="line-clamp-2 text-sm text-texte-doux">{dish.description}</span>}
                      <span className="font-bold text-bordeaux">{formatPrice(dish.price)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {settings.whatsapp && (
          <Card delay={0.12} className="bg-sable">
            <WhatsAppLogo size={52} />
            <h3 className="text-[28px]">Une question ? Un message.</h3>
            <p className="text-texte-doux">L’équipe répond sur WhatsApp, pour une commande, une réservation ou un devis.</p>
            <a
              href={whatsappLink(settings.whatsapp, "Bonjour Les Délices d’Orodis, ")}
              className="mt-auto py-2 font-bold text-bordeaux underline underline-offset-4"
            >
              {formatPhone(settings.whatsapp)}
            </a>
          </Card>
        )}

        <Card delay={0.06} className="border border-bordure bg-white md:col-span-2">
          <h3 className="text-[28px]">Africain ou européen ?</h3>
          <p className="text-texte-doux">Kedjenou ou burger, attiéké poisson ou pizza : à chacun son envie, à la même table.</p>
          <div className="flex flex-wrap gap-2">
            {AFRICAIN.map((name) => (
              <span key={name} className="rounded-full bg-rose px-3.5 py-[7px] text-sm font-bold text-bordeaux">
                {name}
              </span>
            ))}
            {EUROPEEN.map((name) => (
              <span key={name} className="rounded-full bg-sable px-3.5 py-[7px] text-sm font-bold text-encre">
                {name}
              </span>
            ))}
          </div>
        </Card>

        <Card delay={0.12} className="bg-rose">
          <h3 className="text-[28px]">Une table pour ce soir ?</h3>
          <p className="text-texte-doux">Réservez en une minute, le restaurant vous confirme sur WhatsApp.</p>
          <Link
            href="/#reserver"
            className="mt-auto flex h-12 items-center justify-center self-start rounded-full bg-bordeaux px-6 font-bold text-creme transition-opacity hover:opacity-90"
          >
            Réserver une table
          </Link>
        </Card>
      </div>
    </section>
  );
}
