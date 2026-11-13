// Panier de l'app de table : règles pures, partagées par le hook useCart et le panier.
// Les prix servent à l'affichage ; le backend recalcule toujours le total à l'envoi.
export const MAX_LINES = 30;
export const MAX_QUANTITY = 20;

export type CartOption = { id: number; name: string; price_delta: number };

export type CartLine = {
  /** Plat + options + précision : deux lignes identiques s'additionnent. */
  key: string;
  dishId: number;
  slug: string;
  name: string;
  photo: string | null;
  /** Prix du plat seul ; les suppléments sont dans options. */
  price: number;
  options: CartOption[];
  /** Précision pour la cuisine, ex. « sans oignon ». */
  note: string;
  quantity: number;
};

export type NewLine = Omit<CartLine, "key">;

export function lineKey(dishId: number, optionIds: number[], note: string): string {
  return [dishId, [...optionIds].sort((a, b) => a - b).join("."), note.trim().toLowerCase()].join("|");
}

export const unitPrice = (line: Pick<CartLine, "price" | "options">) =>
  line.price + line.options.reduce((sum, option) => sum + option.price_delta, 0);

export const lineTotal = (line: CartLine) => unitPrice(line) * line.quantity;

export function cartTotals(lines: CartLine[]) {
  return {
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + lineTotal(line), 0),
  };
}

/** « Attiéké · Piment doux · « sans oignon » » */
export function lineDetails(line: Pick<CartLine, "options" | "note">): string {
  return [...line.options.map((option) => option.name), line.note && `« ${line.note} »`].filter(Boolean).join(" · ");
}

export type AddResult = { lines: CartLine[]; added: boolean; reason?: "full" | "max_quantity" };

export function addLine(lines: CartLine[], incoming: NewLine): AddResult {
  const key = lineKey(incoming.dishId, incoming.options.map((o) => o.id), incoming.note);
  const existing = lines.find((line) => line.key === key);
  if (existing) {
    const quantity = existing.quantity + incoming.quantity;
    if (quantity > MAX_QUANTITY) return { lines, added: false, reason: "max_quantity" };
    return { lines: lines.map((line) => (line.key === key ? { ...line, quantity } : line)), added: true };
  }
  if (lines.length >= MAX_LINES) return { lines, added: false, reason: "full" };
  return { lines: [...lines, { ...incoming, note: incoming.note.trim(), key }], added: true };
}

export function setQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  const clamped = Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity)));
  return lines.map((line) => (line.key === key ? { ...line, quantity: clamped } : line));
}

export const removeLine = (lines: CartLine[], key: string) => lines.filter((line) => line.key !== key);

/** Corps de POST /table/orders/ : jamais de prix, le backend les recalcule. */
export function toOrderItems(lines: CartLine[]) {
  return lines.map((line) => ({
    dish_id: line.dishId,
    quantity: line.quantity,
    option_ids: line.options.map((option) => option.id),
    note: line.note,
  }));
}

/** Lecture tolérante du localStorage : une ligne abîmée est ignorée, jamais une erreur. */
export function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (line): line is CartLine =>
          typeof line === "object" &&
          line !== null &&
          typeof line.key === "string" &&
          Number.isInteger(line.dishId) &&
          typeof line.name === "string" &&
          Number.isInteger(line.price) &&
          Array.isArray(line.options) &&
          typeof line.note === "string" &&
          Number.isInteger(line.quantity) &&
          line.quantity >= 1 &&
          line.quantity <= MAX_QUANTITY,
      )
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}
