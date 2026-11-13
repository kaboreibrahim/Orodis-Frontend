// Pastille « Hors ligne » en tête d'écran tant que le temps réel est coupé (docs/phase3.md, « Robustesse »),
// ou « Connexion difficile » quand l'API ne répond pas ou limite les requêtes (dernier état connu affiché).
import { WifiOff } from "lucide-react";

export function OfflinePill({ online, label = "Hors ligne · reconnexion…" }: { online: boolean; label?: string }) {
  if (online) return null;
  return (
    <div
      role="status"
      className="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full whitespace-nowrap bg-encre px-4 py-2 text-sm font-bold text-creme shadow-carte"
    >
      <WifiOff size={16} aria-hidden="true" />
      {label}
    </div>
  );
}
