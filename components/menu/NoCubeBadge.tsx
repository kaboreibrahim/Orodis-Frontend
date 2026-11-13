// Pastille « sans cube Maggi », en tête de la carte (site et app de table).
import { Leaf } from "lucide-react";

export function NoCubeBadge({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full bg-rose px-3.5 py-[7px] text-sm font-bold text-bordeaux ${className}`}
    >
      <Leaf size={16} aria-hidden="true" />
      Tous nos plats sont cuisinés sans cube Maggi
    </p>
  );
}
