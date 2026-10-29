// Champ de formulaire de 48 px avec son libellé, une aide facultative et le message d'erreur relié (aria-describedby).
import type { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from "react";

export const fieldClass =
  "w-full min-w-0 rounded-xl border-[1.5px] border-bordure bg-white px-3.5 font-normal text-encre placeholder:text-texte-doux/70 aria-invalid:border-bordeaux";

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
};

/** Identifiant du message d'erreur d'un champ, pour aria-describedby. */
export const errorId = (id: string) => `${id}-erreur`;

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={errorId(id)} className="text-sm font-medium text-bordeaux">
      {error}
    </p>
  );
}

export function Field({ id, label, hint, error, className = "", children }: FieldProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
        {hint && <span className="ml-1.5 text-[13px] font-normal text-texte-doux">{hint}</span>}
      </label>
      {children}
      <FieldError id={id} error={error} />
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Texte fixe avant la saisie, comme l'indicatif +225. */
  prefix?: string;
  ref?: Ref<HTMLInputElement>;
};

export function Input({ id, label, hint, error, prefix, className = "", ...input }: InputProps) {
  const control = (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId(id) : undefined}
      className={`${fieldClass} h-12 ${prefix ? "rounded-l-none" : ""} ${className}`}
      {...input}
    />
  );
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      {prefix ? (
        <span className="flex">
          <span className="flex h-12 items-center rounded-l-xl border-[1.5px] border-r-0 border-bordure bg-sable px-3 text-sm font-bold">
            {prefix}
          </span>
          {control}
        </span>
      ) : (
        control
      )}
    </Field>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
};

export function TextArea({ id, label, hint, error, className = "", ...textarea }: TextAreaProps) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId(id) : undefined}
        className={`${fieldClass} resize-y py-2.5 ${className}`}
        {...textarea}
      />
    </Field>
  );
}
