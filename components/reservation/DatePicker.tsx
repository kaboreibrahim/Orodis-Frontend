"use client";

// Choix de la date, d'aujourd'hui à J+60 : une rangée de jours qui défile (boutons radio natifs, flèches du clavier).
// Les jours fermés selon les horaires de la semaine sont grisés ; une fermeture exceptionnelle est signalée à l'étape des créneaux.
import { useEffect, useMemo, useRef } from "react";
import { DAY_KEYS, type OpeningHours } from "@/lib/api/types";
import { todayIso } from "@/lib/format";
import { BOOKING_WINDOW_DAYS } from "@/lib/schemas";

type DatePickerProps = {
  /** Date du jour, connue seulement dans le navigateur (la page est statique). */
  today: string;
  value: string;
  onChange: (date: string) => void;
  hours?: OpeningHours;
  describedBy?: string;
};

const part = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", ...options }).format(date);

export function DatePicker({ today, value, onChange, hours, describedBy }: DatePickerProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const days = useMemo(() => {
    const start = Date.parse(`${today}T12:00:00Z`);
    return Array.from({ length: BOOKING_WINDOW_DAYS + 1 }, (_, i) => {
      const date = new Date(start + i * 864e5);
      const iso = todayIso(0, date.getTime());
      const dayKey = DAY_KEYS[(date.getUTCDay() + 6) % 7];
      return {
        iso,
        weekday: i === 0 ? "auj." : i === 1 ? "dem." : part(date, { weekday: "short" }),
        day: date.getUTCDate(),
        month: part(date, { month: "short" }),
        label: part(date, { weekday: "long", day: "numeric", month: "long" }),
        closed: hours ? !hours[dayKey]?.length : false,
      };
    });
  }, [today, hours]);

  // Le premier jour choisi (venu de l'accueil, par exemple) est ramené une fois dans la rangée visible.
  const centered = useRef(false);
  useEffect(() => {
    const row = scroller.current;
    const checked = row?.querySelector<HTMLElement>("input:checked")?.parentElement;
    if (centered.current || !row || !checked) return;
    row.scrollLeft = checked.offsetLeft - row.clientWidth / 2 + checked.clientWidth / 2;
    centered.current = true;
  }, [value]);

  return (
    // min-w-0 : un fieldset ne rétrécit pas sous son contenu par défaut, la rangée ferait déborder la page.
    <fieldset aria-describedby={describedBy} className="min-w-0">
      <legend className="mb-2 text-sm font-bold">Date</legend>
      <div ref={scroller} className="relative -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pt-1 pb-2 sm:-mx-7 sm:px-7">
        {days.map((day) => (
          <label key={day.iso} className="shrink-0 snap-start cursor-pointer has-disabled:cursor-not-allowed">
            <input
              type="radio"
              name="date"
              value={day.iso}
              checked={value === day.iso}
              onChange={() => onChange(day.iso)}
              disabled={day.closed}
              aria-label={`${day.label}${day.closed ? ", fermé" : ""}`}
              className="peer sr-only"
            />
            <span className="flex h-[76px] w-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl border-[1.5px] border-bordure bg-white transition-colors peer-checked:border-bordeaux peer-checked:bg-bordeaux peer-checked:text-creme peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bordeaux peer-disabled:border-dashed peer-disabled:bg-sable peer-disabled:text-texte-doux">
              <span className="text-xs font-medium">{day.weekday}</span>
              <span className="font-display text-[22px] leading-none font-bold">{day.day}</span>
              <span className="text-[11px]">{day.closed ? "fermé" : day.month}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
