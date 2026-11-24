"use client";

// Déconnexion : ce téléphone cesse d'abord de recevoir les alertes du compte, puis la session se ferme.
// L'autorisation du navigateur est gardée : à la prochaine connexion, les alertes reprennent pour le nouveau compte.
import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logout } from "@/app/actions/staff";
import { disablePush } from "@/lib/push-client";

export function LogoutButton({ className, size = 18 }: { className: string; size?: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label="Se déconnecter"
      title="Se déconnecter"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await disablePush("/api/gestion/push/remove", { forget: false }).catch(() => undefined);
          await logout();
        })
      }
      className={className}
    >
      <LogOut size={size} aria-hidden="true" />
    </button>
  );
}
