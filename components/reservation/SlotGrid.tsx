"use client";

// Grille des créneaux : les complets sont grisés, en pointillés et non sélectionnables.
import type { Slot } from "@/lib/api/types";

type SlotGridProps = {
  slots: Slot[];
  value: string;
  onChange: (time: string) => void;
  describedBy?: string;
};

export function SlotGrid({ slots, value, onChange, describedBy }: SlotGridProps) {
  return (
    <fieldset aria-describedby={describedBy} className="min-w-0">
      <legend className="sr-only">Heure</legend>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {slots.map((slot) => (
          <label key={slot.time} className="cursor-pointer has-disabled:cursor-not-allowed">
            <input
              type="radio"
              name="time"
              value={slot.time}
              checked={value === slot.time}
              onChange={() => onChange(slot.time)}
              disabled={!slot.available}
              aria-label={slot.available ? slot.time : `${slot.time}, complet`}
              className="peer sr-only"
            />
            <span className="flex h-12 flex-col items-center justify-center rounded-xl border-[1.5px] border-bordure bg-white text-sm font-bold transition-colors peer-checked:border-bordeaux peer-checked:bg-bordeaux peer-checked:text-creme peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bordeaux peer-disabled:border-dashed peer-disabled:bg-sable peer-disabled:text-texte-doux">
              {slot.time}
              {!slot.available && <span className="text-[10px] font-medium">complet</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
