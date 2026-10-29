"use client";

// Réservation en 3 étapes puis confirmation (maquette ResaSite) :
// 1. date et couverts, 2. créneau lu en direct (/api/availability), 3. coordonnées, envoyées par la Server Action createReservation.
// La page est statique : la date du jour et les paramètres ?party=&date= ne sont lus que dans le navigateur.
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { createReservation, type ReservationResult } from "@/app/actions/reservation";
import { EASE_ORODIS } from "@/components/motion/ease";
import { Button, buttonClass } from "@/components/ui/Button";
import { errorId, FieldError, Input, TextArea } from "@/components/ui/Input";
import { SuccessCheck } from "@/components/ui/SuccessCheck";
import { Toast } from "@/components/ui/Toast";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import { type Availability, DAY_KEYS, type OpeningHours, type ReservationPublic } from "@/lib/api/types";
import { capitalize, formatDate, formatPhone, formatShortDate, todayIso } from "@/lib/format";
import { BOOKING_WINDOW_DAYS, type ReservationValues, reservationSchema } from "@/lib/schemas";
import { telLink, whatsappLink } from "@/lib/whatsapp";
import { DatePicker } from "./DatePicker";
import { PartySize } from "./PartySize";
import { SlotGrid } from "./SlotGrid";

type WizardProps = {
  maxParty: number;
  hours?: OpeningHours;
  phone?: string;
  whatsapp?: string;
  /** Venus de ReserveCta (?party=&date=). */
  initialParty?: number;
  initialDate?: string;
};

type SlotsState =
  | { status: "loading" }
  | { status: "ready"; data: Availability }
  | { status: "error"; reason: "rate_limited" | "unavailable"; message?: string };

type Failure = { reason: "rate_limited" | "unavailable" | "invalid"; message?: string };

const STEP_TITLES = ["Date et couverts", "Choisissez l’heure", "Vos coordonnées"];

const STATUS_LABELS: Partial<Record<NonNullable<ReservationPublic["status"]>, string>> = {
  pending: "En attente de confirmation",
  confirmed: "Confirmée",
};

const RATE_LIMITED = "Trop de demandes, réessayez plus tard ou écrivez-nous sur WhatsApp.";
const UNAVAILABLE = "Service momentanément indisponible. Réessayez dans un instant ou écrivez-nous sur WhatsApp.";

// Date du jour : null au rendu serveur (la page statique peut dater de la veille), connue dès l'hydratation.
const noSubscription = () => () => {};
function useToday(): string | null {
  return useSyncExternalStore(noSubscription, () => todayIso(), () => null);
}

const isClosedDay = (hours: OpeningHours | undefined, iso: string) =>
  hours ? !hours[DAY_KEYS[(new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7]]?.length : false;

const people = (n: number) => `${n} ${n > 1 ? "personnes" : "personne"}`;

/** Lit ?party=&date= puis affiche le parcours ; à placer dans un <Suspense>. */
export function ReservationWizardFromUrl(props: Omit<WizardProps, "initialParty" | "initialDate">) {
  const params = useSearchParams();
  const party = Number(params.get("party"));
  const date = params.get("date") ?? "";
  return (
    <ReservationWizard
      {...props}
      initialParty={Number.isInteger(party) && party >= 1 && party <= 999 ? party : undefined}
      initialDate={/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined}
    />
  );
}

export function ReservationWizard({ maxParty, hours, phone, whatsapp, initialParty, initialDate }: WizardProps) {
  const reduce = useReducedMotion();
  const today = useToday();
  const schema = useMemo(() => reservationSchema(maxParty), [maxParty]);
  const defaultValues: ReservationValues = {
    date: "",
    party_size: initialParty ?? 2,
    time: "",
    name: "",
    phone: "",
    note: "",
    website: "",
  };
  const {
    register,
    watch,
    setValue,
    getValues,
    setError,
    clearErrors,
    setFocus,
    trigger,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservationValues>({ resolver: zodResolver(schema), defaultValues, mode: "onTouched" });

  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState<SlotsState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [done, setDone] = useState<{ reservation: ReservationPublic; name: string } | null>(null);
  const moved = useRef(false);
  // Le focus suit le changement d'étape (pas au premier affichage) : AnimatePresence monte le nouveau titre
  // après la sortie de l'ancien, d'où un ref par fonction plutôt qu'un effet.
  const heading = (element: HTMLHeadingElement | null) => {
    if (element && moved.current) element.focus({ preventScroll: true });
  };

  const date = watch("date");
  const party = watch("party_size");
  const time = watch("time");
  const tooMany = party > maxParty;

  // Date de départ : celle de l'accueil si elle est valable, sinon le premier jour ouvert à partir d'aujourd'hui.
  useEffect(() => {
    if (!today || getValues("date")) return;
    const last = todayIso(BOOKING_WINDOW_DAYS);
    if (initialDate && initialDate >= today && initialDate <= last && !isClosedDay(hours, initialDate)) {
      setValue("date", initialDate);
      return;
    }
    let day = today;
    for (let i = 0; i < 7 && isClosedDay(hours, day); i++) day = todayIso(i + 1);
    setValue("date", day);
  }, [today, initialDate, hours, getValues, setValue]);

  // Créneaux lus en direct à l'étape 2 (et rechargés si l'API signale un créneau devenu complet).
  useEffect(() => {
    if (step !== 1 || !date || tooMany) return;
    const controller = new AbortController();
    setSlots({ status: "loading" });
    fetch(`/api/availability?${new URLSearchParams({ date, party: String(party) })}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 429) return setSlots({ status: "error", reason: "rate_limited" });
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          const message = body && typeof body === "object" ? Object.values(body).flat().find((v) => typeof v === "string") : undefined;
          return setSlots({ status: "error", reason: "unavailable", message: message as string | undefined });
        }
        const data = body as Availability;
        setSlots({ status: "ready", data });
        const chosen = getValues("time");
        if (chosen && !data.slots.some((slot) => slot.time === chosen && slot.available)) setValue("time", "");
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setSlots({ status: "error", reason: "unavailable" });
      });
    return () => controller.abort();
  }, [step, date, party, tooMany, reloadKey, getValues, setValue]);

  function goTo(next: number) {
    moved.current = true;
    setFailure(null);
    setStep(next);
  }

  function changeDate(next: string) {
    setValue("date", next, { shouldValidate: true });
    setValue("time", "");
    clearErrors("time");
  }

  function changeParty(next: number) {
    setValue("party_size", next, { shouldValidate: next <= maxParty });
    setValue("time", "");
    clearErrors(["time", "party_size"]);
  }

  async function next() {
    if (step === 0 && (await trigger(["date", "party_size"]))) goTo(1);
    else if (step === 1 && (await trigger("time"))) goTo(2);
  }

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    let result: ReservationResult;
    try {
      result = await createReservation(values);
    } catch {
      result = { ok: false, reason: "unavailable" };
    }

    if (result.ok) {
      moved.current = true;
      setDone({ reservation: result.reservation, name: values.name.trim() });
      return;
    }
    if (result.reason !== "invalid") {
      setFailure({ reason: result.reason });
      return;
    }

    const fieldErrors = result.fieldErrors ?? {};
    const show = (field: keyof ReservationValues) => {
      if (fieldErrors[field]) setError(field, { type: "server", message: fieldErrors[field] });
    };
    if (fieldErrors.time) {
      // Créneau pris entre-temps : retour aux créneaux, rechargés.
      setValue("time", "");
      show("time");
      setReloadKey((key) => key + 1);
      goTo(1);
    } else if (fieldErrors.date || fieldErrors.party_size) {
      show("date");
      show("party_size");
      goTo(0);
    } else {
      (["name", "phone", "note"] as const).forEach(show);
      const first = (["name", "phone", "note"] as const).find((field) => fieldErrors[field]);
      if (first) setFocus(first);
    }
    if (result.message) setFailure({ reason: "invalid", message: result.message });
  });

  function startOver() {
    reset({ ...defaultValues, date: getValues("date"), party_size: getValues("party_size") });
    setDone(null);
    goTo(0);
  }

  const fallbackLink = whatsappLink(whatsapp, "Bonjour, je souhaite réserver une table.");
  const whatsappButton = (
    <a href={fallbackLink} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "md", "self-start")}>
      <WhatsAppLogo size={22} />
      Écrire sur WhatsApp
    </a>
  );
  const recap = date ? `${capitalize(formatShortDate(date))} · ${time ? `${time} · ` : ""}${people(party)}` : "";
  const motionProps = {
    initial: reduce ? false : { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: reduce ? undefined : { opacity: 0, x: -24 },
    transition: { duration: reduce ? 0 : 0.35, ease: EASE_ORODIS },
  } as const;

  if (done) {
    const { reservation } = done;
    return (
      <div className="rounded-[28px] bg-white p-5 shadow-carte sm:p-8">
        <motion.div key="fini" {...motionProps} className="flex flex-col items-center gap-3.5 text-center">
          <SuccessCheck size={84} />
          <h2 ref={heading} tabIndex={-1} className="text-[30px] outline-none">
            Demande envoyée !
          </h2>
          <p className="max-w-[340px] text-texte-doux">Le restaurant vous confirme par WhatsApp.</p>
          <dl className="mt-1 flex w-full flex-col gap-2.5 rounded-[20px] bg-creme p-[18px] text-left">
            {[
              ["Référence", reservation.reference],
              ["Date", capitalize(formatDate(reservation.date))],
              ["Heure", reservation.time.slice(0, 5)],
              ["Personnes", String(reservation.party_size)],
              ["Au nom de", done.name],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-texte-doux">{label}</dt>
                  <dd className="text-right font-bold">{value}</dd>
                </div>
              ))}
            <div className="flex items-center justify-between gap-4">
              <dt className="text-texte-doux">Statut</dt>
              <dd className="rounded-full bg-jaune/40 px-2.5 py-1 text-[13px] font-bold">
                {STATUS_LABELS[reservation.status ?? "pending"] ?? "Enregistrée"}
              </dd>
            </div>
          </dl>
          {phone && (
            <p className="text-sm text-texte-doux">
              Un empêchement ? Prévenez-nous au{" "}
              <a href={telLink(phone)} className="font-bold whitespace-nowrap text-bordeaux underline underline-offset-4">
                {formatPhone(phone)}
              </a>
              .
            </p>
          )}
          <div className="mt-1 flex flex-wrap justify-center gap-2.5">
            <Link href="/" className={buttonClass("outline")}>
              Retour à l’accueil
            </Link>
            <Button onClick={startOver}>Nouvelle réservation</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col rounded-[28px] bg-white p-5 shadow-carte sm:p-7">
      {/* En-tête du parcours : retour, étape, barre de progression. */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(step - 1)}
          aria-label="Étape précédente"
          className={`-ml-2 flex size-11 items-center justify-center rounded-full hover:bg-sable ${step === 0 ? "invisible" : ""}`}
        >
          <ChevronLeft size={24} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <span className="text-[13px] font-bold text-texte-doux">
          <span className="sr-only">Étape </span>
          {step + 1} / 3
        </span>
      </div>
      <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-bordure" aria-hidden="true">
        <motion.div
          className="h-full origin-left rounded-full bg-bordeaux"
          initial={false}
          animate={{ scaleX: (step + 1) / 3 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: EASE_ORODIS }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} {...motionProps} className="flex flex-col gap-5 pt-5">
          <h2 ref={heading} tabIndex={-1} className="text-[clamp(26px,3vw,32px)] outline-none">
            {STEP_TITLES[step]}
          </h2>

          {step > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-[18px] bg-creme px-4 py-3">
              <p className="font-bold">{recap}</p>
              <button
                type="button"
                onClick={() => goTo(step === 2 ? 1 : 0)}
                className="min-h-11 shrink-0 text-sm font-bold text-bordeaux underline underline-offset-4"
              >
                Modifier
              </button>
            </div>
          )}

          {step === 0 &&
            (today && date ? (
              <>
                <DatePicker today={today} value={date} onChange={changeDate} hours={hours} describedBy={errors.date ? errorId("champ-date") : undefined} />
                <FieldError id="champ-date" error={errors.date?.message} />
                <PartySize value={party} onChange={changeParty} maxParty={maxParty} />
                <FieldError id="champ-party_size" error={tooMany ? undefined : errors.party_size?.message} />
                {tooMany && (
                  <div className="rounded-2xl bg-sable p-4 text-[15px]">
                    Au-delà de {maxParty} personnes, nous préparons votre venue sur devis.{" "}
                    <Link href="/traiteur#devis" className="font-bold text-bordeaux underline underline-offset-4">
                      Demander un devis traiteur
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3" aria-busy="true">
                <span className="sr-only">Chargement du calendrier…</span>
                <div className="h-[76px] animate-pulse rounded-2xl bg-sable" />
                <div className="h-24 animate-pulse rounded-2xl bg-sable" />
              </div>
            ))}

          {step === 1 && (
            <div aria-live="polite" className="flex flex-col gap-4">
              {errors.time?.type === "server" && <Toast>{errors.time.message}</Toast>}
              {slots.status === "loading" && (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5" aria-busy="true">
                  <span className="sr-only">Chargement des créneaux…</span>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-xl bg-sable" />
                  ))}
                </div>
              )}
              {slots.status === "error" && (
                <Toast action={slots.reason === "rate_limited" ? whatsappButton : <Button variant="outline" onClick={() => setReloadKey((k) => k + 1)} className="self-start">Réessayer</Button>}>
                  {slots.reason === "rate_limited" ? RATE_LIMITED : (slots.message ?? UNAVAILABLE)}
                </Toast>
              )}
              {slots.status === "ready" &&
                (slots.data.closed ? (
                  <div className="flex flex-col items-start gap-3 rounded-2xl bg-sable p-4">
                    <p>Le restaurant est fermé ce jour-là. Choisissez une autre date.</p>
                    <Button variant="outline" onClick={() => goTo(0)}>
                      Changer de date
                    </Button>
                  </div>
                ) : slots.data.slots.every((slot) => !slot.available) ? (
                  <div className="flex flex-col items-start gap-3 rounded-2xl bg-sable p-4">
                    <p>Plus aucun créneau libre ce jour-là pour {people(party)}.</p>
                    <Button variant="outline" onClick={() => goTo(0)}>
                      Changer de date
                    </Button>
                  </div>
                ) : (
                  <>
                    <SlotGrid
                      slots={slots.data.slots}
                      value={time}
                      onChange={(next) => setValue("time", next, { shouldValidate: true })}
                      describedBy={errors.time ? errorId("champ-time") : undefined}
                    />
                    {errors.time?.type !== "server" && <FieldError id="champ-time" error={errors.time?.message} />}
                  </>
                ))}
            </div>
          )}

          {step === 2 && (
            <>
              <Input id="champ-name" label="Nom" placeholder="Votre nom" autoComplete="name" error={errors.name?.message} {...register("name")} />
              <Input
                id="champ-phone"
                type="tel"
                label="Numéro WhatsApp"
                prefix="+225"
                placeholder="07 00 00 00 00"
                autoComplete="tel-national"
                inputMode="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <TextArea
                id="champ-note"
                label="Une demande ?"
                hint="(facultatif) Ex. : anniversaire, chaise bébé, table en terrasse"
                rows={2}
                error={errors.note?.message}
                {...register("note")}
              />
              {/* Champ piège : invisible et hors du parcours clavier ; seul un robot le remplit. */}
              <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
                <label>
                  Site web
                  <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
                </label>
              </div>
            </>
          )}

          {failure && (
            <Toast action={failure.reason !== "invalid" && whatsappButton}>
              {failure.reason === "rate_limited" ? RATE_LIMITED : failure.reason === "unavailable" ? UNAVAILABLE : failure.message}
            </Toast>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bouton d'action, collé en bas de l'écran sur mobile comme dans la maquette. */}
      <div className="sticky bottom-3 z-10 mt-6">
        {step < 2 ? (
          <Button
            size="lg"
            onClick={next}
            disabled={step === 0 ? !date || tooMany : !time || slots.status !== "ready"}
            className="w-full"
          >
            {step === 0 ? "Voir les créneaux" : time ? `Continuer · ${time}` : "Choisissez une heure"}
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Envoi en cours…" : "Envoyer la demande"}
          </Button>
        )}
      </div>
    </form>
  );
}
