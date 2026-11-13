"use client";

// Formulaire de connexion du personnel : Server Action login (cookies httpOnly, redirection selon le rôle).
import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/staff";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm({ suite }: { suite: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="suite" value={suite} />
      <Input
        id="identifiant"
        name="username"
        label="Identifiant"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={state.username}
        required
      />
      <Input id="mot-de-passe" name="password" type="password" label="Mot de passe" autoComplete="current-password" required />
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose px-3.5 py-2.5 text-sm font-medium text-bordeaux">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
        <LogIn size={20} aria-hidden="true" />
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
