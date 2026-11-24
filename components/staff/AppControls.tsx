"use client";

// Installer l'espace du personnel (PWA) et activer ses notifications push.
// Chaque rôle reçoit ses alertes (cuisine : nouvelles commandes ; serveurs : plats prêts et appels ;
// caisse et gérant : additions, réservations, devis). Variante « barre » (barre latérale) et « cuisine » (en-tête).
import { Bell, BellOff, BellRing, Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import {
  disablePush,
  enablePush,
  isIos,
  isStandalone,
  type PushState,
  readState,
  resyncPush,
} from "@/lib/push-client";

const PUSH = "/api/gestion/push";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const LABELS: Record<PushState, string> = {
  indisponible: "Notifications indisponibles",
  refusee: "Notifications bloquées",
  inactive: "Activer les notifications",
  active: "Notifications activées",
};

export function AppControls({ variant = "barre" }: { variant?: "barre" | "cuisine" }) {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [canHintIos, setCanHintIos] = useState(false);

  useEffect(() => {
    let alive = true;
    resyncPush(PUSH).then((s) => alive && setState(s));
    setCanHintIos(isIos() && !isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault(); // on garde la proposition pour notre bouton
      setInstallPrompt(event as InstallPrompt);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      alive = false;
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function toggle() {
    setBusy(true);
    setMessage(null);
    try {
      if (state === "active") {
        await disablePush(`${PUSH}/remove`);
        setState(await readState());
      } else {
        const next = await enablePush(PUSH);
        setState(next);
        if (next === "refusee") setMessage("Autorisez les notifications dans les réglages du navigateur pour ce site.");
        if (next === "active") await fetch(`${PUSH}/test`, { method: "POST" });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d’activer les notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice.catch(() => undefined);
    setInstallPrompt(null);
  }

  const kitchen = variant === "cuisine";
  const button = kitchen
    ? "flex h-11 items-center gap-2 rounded-full border-[1.5px] border-bordure-encre px-4 text-sm font-bold hover:bg-white/5 disabled:opacity-60"
    : "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-texte-nav hover:bg-white/5 disabled:opacity-60";
  const icon = 18;
  const showPush = state !== null && (state !== "indisponible" || canHintIos);
  const PushIcon = state === "active" ? BellRing : state === "refusee" ? BellOff : Bell;

  return (
    <div className={kitchen ? "flex items-center gap-2" : "flex flex-col gap-1"}>
      {installPrompt && (
        <button type="button" onClick={install} className={button}>
          <Download size={icon} aria-hidden="true" />
          {kitchen ? "Installer" : "Installer l’application"}
        </button>
      )}
      {canHintIos && (
        <button type="button" onClick={() => setIosHint((v) => !v)} aria-expanded={iosHint} className={button}>
          <Share size={icon} aria-hidden="true" />
          {kitchen ? "Installer" : "Installer sur l’iPhone"}
        </button>
      )}
      {showPush && state !== "indisponible" && (
        <button
          type="button"
          onClick={toggle}
          disabled={busy || state === "refusee"}
          aria-pressed={state === "active"}
          aria-label={kitchen ? LABELS[state] : undefined}
          title={state === "active" ? "Désactiver les notifications sur cet appareil" : LABELS[state]}
          className={button}
        >
          <PushIcon size={icon} aria-hidden="true" className={state === "active" ? "text-jaune" : undefined} />
          {busy ? "Un instant…" : kitchen ? (state === "active" ? "Alertes activées" : "Alertes") : LABELS[state]}
        </button>
      )}
      {(iosHint || message) && (
        <p
          role="status"
          className={`text-xs leading-snug text-texte-sur-encre ${kitchen ? "max-w-[220px]" : "px-3 pb-1"}`}
        >
          {message ??
            "Dans Safari, touchez Partager puis « Sur l’écran d’accueil ». Ouvrez ensuite l’application depuis l’icône pour activer les notifications."}
        </p>
      )}
    </div>
  );
}
