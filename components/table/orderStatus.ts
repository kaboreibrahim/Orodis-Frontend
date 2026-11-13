// Pastille de statut d'une commande, côté client (liste des commandes de la table).
export const STATUS_PILL: Record<string, string> = {
  received: "bg-pastille-nouvelle text-encre",
  preparing: "bg-pastille-preparation text-texte-preparation",
  ready: "bg-pastille-ok text-texte-ok",
  served: "bg-pastille-terminee text-texte-doux",
  cancelled: "bg-rose text-bordeaux",
};
