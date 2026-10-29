"use client";

// Choix du nombre de personnes : une pastille par taille de groupe, puis « 13 + » au-delà du maximum
// (le ReservationWizard renvoie alors vers le devis traiteur).
import { Chip } from "@/components/ui/Chip";

type PartySizeProps = {
  value: number;
  onChange: (size: number) => void;
  maxParty: number;
};

export function PartySize({ value, onChange, maxParty }: PartySizeProps) {
  const sizes = Array.from({ length: maxParty }, (_, i) => i + 1);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-bold">Nombre de personnes</legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Chip key={size} tone="encre" name="party_size" value={size} checked={value === size} onChange={() => onChange(size)} className="min-w-11">
            {size}
          </Chip>
        ))}
        <Chip
          tone="encre"
          name="party_size"
          value={maxParty + 1}
          checked={value > maxParty}
          onChange={() => onChange(maxParty + 1)}
          aria-label={`Plus de ${maxParty} personnes`}
        >
          {maxParty + 1}&nbsp;+
        </Chip>
      </div>
    </fieldset>
  );
}
