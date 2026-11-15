"use client";

// Fiche d'un plat dans « Carte & menus » : texte, prix, photo, disponibilité et groupes d'options.
// Le plat est enregistré en JSON, puis la photo est envoyée ou retirée à part (…/photo/).
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ManageCategory, ManageDish } from "@/lib/api/staff";
import { formatPrice } from "@/lib/format";
import { menuCall } from "./menu-api";

const BOX = "h-12 rounded-xl border border-bordure bg-white px-3.5 text-[15px]";
const FIELD = `${BOX} w-full`;
const LABEL = "flex flex-col gap-1.5 text-sm font-bold";
const MAX_PHOTO = 5 * 1024 * 1024;

type OptionDraft = { key: string; id?: number; name: string; price: string; available: boolean };
type GroupDraft = { key: string; id?: number; name: string; min: string; max: string; options: OptionDraft[] };

let counter = 0;
const newKey = () => `n${++counter}`;
const emptyOption = (): OptionDraft => ({ key: newKey(), name: "", price: "0", available: true });

function toDraft(dish: ManageDish | null) {
  return {
    name: dish?.name ?? "",
    description: dish?.description ?? "",
    price: dish ? String(dish.price) : "",
    prep: String(dish?.prep_minutes ?? 15),
    available: dish?.is_available ?? true,
    featured: dish?.is_featured ?? false,
    groups: (dish?.option_groups ?? []).map(
      (group): GroupDraft => ({
        key: newKey(),
        id: group.id,
        name: group.name,
        min: String(group.min_choices ?? 0),
        max: String(group.max_choices ?? 1),
        options: group.options.map((option) => ({
          key: newKey(),
          id: option.id,
          name: option.name,
          price: String(option.price_delta ?? 0),
          available: option.is_available ?? true,
        })),
      }),
    ),
  };
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-servie" : "bg-etape-inactive"}`}
    >
      <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-[left] ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

type Props = {
  dish: ManageDish | null; // null : nouveau plat
  subcategoryId: number;
  categories: ManageCategory[];
  onSaved: (dish: ManageDish) => void;
  onDeleted: () => void;
  onClose: () => void;
};

export function DishEditor({ dish, subcategoryId, categories, onSaved, onDeleted, onClose }: Props) {
  const [draft, setDraft] = useState(() => toDraft(dish));
  const [subcategory, setSubcategory] = useState(dish?.subcategory ?? subcategoryId);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const set = (patch: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...patch }));
  const setGroup = (key: string, patch: Partial<GroupDraft>) =>
    set({ groups: draft.groups.map((group) => (group.key === key ? { ...group, ...patch } : group)) });
  const setOption = (group: GroupDraft, key: string, patch: Partial<OptionDraft>) =>
    setGroup(group.key, { options: group.options.map((option) => (option.key === key ? { ...option, ...patch } : option)) });

  function pick(chosen: File | undefined) {
    if (!chosen) return;
    if (chosen.size > MAX_PHOTO) return setError("La photo ne doit pas dépasser 5 Mo.");
    setError(null);
    setFile(chosen);
    setRemovePhoto(false);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const price = Number(draft.price);
    if (!draft.name.trim()) return setError("Donnez un nom au plat.");
    if (!Number.isInteger(price) || price <= 0) return setError("Indiquez le prix en francs, sans décimales.");
    for (const group of draft.groups) {
      if (!group.name.trim()) return setError("Donnez un nom à chaque groupe d’options.");
      if (group.options.some((option) => !option.name.trim())) return setError(`Donnez un nom à chaque option de « ${group.name} ».`);
    }

    setPending(true);
    setError(null);
    const body = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price,
      prep_minutes: Number(draft.prep) || 0,
      subcategory,
      is_available: draft.available,
      is_featured: draft.featured,
      option_groups: draft.groups.map((group) => ({
        ...(group.id ? { id: group.id } : {}),
        name: group.name.trim(),
        min_choices: Number(group.min) || 0,
        max_choices: Number(group.max) || 1,
        options: group.options.map((option) => ({
          ...(option.id ? { id: option.id } : {}),
          name: option.name.trim(),
          price_delta: Number(option.price) || 0,
          is_available: option.available,
        })),
      })),
    };
    let result = dish
      ? await menuCall<ManageDish>("PATCH", `/dishes/${dish.id}`, body)
      : await menuCall<ManageDish>("POST", "/dishes", body);

    if (result.ok && file) {
      const form = new FormData();
      form.append("photo", file);
      const sent = await menuCall<ManageDish>("PUT", `/dishes/${result.data.id}/photo`, form);
      // Le plat est enregistré ; seule la photo a échoué.
      if (!sent.ok) {
        setPending(false);
        setError(`Plat enregistré, mais la photo n’a pas été envoyée : ${sent.message}`);
        return;
      }
      result = sent;
    } else if (result.ok && removePhoto && dish?.photo) {
      const removed = await menuCall<ManageDish>("DELETE", `/dishes/${dish.id}/photo`);
      if (removed.ok) result = removed;
    }
    setPending(false);
    if (!result.ok) return setError(result.message);
    onSaved(result.data);
  }

  async function remove() {
    if (!dish) return;
    setPending(true);
    const result = await menuCall<null>("DELETE", `/dishes/${dish.id}`);
    setPending(false);
    setConfirming(false);
    if (!result.ok) return setError(result.message);
    onDeleted();
  }

  const shown = preview ?? (removePhoto ? null : dish?.photo || null);

  return (
    <form onSubmit={save} className="flex min-w-0 flex-col gap-4" noValidate>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl">{dish ? "Modifier le plat" : "Nouveau plat"}</h2>
          {dish && <p className="text-[13px] text-ticket-doux">{formatPrice(dish.price)} sur la carte</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer la fiche" className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-sable">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Photo */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex size-[92px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sable text-ticket-doux">
          {shown ? (
            <Image src={shown} alt="" fill sizes="92px" className="object-cover" unoptimized={Boolean(preview)} />
          ) : (
            <ImagePlus size={26} aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(event) => pick(event.target.files?.[0])} />
          <button type="button" onClick={() => picker.current?.click()} className="h-11 rounded-full border-[1.5px] border-encre px-4 text-sm font-bold">
            {shown ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {shown && (
            <button type="button" onClick={() => (setFile(null), setRemovePhoto(true))} className="min-h-11 px-1 text-sm font-bold text-retard">
              Retirer la photo
            </button>
          )}
          <span className="text-xs text-ticket-doux">JPEG, PNG ou WebP, 5 Mo au plus.</span>
        </div>
      </div>

      <label className={LABEL}>
        Nom du plat
        <input className={FIELD} value={draft.name} maxLength={120} onChange={(event) => set({ name: event.target.value })} />
      </label>
      <label className={LABEL}>
        Description
        <textarea
          className="min-h-[84px] w-full rounded-xl border border-bordure bg-white px-3.5 py-2.5 text-[15px] font-normal"
          value={draft.description}
          onChange={(event) => set({ description: event.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={LABEL}>
          Prix (F CFA)
          <input className={FIELD} inputMode="numeric" value={draft.price} onChange={(event) => set({ price: event.target.value.replace(/\D/g, "") })} />
        </label>
        <label className={LABEL}>
          Préparation (min)
          <input className={FIELD} inputMode="numeric" value={draft.prep} onChange={(event) => set({ prep: event.target.value.replace(/\D/g, "") })} />
        </label>
      </div>
      <label className={LABEL}>
        Sous-catégorie
        <select className={FIELD} value={subcategory} onChange={(event) => setSubcategory(Number(event.target.value))}>
          {categories.map((category) => (
            <optgroup key={category.id} label={category.name}>
              {category.subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 rounded-2xl bg-creme p-3.5">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>
            <span className="font-bold">Disponible</span>
            <span className="block text-[13px] text-ticket-doux">Décochez en cas de rupture : le plat disparaît de la carte.</span>
          </span>
          <Switch checked={draft.available} onChange={(available) => set({ available })} label="Plat disponible" />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-bordure pt-2 text-sm">
          <span>
            <span className="font-bold">Mis en avant</span>
            <span className="block text-[13px] text-ticket-doux">Affiché sur la page d’accueil du site.</span>
          </span>
          <Switch checked={draft.featured} onChange={(featured) => set({ featured })} label="Plat mis en avant" />
        </div>
      </div>

      {/* Groupes d'options */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base">Options du plat</h3>
          <button
            type="button"
            onClick={() => set({ groups: [...draft.groups, { key: newKey(), name: "", min: "0", max: "1", options: [emptyOption()] }] })}
            className="flex h-11 items-center gap-1.5 rounded-full bg-sable px-3.5 text-sm font-bold"
          >
            <Plus size={16} aria-hidden="true" />
            Groupe
          </button>
        </div>
        {draft.groups.length === 0 && <p className="text-[13px] text-ticket-doux">Aucune option : le client commande le plat tel quel. Exemple de groupe : Accompagnement, Piment.</p>}
        {draft.groups.map((group) => (
          <fieldset key={group.key} className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-bordure p-3.5">
            <legend className="sr-only">Groupe d’options {group.name}</legend>
            <div className="flex items-end gap-2">
              <label className={`${LABEL} min-w-0 flex-1`}>
                Nom du groupe
                <input className={FIELD} value={group.name} maxLength={80} placeholder="Accompagnement" onChange={(event) => setGroup(group.key, { name: event.target.value })} />
              </label>
              <button
                type="button"
                onClick={() => set({ groups: draft.groups.filter((g) => g.key !== group.key) })}
                aria-label={`Supprimer le groupe ${group.name}`}
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-retard hover:bg-rose"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className={LABEL}>
                Choix minimum
                <input className={FIELD} inputMode="numeric" value={group.min} onChange={(event) => setGroup(group.key, { min: event.target.value.replace(/\D/g, "") })} />
              </label>
              <label className={LABEL}>
                Choix maximum
                <input className={FIELD} inputMode="numeric" value={group.max} onChange={(event) => setGroup(group.key, { max: event.target.value.replace(/\D/g, "") })} />
              </label>
            </div>
            <p className="text-xs text-ticket-doux">Minimum 0 : le client peut ne rien choisir. Minimum 1 : choix obligatoire.</p>
            <ul className="flex flex-col gap-2">
              {group.options.map((option) => (
                <li key={option.key} className="flex items-center gap-1.5">
                  <input
                    className={`${BOX} min-w-0 flex-1`}
                    value={option.name}
                    maxLength={80}
                    placeholder="Attiéké"
                    aria-label="Nom de l’option"
                    onChange={(event) => setOption(group, option.key, { name: event.target.value })}
                  />
                  <input
                    className={`${BOX} w-[76px] shrink-0 px-2 text-right`}
                    inputMode="numeric"
                    value={option.price}
                    aria-label={`Supplément pour ${option.name || "cette option"}, en francs`}
                    title="Supplément en francs"
                    onChange={(event) => setOption(group, option.key, { price: event.target.value.replace(/\D/g, "") })}
                  />
                  <Switch checked={option.available} onChange={(available) => setOption(group, option.key, { available })} label={`${option.name || "Option"} disponible`} />
                  <button
                    type="button"
                    onClick={() => setGroup(group.key, { options: group.options.filter((o) => o.key !== option.key) })}
                    disabled={group.options.length === 1}
                    aria-label={`Supprimer l’option ${option.name}`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl text-ticket-doux hover:bg-sable disabled:opacity-30"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setGroup(group.key, { options: [...group.options, emptyOption()] })} className="flex min-h-11 items-center gap-1.5 text-sm font-bold text-bordeaux">
                <Plus size={16} aria-hidden="true" />
                Ajouter une option
              </button>
              <span className="hidden text-xs text-ticket-doux sm:inline">Nom · supplément (F) · disponible</span>
            </div>
          </fieldset>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-bold text-retard">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="h-[52px] flex-1 rounded-full bg-bordeaux px-6 font-bold text-white shadow-bouton disabled:opacity-60">
          {pending ? "Enregistrement…" : dish ? "Enregistrer" : "Créer le plat"}
        </button>
        {dish &&
          (confirming ? (
            <button type="button" onClick={remove} disabled={pending} className="h-[52px] rounded-full bg-retard px-5 font-bold text-white">
              Confirmer la suppression
            </button>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} aria-label="Supprimer le plat" className="flex size-[52px] items-center justify-center rounded-full border-[1.5px] border-bordure text-retard hover:bg-rose">
              <Trash2 size={20} aria-hidden="true" />
            </button>
          ))}
      </div>
    </form>
  );
}
