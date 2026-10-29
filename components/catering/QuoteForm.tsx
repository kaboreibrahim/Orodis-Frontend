"use client";

// Formulaire de devis traiteur : React Hook Form + le schéma Zod partagé avec la Server Action createQuote,
// puis écran de confirmation avec la référence et le lien WhatsApp renvoyé par l'API.
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { createQuote, type QuoteResult } from "@/app/actions/quote";
import { Button, buttonClass } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { errorId, Field, FieldError, Input, TextArea } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { SuccessCheck } from "@/components/ui/SuccessCheck";
import { Toast } from "@/components/ui/Toast";
import { WhatsAppLogo } from "@/components/ui/WhatsAppLogo";
import type { Formula } from "@/lib/api/types";
import { todayIso } from "@/lib/format";
import { EVENT_TYPES, PLACE_TYPES, type QuoteValues, quoteSchema, UNDECIDED_FORMULA } from "@/lib/schemas";
import { whatsappLink } from "@/lib/whatsapp";
import { useFormulaChoice } from "./FormulaChoice";

type QuoteFormProps = {
  formulas: Pick<Formula, "slug" | "name">[];
  minGuests: number;
  /** Numéro WhatsApp du restaurant, en secours si l'envoi échoue. */
  whatsapp?: string;
};

type Sent = { reference: string; whatsappUrl: string; recap: string };

/** Ordre de l'écran : le premier champ en erreur reçoit le focus. */
const FIELD_ORDER = ["event_type", "event_date", "guests", "place_type", "place_detail", "formula", "name", "whatsapp", "email", "message"] as const;

export function QuoteForm({ formulas, minGuests, whatsapp }: QuoteFormProps) {
  const schema = useMemo(() => quoteSchema(minGuests), [minGuests]);
  const defaultValues: QuoteValues = {
    event_type: undefined as unknown as QuoteValues["event_type"],
    event_date: "",
    guests: Math.max(minGuests, 50),
    place_type: "restaurant",
    place_detail: "",
    formula: UNDECIDED_FORMULA,
    name: "",
    whatsapp: "",
    email: "",
    message: "",
    website: "",
  };
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteValues>({ resolver: zodResolver(schema), defaultValues, mode: "onTouched" });

  const { formula, setFormula } = useFormulaChoice();
  const [failure, setFailure] = useState<{ reason: "rate_limited" | "unavailable" | "invalid"; message?: string } | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);
  const sentHeading = useRef<HTMLHeadingElement>(null);
  const placeType = watch("place_type");

  // « Choisir cette formule » (cartes au-dessus) et les pastilles du formulaire partagent la même valeur.
  useEffect(() => {
    setValue("formula", formula, { shouldDirty: true });
  }, [formula, setValue]);

  useEffect(() => {
    if (sent) sentHeading.current?.focus();
  }, [sent]);

  const fallbackLink = whatsappLink(whatsapp, "Bonjour, je souhaite un devis traiteur pour un événement.");

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    let result: QuoteResult;
    try {
      result = await createQuote(values);
    } catch {
      result = { ok: false, reason: "unavailable" };
    }

    if (result.ok) {
      const event = EVENT_TYPES.find((e) => e.value === values.event_type)?.label ?? "";
      const place = PLACE_TYPES.find((p) => p.value === values.place_type)?.label.toLowerCase() ?? "";
      const chosen = formulas.find((f) => f.slug === values.formula)?.name.toLowerCase() ?? "formule à définir";
      setSent({
        reference: result.reference,
        whatsappUrl: result.whatsapp_url || whatsappLink(whatsapp, `Bonjour, je viens d’envoyer une demande de devis${result.reference ? ` (${result.reference})` : ""}.`),
        recap: [event, `${values.guests} invités`, chosen, place].filter(Boolean).join(" · "),
      });
      return;
    }

    if (result.reason === "invalid") {
      const fieldErrors = result.fieldErrors ?? {};
      for (const field of FIELD_ORDER) {
        if (fieldErrors[field]) setError(field, { type: "server", message: fieldErrors[field] });
      }
      const first = FIELD_ORDER.find((field) => fieldErrors[field]);
      if (first) {
        try {
          setFocus(first);
        } catch {
          // champ sans élément focalisable (compteur) : le message reste affiché sous le champ
        }
      }
      if (result.message) setFailure({ reason: "invalid", message: result.message });
      return;
    }
    setFailure({ reason: result.reason });
  });

  function startOver() {
    reset(defaultValues);
    setFormula(UNDECIDED_FORMULA);
    setSent(null);
    setFailure(null);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-5 text-center">
        <SuccessCheck size={76} />
        <h3 ref={sentHeading} tabIndex={-1} className="text-[28px] outline-none">
          Demande envoyée !
        </h3>
        {sent.reference && (
          <p className="rounded-full bg-sable px-4 py-1.5 text-sm">
            Référence <strong className="font-bold tracking-wide">{sent.reference}</strong>
          </p>
        )}
        <p className="max-w-[400px] text-texte-doux">
          {sent.recap}. Nous revenons vers vous avec un devis détaillé.
        </p>
        <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
          <a href={sent.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp")}>
            <WhatsAppLogo size={22} />
            Envoyer aussi sur WhatsApp
          </a>
          <Button variant="outline" onClick={startOver}>
            Nouvelle demande
          </Button>
        </div>
      </div>
    );
  }

  const chipError = (field: keyof QuoteValues) => (errors[field] ? { "aria-describedby": errorId(`champ-${field}`) } : {});

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-[18px]">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Type d’événement</legend>
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map(({ value, label }) => (
            <Chip key={value} value={value} {...register("event_type")} {...chipError("event_type")}>
              {label}
            </Chip>
          ))}
        </div>
        <FieldError id="champ-event_type" error={errors.event_type?.message} />
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
        <Input
          id="champ-event_date"
          type="date"
          label="Date"
          min={todayIso(1)}
          error={errors.event_date?.message}
          {...register("event_date")}
        />
        <Field id="champ-guests" label="Nombre d’invités" error={errors.guests?.message}>
          <Controller
            control={control}
            name="guests"
            render={({ field }) => (
              <Stepper
                id="champ-guests"
                value={field.value}
                onChange={field.onChange}
                min={minGuests}
                max={5000}
                step={10}
                unit="invités"
                invalid={!!errors.guests}
                describedBy={errors.guests ? errorId("champ-guests") : undefined}
              />
            )}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">Lieu</legend>
        <div className="flex flex-wrap gap-2">
          {PLACE_TYPES.map(({ value, label }) => (
            <Chip key={value} value={value} {...register("place_type")}>
              {label}
            </Chip>
          ))}
        </div>
        {placeType !== "restaurant" && (
          <Input
            id="champ-place_detail"
            label={<span className="sr-only">Commune, quartier ou nom de la salle</span>}
            placeholder="Commune, quartier ou nom de la salle"
            autoComplete="address-level2"
            error={errors.place_detail?.message}
            {...register("place_detail")}
          />
        )}
      </fieldset>

      <fieldset id="champ-formule" tabIndex={-1} className="flex flex-col gap-2 outline-none">
        <legend className="mb-2 text-sm font-bold">Formule souhaitée</legend>
        <div className="flex flex-wrap gap-2">
          {[...formulas.map((f) => ({ value: f.slug ?? "", label: f.name })), { value: UNDECIDED_FORMULA, label: "Je ne sais pas encore" }].map(
            ({ value, label }) => (
              <Chip key={value} name="formula" value={value} checked={formula === value} onChange={() => setFormula(value)}>
                {label}
              </Chip>
            ),
          )}
        </div>
        <FieldError id="champ-formula" error={errors.formula?.message} />
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
        <Input id="champ-name" label="Nom" placeholder="Votre nom" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input
          id="champ-whatsapp"
          type="tel"
          label="WhatsApp"
          prefix="+225"
          placeholder="07 00 00 00 00"
          autoComplete="tel-national"
          inputMode="tel"
          error={errors.whatsapp?.message}
          {...register("whatsapp")}
        />
      </div>

      <Input
        id="champ-email"
        type="email"
        label="E-mail"
        hint="(facultatif)"
        placeholder="vous@exemple.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <TextArea
        id="champ-message"
        label="Vos envies"
        hint="Plats souhaités, budget, thème, besoins de matériel…"
        rows={3}
        error={errors.message?.message}
        {...register("message")}
      />

      {/* Champ piège : invisible et hors du parcours clavier ; seul un robot le remplit. */}
      <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
        <label>
          Site web
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {failure && (
        <Toast
          action={
            failure.reason !== "invalid" && (
              <a href={fallbackLink} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "md", "self-start")}>
                <WhatsAppLogo size={22} />
                Écrire sur WhatsApp
              </a>
            )
          }
        >
          {failure.reason === "rate_limited"
            ? "Trop de demandes, réessayez plus tard ou écrivez-nous sur WhatsApp."
            : failure.reason === "unavailable"
              ? "Envoi impossible pour le moment. Réessayez dans un instant ou écrivez-nous sur WhatsApp."
              : failure.message}
        </Toast>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {/* Sur une ligne même à 390 px. */}
        <span className="text-base sm:text-[17px]">{isSubmitting ? "Envoi en cours…" : "Envoyer ma demande de devis"}</span>
      </Button>
    </form>
  );
}
