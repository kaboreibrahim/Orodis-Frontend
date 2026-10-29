"use server";

// Server Action createReservation → POST /reservations/ (étape 7).
// Revalide avec le même schéma Zod que le ReservationWizard.
import { z } from "zod";
import { getSettings } from "@/lib/api/settings";
import { type SubmitFailure, postForVisitor, toFieldErrors } from "@/lib/api/submit";
import type { ReservationPublic } from "@/lib/api/types";
import { type ReservationValues, reservationSchema, withoutHoneypot } from "@/lib/schemas";

const FIELDS = ["date", "time", "party_size", "name", "phone", "note"];

export type ReservationResult = { ok: true; reservation: ReservationPublic } | SubmitFailure;

export async function createReservation(values: ReservationValues): Promise<ReservationResult> {
  // Champ piège rempli : un robot. On répond « envoyé » sans rien transmettre.
  if (values?.website) {
    const { date, time, party_size } = values;
    return { ok: true, reservation: { reference: "", status: "pending", date, time, party_size } };
  }

  const settings = await getSettings().catch(() => null);
  const parsed = reservationSchema(settings?.reservation_max_party).safeParse(values);
  if (!parsed.success) {
    return { ok: false, reason: "invalid", ...toFieldErrors(z.flattenError(parsed.error).fieldErrors, FIELDS) };
  }

  const result = await postForVisitor<ReservationPublic>("/reservations/", withoutHoneypot(parsed.data), FIELDS);
  return result.ok ? { ok: true, reservation: result.data } : result;
}
