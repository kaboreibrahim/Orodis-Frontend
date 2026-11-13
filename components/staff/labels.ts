// Libellés et pastilles communs à la gestion (maquettes phase3/Gestion et phase3/Tables).
import type { StaffOrder } from "@/lib/api/staff";

export const pill = "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-bold";

export const STATUS: Record<string, { label: string; style: string }> = {
  received: { label: "Nouvelle", style: "bg-pastille-nouvelle text-note-texte" },
  preparing: { label: "En préparation", style: "bg-pastille-preparation text-texte-preparation" },
  ready: { label: "Prête", style: "bg-pastille-ok text-texte-ok" },
  served: { label: "Servie", style: "bg-pastille-terminee text-ticket-doux" },
  cancelled: { label: "Annulée", style: "bg-rose text-bordeaux" },
};

export const FLOW = ["received", "preparing", "ready", "served"] as const;

/** Étape suivante : libellé du bouton et rôles autorisés (règles de services.advance côté Django). */
export const NEXT: Record<string, { label: string; roles: string[]; waiting: string }> = {
  received: { label: "Lancer la préparation", roles: ["kitchen", "manager"], waiting: "En attente de la cuisine" },
  preparing: { label: "Marquer prête", roles: ["kitchen", "manager"], waiting: "En préparation en cuisine" },
  ready: { label: "Marquer servie", roles: ["waiter", "cashier", "manager"], waiting: "Prête, en attente du serveur" },
};

export const CAN_CANCEL = ["cashier", "manager"];
export const CAN_PAY = ["cashier", "manager"];
export const CANCELLABLE = ["received", "preparing"];

export const CHANNEL: Record<string, { label: string; style: string }> = {
  table: { label: "À table", style: "bg-sable text-canal-table" },
  counter: { label: "Comptoir", style: "bg-pastille-comptoir text-canal-comptoir" },
};

export const METHODS = [
  { value: "wave", label: "Wave", dot: "bg-wave" },
  { value: "orange_money", label: "Orange Money", dot: "bg-orange-money" },
  { value: "mtn_momo", label: "MTN MoMo", dot: "bg-mtn" },
  { value: "cash", label: "Espèces", dot: "bg-especes" },
] as const;
export type PaymentMethod = (typeof METHODS)[number]["value"];

export const methodLabel = (value: string | null | undefined) => METHODS.find((m) => m.value === value)?.label ?? "";

export const receiptRef = (n: number) => `R-${String(n).padStart(6, "0")}`;

/** Numéro du reçu, ou null tant que la commande n'est pas payée (le schéma le déclare non nul). */
export const receiptOf = (order: StaffOrder) => (order.receipt_number as number | null) ?? null;

export const isPaid = (order: StaffOrder) => receiptOf(order) !== null;

/** Commande encore à encaisser : ni payée, ni annulée. */
export const isUnpaid = (order: StaffOrder) => !isPaid(order) && order.status !== "cancelled";

export function payment(order: StaffOrder): { label: string; style: string } {
  const receipt = receiptOf(order);
  if (receipt !== null) return { label: `Payé · ${receiptRef(receipt)}`, style: "bg-pastille-ok text-texte-ok" };
  if (order.status === "cancelled") return { label: "—", style: "bg-pastille-terminee text-ticket-doux" };
  if (order.payment_timing === "now") {
    const wished = methodLabel(order.payment_method);
    return { label: wished ? `À régler · ${wished}` : "À régler", style: "bg-pastille-attente text-texte-attente" };
  }
  return { label: "À la fin du repas", style: "bg-sable text-ticket-doux" };
}

export const who = (order: StaffOrder) => (order.table_number != null ? `Table ${order.table_number}` : "Comptoir");
