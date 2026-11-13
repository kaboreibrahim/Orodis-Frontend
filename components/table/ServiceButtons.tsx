"use client";

// « Appeler un serveur » et « Demander l'addition » (maquette Main) : Server Action, puis message 2,6 s.
import { Bell, Receipt } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { callService, type ServiceResult } from "@/app/actions/table";
import type { ServiceKind } from "@/lib/api/table";
import { StatusToast } from "./StatusToast";

function message(kind: ServiceKind, result: ServiceResult, table: number): string {
  if (result.ok) {
    if (kind === "waiter") {
      return result.created ? `Un serveur a été prévenu. Il arrive à la table ${table}.` : "Un serveur est déjà prévenu, il arrive.";
    }
    return result.created ? "Votre demande d’addition a été envoyée au serveur." : "Votre demande d’addition est déjà transmise.";
  }
  if (result.reason === "closed") return "Cette table est fermée. Demandez au serveur.";
  if (result.reason === "rate_limited") return "Trop de demandes, patientez un instant.";
  return "Envoi impossible pour le moment. Faites signe au serveur.";
}

export function ServiceButtons({ tableNumber }: { tableNumber: number }) {
  const [toast, setToast] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function send(kind: ServiceKind) {
    startTransition(async () => {
      let result: ServiceResult;
      try {
        result = await callService(kind);
      } catch {
        result = { ok: false, reason: "unavailable" };
      }
      if (!result.ok && result.reason === "expired") {
        window.location.assign(`${window.location.pathname.replace(/\/$/, "")}/ouvrir`);
        return;
      }
      setFailed(!result.ok);
      setToast(message(kind, result, tableNumber));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setToast(null), 2600);
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <ServiceButton icon={<Bell size={26} strokeWidth={1.8} aria-hidden="true" />} disabled={pending} onClick={() => send("waiter")}>
          Appeler un serveur
        </ServiceButton>
        <ServiceButton icon={<Receipt size={26} strokeWidth={1.8} aria-hidden="true" />} disabled={pending} onClick={() => send("bill")}>
          Demander l’addition
        </ServiceButton>
      </div>

      <StatusToast message={toast} tone={failed ? "error" : "success"} />
    </>
  );
}

function ServiceButton({
  icon,
  children,
  ...props
}: { icon: ReactNode; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex min-h-16 items-center gap-2.5 rounded-[22px] border-[1.5px] border-bordeaux bg-white px-3.5 text-left text-[15px] font-bold text-encre transition-opacity disabled:opacity-60 [&_svg]:shrink-0 [&_svg]:text-bordeaux"
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
