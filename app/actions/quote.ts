"use server";

// Server Action createQuote → POST /catering/quotes/ (étape 6).
// Revalide avec le même schéma Zod que le formulaire : le navigateur n'est jamais cru sur parole.
import { z } from "zod";
import { getSettings } from "@/lib/api/settings";
import { type SubmitFailure, postForVisitor, toFieldErrors } from "@/lib/api/submit";
import type { QuoteCreated } from "@/lib/api/types";
import { type QuoteValues, quoteSchema, withoutHoneypot } from "@/lib/schemas";

const FIELDS = ["event_type", "event_date", "guests", "place_type", "place_detail", "formula", "name", "whatsapp", "email", "message"];

export type QuoteResult = ({ ok: true } & QuoteCreated) | SubmitFailure;

export async function createQuote(values: QuoteValues): Promise<QuoteResult> {
  // Champ piège rempli : un robot. On répond « envoyé » sans rien transmettre.
  if (values?.website) return { ok: true, reference: "", whatsapp_url: null };

  const settings = await getSettings().catch(() => null);
  const parsed = quoteSchema(settings?.catering_min_guests ?? 1).safeParse(values);
  if (!parsed.success) {
    return { ok: false, reason: "invalid", ...toFieldErrors(z.flattenError(parsed.error).fieldErrors, FIELDS) };
  }

  const result = await postForVisitor<QuoteCreated>("/catering/quotes/", withoutHoneypot(parsed.data), FIELDS);
  return result.ok ? { ok: true, ...result.data } : result;
}
