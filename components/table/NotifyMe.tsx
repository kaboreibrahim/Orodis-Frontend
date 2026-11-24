"use client";

// Suivi de commande : « Me prévenir quand c'est prêt ». Le téléphone reçoit une notification quand la cuisine
// commence, quand la commande est prête et quand l'addition est réglée, même écran éteint ou application fermée.
// Caché là où le navigateur ne sait pas le faire (iPhone hors application installée, ancien navigateur).
import { BellRing, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { disablePush, enablePush, type PushState, readState } from "@/lib/push-client";

export function NotifyMe({ qr }: { qr: string }) {
  const endpoint = `/t/${encodeURIComponent(qr)}/notifications`;
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readState().then(async (current) => {
      // Déjà accepté lors d'une commande précédente : ce téléphone suit aussi ce repas, sans redemander.
      if (current === "active") current = await enablePush(endpoint, { ask: false }).catch(() => current);
      setState(current);
    });
  }, [endpoint]);

  if (state === null || state === "indisponible") return null;

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      if (state === "active") {
        await disablePush(`${endpoint}/retrait`);
        setState("inactive");
      } else {
        setState(await enablePush(endpoint));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d’activer les notifications.");
    } finally {
      setBusy(false);
    }
  }

  const active = state === "active";
  return (
    <div className="flex flex-col gap-2 rounded-[22px] bg-white p-4 shadow-pilule">
      <div className="flex items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${active ? "bg-whatsapp text-white" : "bg-rose text-bordeaux"}`}
          aria-hidden="true"
        >
          {active ? <Check size={20} strokeWidth={3} /> : <BellRing size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-encre">{active ? "Vous serez prévenu" : "Me prévenir quand c’est prêt"}</p>
          <p className="text-sm text-texte-doux">
            {state === "refusee"
              ? "Les notifications sont bloquées pour ce site dans les réglages du téléphone."
              : active
                ? "Une notification arrive même si vous fermez cette page."
                : "Rangez votre téléphone, on vous fait signe."}
          </p>
        </div>
      </div>
      {state !== "refusee" && (
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          className={`min-h-11 rounded-full px-5 text-sm font-bold disabled:opacity-60 ${
            active ? "border-[1.5px] border-bordure text-texte-doux" : "bg-bordeaux text-white"
          }`}
        >
          {busy ? "Un instant…" : active ? "Ne plus me prévenir" : "Activer les notifications"}
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-bordeaux">
          {error}
        </p>
      )}
    </div>
  );
}
