"use client";

// Carte & menus (maquette phase3/AdminCarte) : à gauche les catégories et leurs sous-catégories,
// au centre les plats de la sous-catégorie choisie, à droite la fiche du plat.
// Après chaque enregistrement, toute la carte est relue : l'écran reste le reflet exact de la base.
import { ArrowDown, ArrowUp, EyeOff, ImageOff, Pencil, Plus, Star, X } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ManageCategory, ManageDish, ManageSubCategory } from "@/lib/api/staff";
import { formatPrice } from "@/lib/format";
import { DishEditor, Switch } from "./DishEditor";
import { menuCall } from "./menu-api";
import { EASE, Reveal, RevealTitle, stagger } from "./reveal";

const CARD = "rounded-[22px] border border-bordure bg-white p-5";
const ICON_BUTTON = "flex size-11 shrink-0 items-center justify-center rounded-full text-ticket-doux hover:bg-sable disabled:opacity-25";
const FIELD = "h-12 w-full rounded-xl border border-bordure bg-white px-3.5 text-[15px]";

type Level = "category" | "subcategory" | "dish";
type Editing =
  | { level: "category"; item?: ManageCategory }
  | { level: "subcategory"; item?: ManageSubCategory; categoryId: number };

export function MenuBoard({ initial }: { initial: ManageCategory[] }) {
  const [categories, setCategories] = useState(initial);
  const [subId, setSubId] = useState<number | null>(initial[0]?.subcategories[0]?.id ?? null);
  const [dishId, setDishId] = useState<number | "new" | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0); // la fiche repart des données enregistrées après chaque sauvegarde

  const subcategory = useMemo(() => categories.flatMap((c) => c.subcategories).find((s) => s.id === subId) ?? null, [categories, subId]);
  const dish = typeof dishId === "number" ? (subcategory?.dishes.find((d) => d.id === dishId) ?? null) : null;
  const counts = useMemo(() => {
    const dishes = categories.flatMap((c) => c.subcategories).flatMap((s) => s.dishes);
    return { dishes: dishes.length, out: dishes.filter((d) => !d.is_available).length };
  }, [categories]);

  useEffect(() => {
    if (!message || message.error) return;
    const timer = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function reload() {
    const result = await menuCall<ManageCategory[]>("GET", "");
    if (result.ok) setCategories(result.data);
    else setMessage({ text: "La carte n’a pas pu être relue. Rechargez la page.", error: true });
  }

  async function run(action: Promise<{ ok: true } | { ok: false; message: string }>, done: string) {
    setBusy(true);
    const result = await action;
    if (result.ok) {
      await reload();
      setMessage({ text: done, error: false });
    } else {
      setMessage({ text: result.message, error: true });
    }
    setBusy(false);
    return result.ok;
  }

  function move(level: Level, ids: number[], index: number, step: -1 | 1) {
    const next = [...ids];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    run(menuCall("POST", "/reorder", { level, ids: next }), "Ordre enregistré.");
  }

  const toggle = (item: ManageDish, value: boolean) =>
    run(menuCall("PATCH", `/dishes/${item.id}`, { is_available: value }), value ? `${item.name} est de nouveau disponible.` : `${item.name} est en rupture.`);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3">
        <div>
          <RevealTitle text="Carte & menus" className="text-[32px]" />
          <p className="text-sm text-ticket-doux">
            {counts.dishes} {counts.dishes > 1 ? "plats" : "plat"} · {counts.out} en rupture
          </p>
        </div>
        <button type="button" onClick={() => setEditing({ level: "category" })} className="flex h-11 items-center gap-2 rounded-full bg-encre px-5 text-sm font-bold text-white">
          <Plus size={17} aria-hidden="true" />
          Nouvelle catégorie
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.p
            role={message.error ? "alert" : "status"}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${message.error ? "bg-rose text-retard" : "bg-pastille-ok text-texte-ok"}`}
          >
            {message.text}
            {message.error && (
              <button type="button" onClick={() => setMessage(null)} aria-label="Fermer le message" className="flex size-8 items-center justify-center rounded-full hover:bg-white/60">
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div variants={stagger} initial="hidden" animate="shown" className="flex flex-wrap items-start gap-[18px]">
        {/* Catégories et sous-catégories */}
        <Reveal as="section" className={`${CARD} flex min-w-[260px] flex-[1_1_280px] flex-col gap-4 xl:max-w-[340px]`}>
          <h2 className="text-xl">Catégories</h2>
          {categories.length === 0 && <p className="text-sm text-ticket-doux">La carte est vide. Commencez par créer une catégorie, par exemple « Plats africains ».</p>}
          {categories.map((category, index) => (
            <div key={category.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className={`min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wide ${category.is_active ? "text-ticket-doux" : "text-etape-inactive line-through"}`}>
                  {category.name}
                </span>
                {!category.is_active && <EyeOff size={15} className="shrink-0 text-etape-inactive" aria-label="Masquée" />}
                <button type="button" disabled={busy || index === 0} onClick={() => move("category", categories.map((c) => c.id), index, -1)} aria-label={`Monter ${category.name}`} className={ICON_BUTTON}>
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button type="button" disabled={busy || index === categories.length - 1} onClick={() => move("category", categories.map((c) => c.id), index, 1)} aria-label={`Descendre ${category.name}`} className={ICON_BUTTON}>
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setEditing({ level: "category", item: category })} aria-label={`Modifier ${category.name}`} className={ICON_BUTTON}>
                  <Pencil size={16} aria-hidden="true" />
                </button>
              </div>
              {category.subcategories.map((sub, at) => {
                const on = sub.id === subId;
                const ids = category.subcategories.map((s) => s.id);
                return (
                  <div key={sub.id} className="relative flex items-center">
                    {on && <motion.span layoutId="sous-categorie-active" className="absolute inset-0 rounded-xl bg-bordeaux" transition={{ type: "spring", stiffness: 420, damping: 36 }} aria-hidden="true" />}
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => (setSubId(sub.id), setDishId(null))}
                      className={`relative flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-3 text-left text-[15px] transition-colors ${on ? "font-bold text-white" : "hover:bg-creme"}`}
                    >
                      <span className={`min-w-0 flex-1 truncate ${sub.is_active ? "" : "line-through opacity-60"}`}>{sub.name}</span>
                      <span className={`shrink-0 text-xs ${on ? "text-texte-nav" : "text-ticket-doux"}`}>{sub.dishes.length}</span>
                    </button>
                    {on && (
                      <span className="relative flex shrink-0 text-white">
                        <button type="button" disabled={busy || at === 0} onClick={() => move("subcategory", ids, at, -1)} aria-label={`Monter ${sub.name}`} className="flex size-10 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30">
                          <ArrowUp size={15} aria-hidden="true" />
                        </button>
                        <button type="button" disabled={busy || at === ids.length - 1} onClick={() => move("subcategory", ids, at, 1)} aria-label={`Descendre ${sub.name}`} className="flex size-10 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30">
                          <ArrowDown size={15} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setEditing({ level: "subcategory", item: sub, categoryId: category.id })} aria-label={`Modifier ${sub.name}`} className="flex size-10 items-center justify-center rounded-full hover:bg-white/15">
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                      </span>
                    )}
                  </div>
                );
              })}
              <button type="button" onClick={() => setEditing({ level: "subcategory", categoryId: category.id })} className="flex min-h-11 items-center gap-1.5 px-3 text-sm font-bold text-bordeaux">
                <Plus size={15} aria-hidden="true" />
                Sous-catégorie
              </button>
            </div>
          ))}
        </Reveal>

        {/* Plats de la sous-catégorie */}
        <Reveal as="section" className={`${CARD} flex min-w-0 flex-[999_1_380px] flex-col gap-4`}>
          {subcategory ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl">{subcategory.name}</h2>
                  <p className="text-[13px] text-ticket-doux">
                    {subcategory.dishes.length} {subcategory.dishes.length > 1 ? "plats" : "plat"}
                    {!subcategory.is_active && " · sous-catégorie masquée du site"}
                  </p>
                </div>
                <button type="button" onClick={() => setDishId("new")} className="flex h-11 items-center gap-2 rounded-full bg-bordeaux px-5 text-sm font-bold text-white shadow-bouton">
                  <Plus size={17} aria-hidden="true" />
                  Nouveau plat
                </button>
              </div>
              {subcategory.dishes.length === 0 && <p className="py-6 text-center text-sm text-ticket-doux">Aucun plat dans cette sous-catégorie pour l’instant.</p>}
              <ul className="flex flex-col">
                {subcategory.dishes.map((item, index) => {
                  const ids = subcategory.dishes.map((d) => d.id);
                  const on = item.id === dishId;
                  return (
                    <motion.li layout key={item.id} transition={{ duration: 0.35, ease: EASE }} className={`flex items-center gap-2 border-t border-filet-ligne py-2 first:border-t-0 ${on ? "rounded-xl bg-ligne-active" : ""}`}>
                      <button type="button" onClick={() => setDishId(item.id)} aria-pressed={on} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-1.5 text-left">
                        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sable text-etape-inactive">
                          {item.photo ? <Image src={item.photo} alt="" fill sizes="56px" className={`object-cover ${item.is_available ? "" : "opacity-50 grayscale"}`} /> : <ImageOff size={20} aria-hidden="true" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className={`truncate font-bold ${item.is_available ? "" : "text-ticket-doux"}`}>{item.name}</span>
                            {item.is_featured && <Star size={14} className="shrink-0 fill-jaune text-a-encaisser" aria-label="Mis en avant" />}
                          </span>
                          <span className="flex flex-wrap items-center gap-x-2 text-[13px] text-ticket-doux">
                            <span className="font-bold tabular-nums text-encre">{formatPrice(item.price)}</span>
                            {(item.option_groups?.length ?? 0) > 0 && <span>· {item.option_groups!.length} {item.option_groups!.length > 1 ? "groupes d’options" : "groupe d’options"}</span>}
                            {!item.is_available && <span className="rounded-full bg-rose px-2 py-0.5 text-xs font-bold text-bordeaux">Rupture</span>}
                          </span>
                        </span>
                      </button>
                      <Switch checked={item.is_available ?? true} onChange={(value) => toggle(item, value)} label={`${item.name} disponible`} />
                      <span className="hidden sm:flex">
                        <button type="button" disabled={busy || index === 0} onClick={() => move("dish", ids, index, -1)} aria-label={`Monter ${item.name}`} className={ICON_BUTTON}>
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                        <button type="button" disabled={busy || index === ids.length - 1} onClick={() => move("dish", ids, index, 1)} aria-label={`Descendre ${item.name}`} className={ICON_BUTTON}>
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-ticket-doux">Choisissez ou créez une sous-catégorie pour voir ses plats.</p>
          )}
        </Reveal>

        {/* Fiche du plat */}
        <AnimatePresence mode="wait">
          {subcategory && dishId !== null && (dishId === "new" || dish) && (
            <motion.aside
              key={dishId}
              aria-label="Fiche du plat"
              initial={{ opacity: 0, x: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: EASE }}
              className={`${CARD} min-w-[290px] max-w-full flex-[1_1_360px] xl:max-w-[440px]`}
            >
              <DishEditor
                key={version}
                dish={dish}
                subcategoryId={subcategory.id}
                categories={categories}
                onClose={() => setDishId(null)}
                onSaved={async (saved) => {
                  await reload();
                  setSubId(saved.subcategory);
                  setDishId(saved.id);
                  setVersion((current) => current + 1);
                  setMessage({ text: `${saved.name} est enregistré.`, error: false });
                }}
                onDeleted={async () => {
                  setDishId(null);
                  await reload();
                  setMessage({ text: "Plat supprimé.", error: false });
                }}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </motion.div>

      {editing && (
        <NameDialog
          editing={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onDone={async (text, selectId) => {
            setEditing(null);
            await reload();
            if (selectId) setSubId(selectId);
            setMessage({ text, error: false });
          }}
        />
      )}
    </MotionConfig>
  );
}

type DialogProps = {
  editing: Editing;
  categories: ManageCategory[];
  onClose: () => void;
  onDone: (text: string, selectSubId?: number) => void;
};

/** Créer ou modifier une catégorie ou une sous-catégorie : nom, visibilité, et pour une sous-catégorie sa catégorie. */
function NameDialog({ editing, categories, onClose, onDone }: DialogProps) {
  const isCategory = editing.level === "category";
  const item = editing.item;
  const [name, setName] = useState(item?.name ?? "");
  const [active, setActive] = useState(item?.is_active ?? true);
  const [categoryId, setCategoryId] = useState(editing.level === "subcategory" ? editing.categoryId : 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const path = isCategory ? "/categories" : "/subcategories";
  const what = isCategory ? "catégorie" : "sous-catégorie";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && !pending && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Donnez un nom.");
    setPending(true);
    const body = { name: name.trim(), is_active: active, ...(isCategory ? {} : { category: categoryId }) };
    const result = item
      ? await menuCall<{ id: number }>("PATCH", `${path}/${item.id}`, body)
      : await menuCall<{ id: number }>("POST", path, body);
    setPending(false);
    if (!result.ok) return setError(result.message);
    onDone(`${name.trim()} est enregistré.`, isCategory ? undefined : result.data.id);
  }

  async function remove() {
    if (!item) return;
    setPending(true);
    const result = await menuCall<null>("DELETE", `${path}/${item.id}`);
    setPending(false);
    setConfirming(false);
    if (!result.ok) return setError(result.message);
    onDone(`${item.name} est supprimé.`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-encre/50 p-4" onClick={() => !pending && onClose()}>
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="carte-dialogue-titre"
        onSubmit={save}
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex max-h-[92dvh] w-full max-w-[440px] flex-col gap-4 overflow-y-auto rounded-[22px] bg-white p-6 shadow-fiche"
        noValidate
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="carte-dialogue-titre" className="text-[24px]">
            {item ? `Modifier la ${what}` : `Nouvelle ${what}`}
          </h2>
          <button type="button" onClick={onClose} disabled={pending} aria-label="Fermer" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-sable">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-bold">
          Nom
          <input className={FIELD} value={name} maxLength={120} autoFocus placeholder={isCategory ? "Plats africains" : "Sauces"} onChange={(event) => setName(event.target.value)} />
        </label>
        {!isCategory && (
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Catégorie
            <select className={FIELD} value={categoryId} onChange={(event) => setCategoryId(Number(event.target.value))}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-creme p-3.5 text-sm">
          <span>
            <span className="font-bold">Visible sur le site</span>
            <span className="block text-[13px] text-ticket-doux">Décochez pour masquer la {what} et ses plats sans rien supprimer.</span>
          </span>
          <Switch checked={active} onChange={setActive} label={`${what} visible sur le site`} />
        </div>
        {error && (
          <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="h-[52px] flex-1 rounded-full bg-bordeaux px-6 font-bold text-white shadow-bouton disabled:opacity-60">
            {pending ? "Enregistrement…" : item ? "Enregistrer" : "Créer"}
          </button>
          {item &&
            (confirming ? (
              <button type="button" onClick={remove} disabled={pending} className="h-[52px] rounded-full bg-retard px-5 font-bold text-white">
                Confirmer la suppression
              </button>
            ) : (
              <button type="button" onClick={() => setConfirming(true)} className="h-[52px] rounded-full border-[1.5px] border-bordure px-5 font-bold text-retard hover:bg-rose">
                Supprimer
              </button>
            ))}
        </div>
      </motion.form>
    </div>
  );
}
