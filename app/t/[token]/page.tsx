// Écran 1 de l'app de table (maquette phase3/Main) : bienvenue, carte, appel serveur, addition.
import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { OpenBadge } from "@/components/home/OpenBadge";
import { DishImage } from "@/components/menu/DishImage";
import { ServiceButtons } from "@/components/table/ServiceButtons";
import { TableHeader } from "@/components/table/TableHeader";
import { TableOrdersLink } from "@/components/table/TableOrdersLink";
import { Reveal, WelcomeExperience } from "@/components/table/WelcomeExperience";
import { getFeaturedDishes } from "@/lib/api/menu";
import { getSettings } from "@/lib/api/settings";
import { summarizeHours } from "@/lib/format";
import { requireTableSession } from "./session";

export const dynamic = "force-dynamic";

export default async function TableHomePage({ params }: { params: Promise<{ token: string }> }) {
  const { token: qr } = await params;
  const session = await requireTableSession(qr);
  const [settings, featured] = await Promise.all([getSettings(), getFeaturedDishes().catch(() => [])]);
  const table = session.table.number;
  const photo = featured.find((dish) => dish.photo) ?? featured[0];
  const hasTableVoice = existsSync(join(process.cwd(), "public", "sons", "tables", `table-${table}.mp3`));

  return (
    <WelcomeExperience qr={qr} tableNumber={table} hasTableVoice={hasTableVoice}>
      <main className="relative mx-auto flex min-h-dvh max-w-[480px] flex-col overflow-hidden pb-[96px]">
        <TableHeader tableNumber={table} large />

        <div className="flex flex-col gap-3 px-6 pt-2.5">
          <Reveal index={0} className="self-start">
            <h1 className="relative font-display text-[52px] leading-none tracking-[-0.02em] text-bordeaux italic">
              Bienvenue&nbsp;!
              <svg
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute -bottom-2.5 left-0 h-3 w-[92%] overflow-visible"
              >
                <path d="M4 14 C90 4 200 3 296 9" fill="none" className="stroke-jaune" strokeWidth={7} strokeLinecap="round" />
              </svg>
            </h1>
          </Reveal>
          <Reveal index={1}>
            <p className="mt-1.5 text-[17px] leading-snug text-encre/85">Spécialités africaines et européennes, pâtisserie maison.</p>
          </Reveal>
          <Reveal index={2} className="self-start">
            <OpenBadge hours={settings.opening_hours} fallback={summarizeHours(settings.opening_hours)[0] ?? "Ouvert"} />
          </Reveal>
        </div>

        <Reveal index={3} className="relative mt-[18px] h-[250px] bg-rose">
          {photo && <DishImage dish={photo} sizes="(min-width: 480px) 480px, 100vw" priority initialClassName="text-6xl" />}
          <svg viewBox="0 0 390 60" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-px left-0 h-[46px] w-full">
            <path d="M0 40 C120 0 260 70 390 20 L390 60 L0 60 Z" className="fill-creme" />
          </svg>
          <span className="absolute top-3 right-3 rounded-full bg-encre/60 px-2.5 py-1 text-[11px] font-bold text-white">
            Photo d’illustration
          </span>
        </Reveal>

        <div className="flex flex-col gap-3 px-5 pt-1.5">
          <Reveal index={4}>
            <Link
              href={`/t/${encodeURIComponent(qr)}/carte`}
              className="flex h-16 items-center justify-between rounded-full bg-bordeaux px-6 text-creme shadow-bouton"
            >
              <span className="flex items-center gap-3.5">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3z" />
                  <path d="M9 8h6M9 12h6M9 16h4" />
                </svg>
                <span className="font-display text-2xl font-bold">Voir la carte</span>
              </span>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </Reveal>
          <Reveal index={5}>
            <TableOrdersLink qr={qr} session={session} />
          </Reveal>
          <Reveal index={6}>
            <ServiceButtons tableNumber={table} />
          </Reveal>
        </div>

        <svg
          viewBox="0 0 390 70"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none fixed bottom-0 left-1/2 h-[60px] w-full max-w-[480px] -translate-x-1/2"
        >
          <path d="M0 30 C110 70 250 0 390 40 L390 70 L0 70 Z" className="fill-bordeaux" />
          <path d="M0 30 C110 70 250 0 390 40" fill="none" className="stroke-jaune" strokeWidth={4} />
        </svg>
      </main>
    </WelcomeExperience>
  );
}
