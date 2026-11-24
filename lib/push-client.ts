// Notifications push côté navigateur (composants client uniquement).
// Le navigateur ne parle jamais à Django : les abonnements passent par les routes Next.js
// /api/gestion/push (personnel, cookie JWT) ou /t/<qr>/notifications (table, cookie de session).

export type PushState = "indisponible" | "refusee" | "inactive" | "active";

/** Choix « Désactiver » mémorisé : on ne réabonne pas ce navigateur tout seul à la connexion suivante. */
const OPT_OUT_KEY = "orodis-notifications-coupees";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registration(): Promise<ServiceWorkerRegistration> {
  return (await navigator.serviceWorker.getRegistration("/")) ?? navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/");
  return reg ? reg.pushManager.getSubscription() : null;
}

export async function readState(): Promise<PushState> {
  if (!pushSupported()) return "indisponible";
  if (Notification.permission === "denied") return "refusee";
  return Notification.permission === "granted" && (await currentSubscription()) ? "active" : "inactive";
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** Le service push du téléphone (Google, Apple, Mozilla) peut ne jamais répondre sur un réseau filtré. */
const SUBSCRIBE_TIMEOUT = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("délai dépassé")), ms);
    promise.then(
      (value) => (clearTimeout(timer), resolve(value)),
      (error) => (clearTimeout(timer), reject(error)),
    );
  });
}

type Config = { public_key: string; enabled: boolean };

async function readConfig(endpoint: string): Promise<Config | null> {
  const response = await fetch(endpoint, { cache: "no-store" });
  return response.ok ? ((await response.json()) as Config) : null;
}

/** Abonne ce navigateur et l'enregistre côté restaurant. ask=false : sans afficher la demande d'autorisation. */
export async function enablePush(endpoint: string, { ask = true } = {}): Promise<PushState> {
  if (!pushSupported()) return "indisponible";
  const permission = ask ? await Notification.requestPermission() : Notification.permission;
  if (permission === "denied") return "refusee";
  if (permission !== "granted") return "inactive";

  const config = await readConfig(endpoint);
  if (!config?.enabled) throw new Error("Les notifications ne sont pas encore configurées sur le serveur.");
  const reg = await registration();
  await navigator.serviceWorker.ready;
  let subscription = await reg.pushManager.getSubscription();
  // Clé du serveur changée : l'ancien abonnement ne recevrait plus rien.
  const serverKey = keyBytes(config.public_key);
  const currentKey = subscription?.options.applicationServerKey;
  if (subscription && currentKey && !sameKey(new Uint8Array(currentKey), serverKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  try {
    subscription ??= await withTimeout(
      reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: serverKey }),
      SUBSCRIBE_TIMEOUT,
    );
  } catch {
    // Navigation privée, service push du téléphone injoignable… Le message du navigateur est en anglais.
    throw new Error("Ce navigateur n’a pas pu s’abonner (navigation privée ou réseau). Réessayez dans le navigateur habituel.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error("Le restaurant n’a pas pu enregistrer ce téléphone. Réessayez.");
  localStorage.removeItem(OPT_OUT_KEY);
  return "active";
}

function sameKey(a: Uint8Array, b: Uint8Array) {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

/** Retire ce navigateur côté restaurant. forget=true : coupe aussi l'abonnement du navigateur (bouton « Désactiver »). */
export async function disablePush(removeEndpoint: string, { forget = true } = {}): Promise<void> {
  const subscription = await currentSubscription();
  if (subscription) {
    await fetch(removeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
      keepalive: true,
    }).catch(() => undefined);
    if (forget) await subscription.unsubscribe();
  }
  if (forget) localStorage.setItem(OPT_OUT_KEY, "1");
}

/** À l'ouverture de l'espace : si ce navigateur a déjà accepté, on réenregistre l'abonnement au nom
 *  de la personne connectée (tablette partagée, reconnexion après une déconnexion). */
export async function resyncPush(endpoint: string): Promise<PushState> {
  if (!pushSupported() || Notification.permission !== "granted" || localStorage.getItem(OPT_OUT_KEY)) return readState();
  try {
    return await enablePush(endpoint, { ask: false });
  } catch {
    return readState();
  }
}

/** iPhone et iPad : les notifications web n'existent que dans l'application installée sur l'écran d'accueil. */
export function isIos(): boolean {
  return typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}
