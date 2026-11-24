"use client";

// Personnel (gérant) : les comptes par rôle, la fiche d'un compte (identité, rôle, accès, mot de passe provisoire)
// et la création d'un compte. Le mot de passe provisoire n'est montré qu'une fois, juste après sa création.
import { Check, ChefHat, Copy, KeyRound, Plus, Search, ShieldCheck, Wallet, X, type LucideIcon, ConciergeBell } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { StaffCredentials, StaffMember, StaffRole } from "@/lib/api/staff";
import { Switch } from "./DishEditor";
import { pill } from "./labels";
import { CountUp, EASE, Reveal, RevealTitle, stagger } from "./reveal";

type RoleInfo = { label: string; icon: LucideIcon; dot: string; avatar: string; pill: string; summary: string; access: string[] };

/** Ce que chaque rôle voit dans l'espace du personnel (barre latérale et API). */
const ROLES: Record<StaffRole, RoleInfo> = {
  manager: {
    label: "Gérant",
    icon: ShieldCheck,
    dot: "bg-bordeaux",
    avatar: "bg-bordeaux text-white",
    pill: "bg-rose text-bordeaux",
    summary: "Accès complet au restaurant.",
    access: ["Vue d’ensemble et paiements", "Carte, tables et QR codes", "Commandes, encaissement, cuisine", "Comptes du personnel"],
  },
  cashier: {
    label: "Caisse",
    icon: Wallet,
    dot: "bg-a-encaisser",
    avatar: "bg-pastille-encaisser text-note-texte",
    pill: "bg-pastille-encaisser text-note-texte",
    summary: "Encaisse et suit les commandes.",
    access: ["Commandes et encaissement", "Paiements du jour et reçus", "Écran cuisine"],
  },
  waiter: {
    label: "Serveur",
    icon: ConciergeBell,
    dot: "bg-en-preparation",
    avatar: "bg-pastille-preparation text-texte-preparation",
    pill: "bg-pastille-preparation text-texte-preparation",
    summary: "Sert les tables et répond aux appels.",
    access: ["Commandes et appels des tables", "Marque les commandes servies", "Écran cuisine"],
  },
  kitchen: {
    label: "Cuisine",
    icon: ChefHat,
    dot: "bg-whatsapp",
    avatar: "bg-pastille-ok text-texte-ok",
    pill: "bg-pastille-ok text-texte-ok",
    summary: "Prépare les commandes.",
    access: ["Écran cuisine uniquement"],
  },
};
const ROLE_ORDER: StaffRole[] = ["manager", "cashier", "waiter", "kitchen"];
const CARD = "rounded-[22px] border border-bordure bg-white p-5";
const FIELD = "h-12 w-full min-w-0 rounded-xl border-[1.5px] border-bordure bg-white px-3.5 text-[15px] font-normal aria-invalid:border-bordeaux";
const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

const roleOf = (member: Pick<StaffMember, "role">): RoleInfo => ROLES[(member.role ?? "waiter") as StaffRole];
const initials = (member: StaffMember) =>
  ([member.first_name, member.last_name].filter(Boolean).map((part) => part!.trim().charAt(0)).join("") || member.username.charAt(0)).toUpperCase();

/** « awa.kone » à partir de « Awa » et « Koné » : sans accent, en minuscules. */
function suggestUsername(first: string, last: string): string {
  return [first, last]
    .map((part) => part.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join(".")
    .slice(0, 30);
}

/** « jamais », « il y a 5 min », « hier à 21:40 », « le 12 novembre ». */
function lastSeen(iso: string | null, now: number | null): string {
  if (!iso) return "Jamais connecté";
  if (now === null) return "";
  const date = new Date(iso);
  const minutes = Math.floor((now - date.getTime()) / 60_000);
  if (minutes < 1) return "Connecté à l’instant";
  if (minutes < 60) return `Connecté il y a ${minutes} min`;
  if (minutes < 24 * 60) return `Connecté il y a ${Math.floor(minutes / 60)} h`;
  const time = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan" }).format(date);
  if (minutes < 48 * 60) return `Connecté hier à ${time}`;
  return `Connecté le ${new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "Africa/Abidjan" }).format(date)}`;
}

type Result<T> = { ok: true; data: T } | { ok: false; message: string; fields: Record<string, string> };

async function call<T>(method: "POST" | "PATCH", path: string, body?: unknown): Promise<Result<T>> {
  try {
    const response = await fetch(`/api/gestion/staff${path}`, {
      method,
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 401) {
      window.location.assign("/gestion/connexion?suite=/gestion/personnel");
      return { ok: false, message: "Session expirée.", fields: {} };
    }
    const data = await response.json().catch(() => null);
    if (response.ok) return { ok: true, data: data as T };
    const fields: Record<string, string> = {};
    let message = "L’enregistrement a échoué. Réessayez.";
    if (data && typeof data === "object") {
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const text = Array.isArray(value) ? value.map(String).join(" ") : String(value);
        if (key === "detail" || key === "non_field_errors") message = text;
        else fields[key] = text;
      }
      if (Object.keys(fields).length && !("detail" in data) && !("non_field_errors" in data)) message = Object.values(fields)[0];
    }
    return { ok: false, message, fields };
  } catch {
    return { ok: false, message: "Pas de connexion. Réessayez.", fields: {} };
  }
}

type Props = { initial: StaffMember[]; meId: number };

export function StaffBoard({ initial, meId }: Props) {
  const [members, setMembers] = useState(initial);
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [showInactive, setShowInactive] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | "new" | null>(null);
  const [credentials, setCredentials] = useState<StaffCredentials | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const sheet = useRef<HTMLElement>(null);

  useEffect(() => setNow(Date.now()), []);

  // Sur téléphone, la fiche s'affiche sous la liste : on l'amène à l'écran.
  useEffect(() => {
    if (open === null) return;
    const timer = window.setTimeout(() => {
      const box = sheet.current?.getBoundingClientRect();
      if (box && (box.top > window.innerHeight - 120 || box.bottom < 0)) sheet.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [open]);

  function flash(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 3500);
  }

  const active = members.filter((m) => m.is_active);
  const counts = useMemo(() => {
    const result = { manager: 0, cashier: 0, waiter: 0, kitchen: 0 } as Record<StaffRole, number>;
    for (const member of active) result[(member.role ?? "waiter") as StaffRole] += 1;
    return result;
  }, [active]);
  const inactiveCount = members.length - active.length;

  const shown = members.filter((m) => {
    if (m.is_active === showInactive) return false;
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    const q = query.trim().toLowerCase();
    return !q || m.name.toLowerCase().includes(q) || m.username.includes(q) || (m.phone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, ""));
  });
  const selected = typeof open === "number" ? (members.find((m) => m.id === open) ?? null) : null;

  const upsert = (member: StaffMember) =>
    setMembers((list) => (list.some((m) => m.id === member.id) ? list.map((m) => (m.id === member.id ? member : m)) : [...list, member]));

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <RevealTitle text="Personnel" className="text-[32px]" />
          <p className="text-sm text-ticket-doux">
            {active.length} {active.length > 1 ? "comptes actifs" : "compte actif"}
            {inactiveCount > 0 && ` · ${inactiveCount} ${inactiveCount > 1 ? "désactivés" : "désactivé"}`}
          </p>
        </div>
        <button type="button" onClick={() => setOpen("new")} className="flex h-11 items-center gap-1.5 rounded-full bg-bordeaux px-[18px] text-sm font-bold text-white shadow-bouton">
          <Plus size={17} aria-hidden="true" />
          Nouveau compte
        </button>
      </div>

      {/* Un chiffre par rôle : un clic filtre la liste */}
      <motion.div variants={stagger} initial="hidden" animate="shown" className="grid grid-cols-2 gap-3 sm:gap-[18px] xl:grid-cols-4">
        {ROLE_ORDER.map((role) => {
          const info = ROLES[role];
          const on = roleFilter === role;
          const Icon = info.icon;
          return (
            <Reveal key={role}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setRoleFilter(on ? "all" : role)}
                className={`flex h-full w-full flex-col gap-1.5 rounded-[22px] border bg-white p-4 text-left transition-shadow sm:p-5 ${
                  on ? "border-encre shadow-[0_0_0_2px_var(--color-encre)]" : "border-bordure hover:shadow-pilule"
                }`}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium text-ticket-doux">
                  <span className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${info.dot}`} aria-hidden="true" />
                    {info.label}
                  </span>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <CountUp value={counts[role]} className="font-display text-[30px] font-bold leading-none" />
                <span className="text-[13px] text-ticket-doux">{info.summary}</span>
              </button>
            </Reveal>
          );
        })}
      </motion.div>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div role="group" aria-label="Comptes affichés" className="flex gap-1 rounded-[26px] bg-encre p-1">
          {[
            { value: false, label: "Actifs", count: active.length },
            { value: true, label: "Désactivés", count: inactiveCount },
          ].map((tab) => {
            const on = showInactive === tab.value;
            return (
              <button key={tab.label} type="button" aria-pressed={on} onClick={() => setShowInactive(tab.value)} className={`relative h-11 rounded-full px-4 text-sm font-bold transition-colors ${on ? "text-encre" : "text-texte-nav hover:text-white"}`}>
                {on && <motion.span layoutId="comptes-affiches" className="absolute inset-0 rounded-full bg-creme" transition={SPRING} aria-hidden="true" />}
                <span className="relative">
                  {tab.label} <span className="ml-1 font-medium opacity-70">{tab.count}</span>
                </span>
              </button>
            );
          })}
        </div>
        <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-bordure bg-white px-3.5 sm:max-w-[320px]">
          <Search size={18} className="shrink-0 text-ticket-doux" aria-hidden="true" />
          <span className="sr-only">Rechercher</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom, identifiant, téléphone…" className="w-full bg-transparent text-sm outline-none" />
        </label>
      </div>

      <div className="flex flex-wrap items-start gap-[18px]">
        {/* Liste des comptes */}
        <section aria-label="Comptes du personnel" className="min-w-0 flex-[999_1_480px]">
          {shown.length === 0 ? (
            <div className={`${CARD} flex flex-col items-center gap-3 py-10 text-center`}>
              <p className="text-ticket-doux">
                {showInactive ? "Aucun compte désactivé." : roleFilter !== "all" || query ? "Aucun compte ne correspond." : "Aucun compte pour l’instant."}
              </p>
              {!showInactive && (
                <button type="button" onClick={() => setOpen("new")} className="h-11 rounded-full border-[1.5px] border-encre px-5 text-sm font-bold">
                  Créer un compte
                </button>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((member) => {
                  const info = roleOf(member);
                  const on = member.id === open;
                  return (
                    <motion.li
                      layout
                      key={member.id}
                      initial={{ opacity: 0, y: -10, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(6px)" }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpen(on ? null : member.id)}
                        aria-pressed={on}
                        className={`flex w-full flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[18px] border bg-white p-3.5 text-left transition-shadow ${
                          on ? "border-bordeaux shadow-[0_0_0_2px_var(--color-bordeaux)]" : "border-bordure hover:shadow-pilule"
                        } ${member.is_active ? "" : "opacity-70"}`}
                      >
                        <span className={`flex size-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${member.is_active ? info.avatar : "bg-sable text-ticket-doux"}`} aria-hidden="true">
                          {initials(member)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold">{member.name}</span>
                            {member.id === meId && <span className={`${pill} bg-encre text-white`}>Vous</span>}
                            {member.is_owner && <span className={`${pill} bg-jaune text-encre`}>Propriétaire</span>}
                          </span>
                          <span className="block truncate text-[13px] text-ticket-doux">
                            {member.username}
                            {member.phone && ` · ${member.phone}`}
                          </span>
                        </span>
                        <span className="ml-auto flex flex-col items-end gap-1">
                          <span className={`${pill} ${info.pill}`}>{info.label}</span>
                          <span className="text-xs text-ticket-doux">
                            {member.must_change_password ? <span className="font-bold text-texte-attente">Mot de passe provisoire</span> : lastSeen(member.last_login, now)}
                          </span>
                        </span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </section>

        {/* Fiche : création ou modification */}
        <AnimatePresence mode="wait">
          {open !== null && (open === "new" || selected) ? (
            <motion.aside
              key={open}
              ref={sheet}
              aria-label={open === "new" ? "Nouveau compte" : `Compte de ${selected!.name}`}
              initial={{ opacity: 0, x: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.35, ease: EASE }}
              className={`${CARD} flex max-w-full min-w-[290px] flex-[1_1_360px] scroll-mt-4 flex-col gap-4 xl:max-w-[440px]`}
            >
              <MemberSheet
                member={selected}
                isMe={selected?.id === meId}
                onClose={() => setOpen(null)}
                onSaved={(member, text) => {
                  upsert(member);
                  setOpen(member.id);
                  flash(text);
                }}
                onCredentials={(result) => {
                  upsert(result);
                  setOpen(result.id);
                  setShowInactive(false);
                  setCredentials(result);
                }}
              />
            </motion.aside>
          ) : (
            members.length > 0 && (
              <motion.aside key="vide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden min-w-[290px] flex-[1_1_360px] rounded-[22px] border-[1.5px] border-dashed border-bordure p-6 text-center text-sm text-ticket-doux xl:block xl:max-w-[440px]">
                Choisissez un compte pour changer son rôle, le désactiver ou lui donner un mot de passe provisoire.
              </motion.aside>
            )
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>{credentials && <CredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} />}</AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            className="fixed bottom-5 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-[22px] bg-encre px-5 py-3 text-center text-sm font-bold text-white shadow-carte"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

type SheetProps = {
  member: StaffMember | null; // null : nouveau compte
  isMe: boolean;
  onClose: () => void;
  onSaved: (member: StaffMember, text: string) => void;
  onCredentials: (result: StaffCredentials) => void;
};

function MemberSheet({ member, isMe, onClose, onSaved, onCredentials }: SheetProps) {
  const creating = member === null;
  const locked = Boolean(member?.is_owner && !isMe); // compte du propriétaire : lecture seule
  const [first, setFirst] = useState(member?.first_name ?? "");
  const [last, setLast] = useState(member?.last_name ?? "");
  const [username, setUsername] = useState(member?.username ?? "");
  const [usernameTouched, setUsernameTouched] = useState(!creating);
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [role, setRole] = useState<StaffRole>((member?.role as StaffRole) ?? "waiter");
  const [active, setActive] = useState(member?.is_active ?? true);
  const [ownPassword, setOwnPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const shownUsername = usernameTouched ? username : suggestUsername(first, last);
  const changed =
    creating ||
    first !== (member?.first_name ?? "") ||
    last !== (member?.last_name ?? "") ||
    shownUsername !== member?.username ||
    phone !== (member?.phone ?? "") ||
    role !== member?.role ||
    active !== member?.is_active;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!first.trim()) return setFields({ first_name: "Indiquez le prénom." });
    if (!shownUsername) return setFields({ username: "Choisissez un identifiant." });
    if (creating && ownPassword && password.length < 8) return setFields({ password: "8 caractères au moins." });
    setPending(true);
    setFields({});
    setError(null);
    const body = { first_name: first.trim(), last_name: last.trim(), username: shownUsername, phone: phone.trim(), role, is_active: active };
    if (creating) {
      const result = await call<StaffCredentials>("POST", "", { ...body, ...(ownPassword ? { password } : {}) });
      setPending(false);
      if (!result.ok) return (setFields(result.fields), setError(Object.keys(result.fields).length ? null : result.message));
      if (result.data.temporary_password) onCredentials(result.data);
      else onSaved(result.data, `Compte de ${result.data.name} créé.`);
      return;
    }
    const result = await call<StaffMember>("PATCH", `/${member!.id}`, body);
    setPending(false);
    if (!result.ok) return (setFields(result.fields), setError(Object.keys(result.fields).length && !result.fields.role ? null : result.message));
    const text =
      member!.is_active && !result.data.is_active
        ? `${result.data.name} ne peut plus se connecter.`
        : !member!.is_active && result.data.is_active
          ? `${result.data.name} peut de nouveau se connecter.`
          : role !== member!.role
            ? `${result.data.name} est maintenant ${ROLES[role].label.toLowerCase()}.`
            : `Compte de ${result.data.name} enregistré.`;
    onSaved(result.data, text);
  }

  async function reset() {
    setPending(true);
    const result = await call<StaffCredentials>("POST", `/${member!.id}/reset-password`);
    setPending(false);
    setConfirmReset(false);
    if (!result.ok) return setError(result.message);
    onCredentials(result.data);
  }

  const input = (name: string, props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) => {
    const { label, hint, ...rest } = props;
    const id = `personnel-${name}`;
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
          {hint && <span className="ml-1.5 text-[13px] font-normal text-ticket-doux">{hint}</span>}
        </label>
        <input id={id} className={FIELD} disabled={locked} aria-invalid={Boolean(fields[name])} aria-describedby={fields[name] ? `${id}-erreur` : undefined} {...rest} />
        {fields[name] && (
          <p id={`${id}-erreur`} className="text-[13px] font-medium text-bordeaux">
            {fields[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={save} className="flex min-w-0 flex-col gap-4" noValidate>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[24px] leading-tight">{creating ? "Nouveau compte" : member!.name}</h2>
          <p className="text-[13px] text-ticket-doux">
            {creating ? "La personne se connectera avec son identifiant." : `Créé le ${new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(member!.date_joined))}`}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer la fiche" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-sable">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {locked && (
        <p className="rounded-2xl bg-pastille-attente px-3.5 py-3 text-[13px] text-texte-attente">
          <span className="font-bold">Compte du propriétaire.</span> Il ne peut être modifié que par lui-même.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {input("first_name", { label: "Prénom", value: first, maxLength: 150, autoComplete: "off", onChange: (e) => setFirst(e.target.value) })}
        {input("last_name", { label: "Nom", value: last, maxLength: 150, autoComplete: "off", onChange: (e) => setLast(e.target.value) })}
      </div>
      {input("username", {
        label: "Identifiant",
        hint: "pour se connecter",
        value: shownUsername,
        maxLength: 30,
        autoCapitalize: "none",
        spellCheck: false,
        autoComplete: "off",
        placeholder: "awa.kone",
        onChange: (e) => (setUsernameTouched(true), setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))),
      })}
      {input("phone", { label: "Téléphone", hint: "facultatif", type: "tel", inputMode: "tel", value: phone, maxLength: 20, placeholder: "07 00 00 00 00", onChange: (e) => setPhone(e.target.value) })}

      {/* Rôle : ce que la personne verra */}
      <fieldset className="flex flex-col gap-2" disabled={locked || isMe}>
        <legend className="mb-1.5 text-sm font-bold">
          Rôle
          {isMe && <span className="ml-1.5 text-[13px] font-normal text-ticket-doux">un autre gérant peut changer le vôtre</span>}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {ROLE_ORDER.map((value) => {
            const info = ROLES[value];
            const on = role === value;
            const Icon = info.icon;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => setRole(value)}
                className={`relative flex min-h-[60px] items-center gap-2.5 rounded-2xl border-[1.5px] px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${
                  on ? "border-encre bg-creme" : "border-bordure bg-white hover:bg-creme"
                } ${(locked || isMe) && !on ? "opacity-50" : ""}`}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${info.avatar}`}>
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="min-w-0 text-sm font-bold">{info.label}</span>
                {on && (
                  <motion.span layoutId="role-choisi" transition={SPRING} className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-encre text-white">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={role}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1 rounded-2xl bg-creme px-3.5 py-3 text-[13px] text-texte-doux"
            aria-live="polite"
          >
            {ROLES[role].access.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Check size={14} className="shrink-0 text-servie" aria-hidden="true" />
                {line}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </fieldset>

      {creating ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-bold">Mot de passe</legend>
          {[
            { value: false, title: "Mot de passe provisoire", text: "Généré ici, à transmettre de vive voix. La personne choisira le sien à la première connexion." },
            { value: true, title: "Je le choisis", text: "La personne devra quand même le changer à la première connexion." },
          ].map((option) => (
            <label key={option.title} className={`flex cursor-pointer gap-3 rounded-2xl border-[1.5px] p-3 ${ownPassword === option.value ? "border-encre bg-creme" : "border-bordure"}`}>
              <input type="radio" name="mode-mot-de-passe" checked={ownPassword === option.value} onChange={() => setOwnPassword(option.value)} className="mt-0.5 size-5 shrink-0 accent-bordeaux" />
              <span className="text-sm">
                <span className="font-bold">{option.title}</span>
                <span className="block text-[13px] text-ticket-doux">{option.text}</span>
              </span>
            </label>
          ))}
          {ownPassword && input("password", { label: "Mot de passe", hint: "8 caractères au moins", type: "text", value: password, autoComplete: "new-password", spellCheck: false, onChange: (e) => setPassword(e.target.value) })}
        </fieldset>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-creme p-3.5 text-sm">
            <span>
              <span className="font-bold">Peut se connecter</span>
              <span className="block text-[13px] text-ticket-doux">
                {isMe ? "Vous ne pouvez pas désactiver votre propre compte." : active ? "Décochez quand la personne quitte le restaurant : son historique reste." : "Compte désactivé : la connexion est refusée."}
              </span>
            </span>
            <Switch checked={active} onChange={(value) => !(locked || isMe) && setActive(value)} label="Peut se connecter" />
          </div>

          {!isMe && !locked && (
            <div className="flex flex-col gap-2 rounded-2xl border border-bordure p-3.5 text-sm">
              <span>
                <span className="font-bold">Mot de passe oublié ?</span>
                <span className="block text-[13px] text-ticket-doux">Un nouveau mot de passe provisoire remplace l’ancien et ferme ses sessions ouvertes.</span>
              </span>
              {confirmReset ? (
                <div className="flex gap-2">
                  <button type="button" onClick={reset} disabled={pending} className="h-11 flex-1 rounded-full bg-encre px-4 text-sm font-bold text-white disabled:opacity-60">
                    Oui, nouveau mot de passe
                  </button>
                  <button type="button" onClick={() => setConfirmReset(false)} className="h-11 rounded-full border-[1.5px] border-bordure px-4 text-sm font-bold">
                    Annuler
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmReset(true)} className="flex h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-encre text-sm font-bold">
                  <KeyRound size={16} aria-hidden="true" />
                  Donner un mot de passe provisoire
                </button>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
          {error}
        </p>
      )}

      {!locked && (
        <button type="submit" disabled={pending || !changed} className="h-[52px] rounded-full bg-bordeaux px-6 font-bold text-white shadow-bouton disabled:bg-etape-inactive disabled:shadow-none">
          {pending ? "Enregistrement…" : creating ? "Créer le compte" : "Enregistrer"}
        </button>
      )}
    </form>
  );
}

/** Identifiant et mot de passe provisoire, montrés une seule fois. */
function CredentialsDialog({ credentials, onClose }: { credentials: StaffCredentials; onClose: () => void }) {
  const [copied, setCopied] = useState<"password" | "message" | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const message = [
    `Bonjour ${credentials.first_name || credentials.name},`,
    "voici votre accès à l’espace du personnel des Délices d’Orodis :",
    `Adresse : ${window.location.origin}/gestion/connexion`,
    `Identifiant : ${credentials.username}`,
    `Mot de passe provisoire : ${credentials.temporary_password}`,
    "Vous choisirez votre propre mot de passe à la première connexion.",
  ].join("\n");

  useEffect(() => {
    box.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copy(kind: "password" | "message") {
    try {
      await navigator.clipboard.writeText(kind === "password" ? (credentials.temporary_password ?? "") : message);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-encre/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="identifiants-titre"
        initial={{ opacity: 0, y: 18, scale: 0.97, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="flex max-h-[92dvh] w-full max-w-[460px] flex-col gap-4 overflow-y-auto rounded-[26px] bg-white p-6 shadow-fiche outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pastille-ok text-texte-ok">
            <KeyRound size={22} aria-hidden="true" />
          </span>
          <h2 id="identifiants-titre" className="text-[24px] leading-tight">
            Accès de <span className="text-bordeaux italic">{credentials.first_name || credentials.name}</span>
          </h2>
        </div>
        <dl className="flex flex-col gap-3 rounded-2xl bg-creme p-4">
          <div>
            <dt className="text-[13px] text-ticket-doux">Identifiant</dt>
            <dd className="font-bold">{credentials.username}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-ticket-doux">Mot de passe provisoire</dt>
            <dd className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[26px] font-bold tracking-wider text-bordeaux">{credentials.temporary_password}</span>
              <button type="button" onClick={() => copy("password")} className="flex h-11 items-center gap-1.5 rounded-full border-[1.5px] border-encre bg-white px-3.5 text-sm font-bold">
                {copied === "password" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                {copied === "password" ? "Copié" : "Copier"}
              </button>
            </dd>
          </div>
        </dl>
        <p className="text-[13px] text-texte-doux">
          Notez-le maintenant : il ne sera <strong>plus jamais affiché</strong>. Transmettez-le de vive voix ou par message privé ; à sa première connexion, {credentials.first_name || "la personne"} choisira son propre mot de passe.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => copy("message")} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-encre px-4 text-sm font-bold whitespace-nowrap">
            {copied === "message" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied === "message" ? "Message copié" : "Copier le message complet"}
          </button>
          <button type="button" onClick={onClose} className="h-12 flex-1 rounded-full bg-bordeaux px-5 text-sm font-bold whitespace-nowrap text-white">
            C’est noté
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
