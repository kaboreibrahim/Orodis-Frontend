"use client";

// Compteur − / + avec saisie directe au clavier (48 px de haut, boutons de 40 px).
import { Minus, Plus } from "lucide-react";

type StepperProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** « invités », « personnes » : complète les libellés des boutons. */
  unit: string;
  invalid?: boolean;
  describedBy?: string;
};

export function Stepper({ id, value, onChange, min = 1, max = 9999, step = 1, unit, invalid, describedBy }: StepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const current = Number.isFinite(value) ? value : min;

  return (
    <span
      className={`flex h-12 items-center gap-1.5 rounded-xl border-[1.5px] bg-white px-1 ${invalid ? "border-bordeaux" : "border-bordure"}`}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(current - step))}
        disabled={current <= min}
        aria-label={`Moins de ${unit}`}
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-sable transition-opacity disabled:opacity-40"
      >
        <Minus size={18} strokeWidth={2.6} aria-hidden="true" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        onBlur={() => onChange(clamp(Math.round(current)))}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="h-full w-full min-w-0 [appearance:textfield] bg-transparent text-center text-[17px] font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(current + step))}
        disabled={current >= max}
        aria-label={`Plus de ${unit}`}
        className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-bordeaux text-creme transition-opacity disabled:opacity-40"
      >
        <Plus size={18} strokeWidth={2.6} aria-hidden="true" />
      </button>
    </span>
  );
}
