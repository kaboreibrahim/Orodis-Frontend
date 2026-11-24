"use client";

// Formulaire « choisir mon mot de passe » : Server Action changePassword, erreurs champ par champ.
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useActionState, useState } from "react";
import { changePassword, type PasswordState } from "@/app/actions/staff";
import { Button } from "@/components/ui/Button";
import { errorId, Field, fieldClass } from "@/components/ui/Input";

const FIELDS = [
  { name: "current_password", label: "Mot de passe actuel", forcedLabel: "Mot de passe provisoire", autoComplete: "current-password" },
  { name: "new_password", label: "Nouveau mot de passe", forcedLabel: "Nouveau mot de passe", autoComplete: "new-password" },
  { name: "confirm", label: "Confirmez le nouveau mot de passe", forcedLabel: "Confirmez le nouveau mot de passe", autoComplete: "new-password" },
] as const;

export function PasswordForm({ forced }: { forced: boolean }) {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {FIELDS.map((field) => {
        const id = `mdp-${field.name}`;
        const error = state.fields?.[field.name];
        return (
          <Field
            key={field.name}
            id={id}
            label={forced ? field.forcedLabel : field.label}
            hint={field.name === "new_password" ? "8 caractères au moins, pas uniquement des chiffres" : undefined}
            error={error}
          >
            <input
              id={id}
              name={field.name}
              type={visible ? "text" : "password"}
              autoComplete={field.autoComplete}
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId(id) : undefined}
              className={`${fieldClass} h-12`}
            />
          </Field>
        );
      })}
      <button type="button" onClick={() => setVisible((value) => !value)} className="flex min-h-11 items-center gap-2 self-start text-sm font-bold text-texte-doux">
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        {visible ? "Masquer les mots de passe" : "Afficher les mots de passe"}
      </button>
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose px-3.5 py-2.5 text-sm font-medium text-bordeaux">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <KeyRound size={20} aria-hidden="true" />
        {pending ? "Enregistrement…" : forced ? "Enregistrer et continuer" : "Changer mon mot de passe"}
      </Button>
    </form>
  );
}
