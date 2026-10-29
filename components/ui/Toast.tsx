// Message de retour après un envoi (limite atteinte, API injoignable), annoncé aux lecteurs d'écran,
// avec une action facultative (le bouton WhatsApp en solution de secours).
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export function Toast({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-bordeaux/30 bg-rose p-4 text-sm text-encre">
      <p className="flex gap-2.5 font-medium">
        <AlertCircle size={20} className="shrink-0 text-bordeaux" aria-hidden="true" />
        {children}
      </p>
      {action}
    </div>
  );
}
