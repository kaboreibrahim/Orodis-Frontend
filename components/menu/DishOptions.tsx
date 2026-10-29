// Options d'un plat (accompagnement, piment…) avec les suppléments, pour la fiche et la page du plat.
import type { OptionGroup } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";

function rule({ min_choices: min = 0, max_choices: max = 1 }: OptionGroup): string {
  if (min === 0) return max > 1 ? `facultatif, jusqu’à ${max}` : "facultatif";
  if (min === max) return min === 1 ? "au choix" : `${min} au choix`;
  return `${min} à ${max} au choix`;
}

export function DishOptions({ groups }: { groups: OptionGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <span className="text-sm font-bold">
            {group.name} <span className="font-normal text-texte-doux">({rule(group)})</span>
          </span>
          <ul className="flex flex-wrap gap-2">
            {group.options.map((option) => (
              <li
                key={option.id}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-bold ${
                  option.is_default ? "border-bordeaux bg-rose text-bordeaux" : "border-bordure bg-white text-encre"
                }`}
              >
                {option.name}
                {option.price_delta ? <span className="font-medium text-texte-doux"> +{formatPrice(option.price_delta)}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
