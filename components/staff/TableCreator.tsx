"use client";

// Création d'une table ou d'un lot (maquette phase3/AdminTableNew) : numéro, places, zone, nombre de tables,
// avec l'aperçu du chevalet. L'envoi passe par /manage/tables/bulk/ : tout le lot est créé, ou rien.
import { Check, ChevronLeft, Minus, Plus, Printer } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { StaffTable, StaffZone } from "@/lib/api/staff";
import { Switch } from "./DishEditor";
import { EASE, Reveal, RevealTitle, stagger } from "./reveal";

const CARD = "rounded-[22px] border border-bordure bg-white p-5";
const LABEL = "text-sm font-bold";
const COUNTS = [1, 2, 4, 8];
const MAX_NUMBER = 999;

/** « 9 et 10 », « 13 à 16 ». */
const span = (from: number, to: number) => (to - from === 1 ? `${from} et ${to}` : `${from} à ${to}`);

async function post<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const response = await fetch(`/api/gestion/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => null);
    if (response.ok) return { ok: true, data: data as T };
    const first = data && typeof data === "object" ? Object.values(data).flat()[0] : null;
    return { ok: false, message: typeof first === "string" ? first : "La création a échoué. Réessayez." };
  } catch {
    return { ok: false, message: "Pas de connexion. Réessayez." };
  }
}

/** Compteur à deux boutons : grands chiffres, zones de 44 px, sans clavier. */
function Stepper({ label, value, onChange, min, max, accent }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} : moins`} className="flex size-11 items-center justify-center rounded-xl bg-sable disabled:opacity-40">
        <Minus size={18} aria-hidden="true" />
      </button>
      <span className="relative flex h-11 min-w-[76px] items-center justify-center overflow-hidden" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`font-display text-[40px] font-bold leading-none tabular-nums ${accent ? "text-bordeaux" : ""}`}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} : plus`} className="flex size-11 items-center justify-center rounded-xl bg-bordeaux text-white disabled:opacity-40">
        <Plus size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

type Props = { taken: number[]; initialZones: StaffZone[]; sampleQr: string; siteHost: string };

export function TableCreator({ taken: initialTaken, initialZones, sampleQr, siteHost }: Props) {
  const [taken, setTaken] = useState(() => new Set(initialTaken));
  const [zones, setZones] = useState(initialZones);
  const [first, setFirst] = useState(() => Math.min(MAX_NUMBER, Math.max(0, ...initialTaken) + 1));
  const [seats, setSeats] = useState(4);
  const [zoneId, setZoneId] = useState<number | null>(initialZones[0]?.id ?? null);
  const [count, setCount] = useState(1);
  const [active, setActive] = useState(true);
  const [zoneName, setZoneName] = useState<string | null>(null); // champ « nouvelle zone » ouvert quand non nul
  const [created, setCreated] = useState<StaffTable[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const last = first + count - 1;
  const clash = Array.from({ length: count }, (_, index) => first + index).filter((number) => taken.has(number));
  const zone = zones.find((z) => z.id === zoneId) ?? null;
  const blocked = clash.length > 0 || !zone || last > MAX_NUMBER;
  const change = <T,>(setter: (value: T) => void) => (value: T) => (setter(value), setCreated(null), setError(null));

  async function addZone() {
    const name = zoneName?.trim();
    if (!name) return;
    setPending(true);
    const result = await post<StaffZone>("zones", { name, position: zones.length });
    setPending(false);
    if (!result.ok) return setError(result.message);
    setZones((list) => [...list, result.data]);
    setZoneId(result.data.id);
    setZoneName(null);
    setError(null);
  }

  async function create() {
    if (blocked) return;
    setPending(true);
    setError(null);
    const result = await post<StaffTable[]>("tables/bulk", { first, count, zone: zoneId, seats, is_active: active });
    setPending(false);
    if (!result.ok) return setError(result.message);
    setCreated(result.data);
    setTaken((set) => new Set([...set, ...result.data.map((table) => table.number)]));
  }

  function again() {
    setFirst(Math.min(MAX_NUMBER, last + 1));
    setCount(1);
    setCreated(null);
  }

  const clashText =
    clash.length === 1 ? `La table ${clash[0]} existe déjà : choisissez un autre numéro.` : `Les tables ${clash.join(", ")} existent déjà : choisissez un autre numéro de départ.`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <Link href="/gestion/tables" className="flex min-h-11 items-center gap-1 text-sm font-bold text-bordeaux">
            <ChevronLeft size={16} aria-hidden="true" />
            Tables &amp; QR codes
          </Link>
          <RevealTitle text={count > 1 ? "Créer des tables" : "Créer une table"} className="text-[32px]" />
        </div>
      </div>

      <AnimatePresence>
        {created && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col gap-3 rounded-[22px] bg-pastille-ok p-4 text-texte-ok"
          >
            <div className="flex items-center gap-3 font-bold">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-servie text-white">
                <Check size={20} strokeWidth={3} aria-hidden="true" />
              </span>
              {created.length === 1 ? `Table ${created[0].number} créée` : `Tables ${span(created[0].number, created.at(-1)!.number)} créées`} en {created[0].zone_name}
              {created[0].is_active ? "." : ", pas encore actives."}
            </div>
            <div className="flex flex-wrap gap-2">
              {created.map((table) => (
                <a
                  key={table.id}
                  href={`/api/gestion/tables/qr-sheet.pdf?number=${table.number}`}
                  target="_blank"
                  rel="noopener"
                  className="flex h-11 items-center gap-2 rounded-full bg-servie px-4 text-sm font-bold text-white"
                >
                  <Printer size={16} aria-hidden="true" />
                  Chevalet table {table.number}
                </a>
              ))}
              <button type="button" onClick={again} className="h-11 rounded-full border-[1.5px] border-servie px-4 text-sm font-bold">
                Créer d’autres tables
              </button>
              <Link href="/gestion/tables" className="flex h-11 items-center rounded-full border-[1.5px] border-servie px-4 text-sm font-bold">
                Voir les tables
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={stagger} initial="hidden" animate="shown" className="flex flex-wrap items-start gap-[18px]">
        <Reveal as="section" className={`${CARD} flex min-w-0 flex-[999_1_440px] flex-col gap-6 sm:p-6`}>
          <div className="flex flex-wrap gap-x-10 gap-y-5">
            <div className="flex flex-col gap-2">
              <span className={LABEL}>{count > 1 ? "Numéro de la première table" : "Numéro de la table"}</span>
              <Stepper label="Numéro de la table" value={first} onChange={change(setFirst)} min={1} max={MAX_NUMBER} accent />
              <span className={`max-w-[260px] text-[13px] ${clash.length && !created ? "font-bold text-retard" : "text-ticket-doux"}`} role={clash.length && !created ? "alert" : undefined}>
                {created ? "Création enregistrée." : clash.length ? clashText : "Numéro libre."}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className={LABEL}>Nombre de places</span>
              <Stepper label="Nombre de places" value={seats} onChange={change(setSeats)} min={1} max={30} />
              <span className="max-w-[260px] text-[13px] text-ticket-doux">Sert aux réservations : jusqu’à {seats} {seats > 1 ? "personnes" : "personne"} par table.</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL}>Zone</span>
            <div role="group" aria-label="Zone" className="flex flex-wrap gap-2">
              {zones.map((z) => {
                const on = z.id === zoneId;
                return (
                  <button key={z.id} type="button" aria-pressed={on} onClick={() => change(setZoneId)(z.id)} className={`relative h-11 rounded-full px-4 text-sm font-bold transition-colors ${on ? "text-white" : "bg-sable text-encre"}`}>
                    {on && <motion.span layoutId="zone-active" className="absolute inset-0 rounded-full bg-encre" transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" />}
                    <span className="relative">{z.name}</span>
                  </button>
                );
              })}
              {zoneName === null ? (
                <button type="button" onClick={() => setZoneName("")} className="flex h-11 items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-etape-inactive px-4 text-sm font-bold text-ticket-doux">
                  <Plus size={15} aria-hidden="true" />
                  Nouvelle zone
                </button>
              ) : (
                <span className="flex flex-wrap items-center gap-2">
                  <input
                    autoFocus
                    value={zoneName}
                    maxLength={50}
                    placeholder="Salon privé"
                    aria-label="Nom de la nouvelle zone"
                    onChange={(event) => setZoneName(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addZone())}
                    className="h-11 w-[170px] rounded-full border border-bordure bg-white px-4 text-sm"
                  />
                  <button type="button" onClick={addZone} disabled={pending || !zoneName.trim()} className="h-11 rounded-full bg-encre px-4 text-sm font-bold text-white disabled:opacity-50">
                    Ajouter
                  </button>
                  <button type="button" onClick={() => setZoneName(null)} className="h-11 px-2 text-sm font-bold text-ticket-doux">
                    Annuler
                  </button>
                </span>
              )}
            </div>
            {zones.length === 0 && zoneName === null && <span className="text-[13px] font-bold text-retard">Créez d’abord une zone, par exemple « Salle ».</span>}
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL}>Combien de tables créer ?</span>
            <div role="group" aria-label="Nombre de tables" className="flex flex-wrap gap-2">
              {COUNTS.map((value) => {
                const on = value === count;
                return (
                  <button key={value} type="button" aria-pressed={on} onClick={() => change(setCount)(value)} className={`relative h-11 rounded-full px-4 text-sm font-bold transition-colors ${on ? "text-white" : "bg-sable text-encre"}`}>
                    {on && <motion.span layoutId="nombre-actif" className="absolute inset-0 rounded-full bg-encre" transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden="true" />}
                    <span className="relative">{value === 1 ? "Une seule" : `${value} tables`}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[13px] text-ticket-doux">
              {count === 1
                ? `Une table, numéro ${first}.`
                : `${count} tables de ${seats} places${zone ? ` en ${zone.name}` : ""}, numérotées ${last - first === 1 ? `${first} et ${last}` : `de ${first} à ${last}`}, chacune avec son QR code.`}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-creme p-3.5 text-sm">
            <span>
              <span className="font-bold">{count > 1 ? "Tables actives dès leur création" : "Table active dès sa création"}</span>
              <span className="block text-[13px] text-ticket-doux">Décochez pour préparer le chevalet sans que le QR accepte encore de commandes.</span>
            </span>
            <Switch checked={active} onChange={change(setActive)} label="Active dès la création" />
          </div>

          {error && (
            <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={create} disabled={blocked || pending || created !== null} className="h-[52px] rounded-full bg-bordeaux px-7 font-bold text-white shadow-bouton disabled:bg-etape-inactive disabled:shadow-none">
              {pending ? "Création…" : count === 1 ? `Créer la table ${first}` : `Créer les tables ${span(first, last)}`}
            </button>
            <Link href="/gestion/tables" className="flex h-[52px] items-center rounded-full border-[1.5px] border-bordure px-6 font-bold text-ticket-doux">
              Annuler
            </Link>
          </div>
        </Reveal>

        {/* Aperçu du chevalet */}
        <Reveal as="aside" className={`${CARD} flex min-w-[270px] max-w-full flex-[1_1_300px] flex-col gap-4 xl:max-w-[380px]`}>
          <div>
            <h2 className="text-xl">Aperçu du chevalet</h2>
            <p className="text-[13px] text-ticket-doux">{created ? "Le vrai QR code de la table." : "QR d’exemple : le vrai est créé avec la table."}</p>
          </div>
          <div className="w-[240px] max-w-full self-center overflow-hidden rounded-2xl border border-bordure bg-creme shadow-carte">
            <div className="flex justify-center border-b-[3px] border-jaune bg-bordeaux px-4 pb-4 pt-3.5">
              <Image src="/logo-delices-orodis-blanc-web.png" alt="" width={800} height={709} className="h-14 w-auto" />
            </div>
            <div className="flex flex-col items-center gap-2.5 px-4 pb-4 pt-3.5 text-center">
              <div className="font-display text-[17px] font-bold">
                Scannez <span className="italic text-bordeaux">pour commander</span>
              </div>
              <div className={`rounded-xl border-2 border-bordeaux bg-white p-2.5 transition-opacity ${active ? "" : "opacity-30"}`}>
                {created ? (
                  // eslint-disable-next-line @next/next/no-img-element -- PNG servi par le relais authentifié, pas par next/image
                  <img src={`/api/gestion/tables/${created[0].id}/qr.png`} alt={`QR code de la table ${created[0].number}`} width={150} height={150} className="size-[150px]" />
                ) : (
                  <div aria-hidden="true" className="size-[150px] [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: sampleQr }} />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ticket-doux">Table</span>
                <span className="font-display text-[40px] font-bold leading-[0.9] text-bordeaux tabular-nums">{created ? created[0].number : first}</span>
              </div>
            </div>
          </div>
          <p className="break-all text-center text-[13px] text-ticket-doux">{siteHost}/t/…</p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px] text-texte-doux">
            <li>
              {zone ? zone.name : "Zone à choisir"} · {seats} {seats > 1 ? "places" : "place"}
            </li>
            <li>Chevalet A5 à imprimer et à poser sur la table</li>
            <li>QR code régénérable depuis « Tables &amp; QR codes »</li>
          </ul>
        </Reveal>
      </motion.div>
    </MotionConfig>
  );
}
