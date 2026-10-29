// Bloc réservation de l'accueil : nombre de personnes et date, puis suite sur /reserver
// (formulaire GET : fonctionne sans JavaScript, la page de réservation reçoit ?party=&date=).
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { todayIso } from "@/lib/format";
import { BOOKING_WINDOW_DAYS } from "@/lib/schemas";

const PARTY_SIZES = [1, 2, 3, 4, 6, 8];

export function ReserveCta({ maxParty = 12 }: { maxParty?: number }) {
  return (
    <section id="reserver" className="mx-auto max-w-[1200px] px-6 pt-24">
      <FadeUp className="flex flex-wrap items-center gap-10 rounded-[36px] bg-sable p-[clamp(28px,4vw,56px)]">
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-4">
          <span className="text-[13px] font-bold tracking-[0.14em] text-bordeaux uppercase">Réservation</span>
          <h2 className="text-[clamp(34px,4vw,54px)] leading-[1.02]">
            Votre table <span className="text-bordeaux italic">vous attend.</span>
          </h2>
          <p className="text-[17px] text-texte-doux">
            Un dîner en famille, un déjeuner d’affaires, un anniversaire ? Réservez en une minute, le restaurant vous
            confirme par WhatsApp.
          </p>
        </div>

        <form
          action="/reserver"
          method="get"
          className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 rounded-[26px] bg-white p-7 shadow-carte"
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">Nombre de personnes</legend>
            <div className="flex flex-wrap gap-2">
              {PARTY_SIZES.filter((n) => n <= maxParty).map((n) => (
                <label key={n} className="cursor-pointer">
                  <input type="radio" name="party" value={n} defaultChecked={n === 2} className="peer sr-only" />
                  <span className="flex h-11 min-w-12 items-center justify-center rounded-full border-[1.5px] border-bordure bg-white px-3 font-bold transition-colors peer-checked:border-encre peer-checked:bg-encre peer-checked:text-creme peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bordeaux">
                    {n}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Date
            <input
              type="date"
              name="date"
              required
              defaultValue={todayIso()}
              min={todayIso()}
              max={todayIso(BOOKING_WINDOW_DAYS)}
              className="h-12 rounded-xl border-[1.5px] border-bordure bg-white px-3 font-normal text-encre"
            />
          </label>

          <button
            type="submit"
            className="h-14 rounded-full bg-bordeaux text-[17px] font-bold text-creme transition-opacity hover:opacity-90"
          >
            Choisir un créneau
          </button>
          <p className="text-center text-sm text-texte-doux">
            Plus de {maxParty} personnes ?{" "}
            <Link href="/traiteur#devis" className="font-bold text-bordeaux underline underline-offset-4">
              Demandez un devis traiteur
            </Link>
          </p>
        </form>
      </FadeUp>
    </section>
  );
}
