"use client";

import Link from "next/link";
import { useState } from "react";
import { useFoods } from "@/lib/food-store";
import type { Food } from "@/lib/nutrition";
import { Loading } from "./format";

interface Draft {
  id?: number;
  name: string;
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
  fibre: string;
  waterMl: string;
  units: { label: string; grams: string }[];
}

const EMPTY: Draft = { name: "", kcal: "", protein: "", fat: "", carbs: "", fibre: "", waterMl: "", units: [] };

const NUTRIENT_FIELDS: { key: "kcal" | "protein" | "fat" | "carbs" | "fibre" | "waterMl"; label: string }[] = [
  { key: "kcal", label: "Calories (kcal)" },
  { key: "protein", label: "Protein (g)" },
  { key: "fat", label: "Fat (g)" },
  { key: "carbs", label: "Carbs (g)" },
  { key: "fibre", label: "Fibre (g)" },
  { key: "waterMl", label: "Water (ml)" },
];

function toDraft(f: Food): Draft {
  return {
    id: f.id,
    name: f.name,
    kcal: String(f.kcal),
    protein: String(f.protein),
    fat: String(f.fat),
    carbs: String(f.carbs),
    fibre: String(f.fibre),
    waterMl: f.waterMl ? String(f.waterMl) : "",
    units: f.units.map((u) => ({ label: u.label, grams: String(u.grams) })),
  };
}

export function FoodLibraryView({ userId }: { userId: string }) {
  const { foods, loadError, saveFood, removeFood } = useFoods();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!foods) return <Loading error={loadError} />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await saveFood(
        {
          name: draft.name,
          kcal: Number(draft.kcal || 0),
          protein: Number(draft.protein || 0),
          fat: Number(draft.fat || 0),
          carbs: Number(draft.carbs || 0),
          fibre: Number(draft.fibre || 0),
          waterMl: Number(draft.waterMl || 0),
          units: draft.units.filter((u) => u.label.trim() || u.grams).map((u) => ({ label: u.label, grams: Number(u.grams) })),
        },
        draft.id,
      );
      setDraft(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the food.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(f: Food) {
    if (!window.confirm(`Delete "${f.name}"?`)) return;
    try {
      await removeFood(f.id);
      if (draft.id === f.id) setDraft(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete the food.");
    }
  }

  function edit(f: Food) {
    setDraft(toDraft(f));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <>
      <h1>Foods</h1>
      <p className="muted">
        Nutrition is entered <strong>per 100 g</strong> (or per 100 ml for liquids), like on a packet label. Add units such as
        &quot;chapati = 40 g&quot; to log by piece or spoon. Starter values are approximate, so edit them to match your food.{" "}
        <Link href={`/${userId}/food`}>← Back to Food</Link>
      </p>

      <h2>{draft.id ? "Edit food" : "Add a food"}</h2>
      <form className="panel" onSubmit={submit}>
        <label className="field">
          Name
          <input value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Besan chilla" required />
        </label>
        <div className="grid-fields">
          {NUTRIENT_FIELDS.map((f) => (
            <label key={f.key} className="field">
              {f.label}
              <input type="number" inputMode="decimal" step="any" min="0" value={draft[f.key]} onChange={(e) => set({ [f.key]: e.target.value })} required={f.key !== "waterMl"} />
            </label>
          ))}
        </div>
        <div className="label units-label">Units (optional)</div>
        {draft.units.map((u, i) => (
          <div key={i} className="unit-row">
            <input
              aria-label="Unit name"
              placeholder="Unit, e.g. chapati"
              value={u.label}
              onChange={(e) => set({ units: draft.units.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
            />
            <input
              aria-label="Grams per unit"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              placeholder="grams in one"
              value={u.grams}
              onChange={(e) => set({ units: draft.units.map((x, j) => (j === i ? { ...x, grams: e.target.value } : x)) })}
            />
            <button type="button" className="link" onClick={() => set({ units: draft.units.filter((_, j) => j !== i) })}>
              Remove
            </button>
          </div>
        ))}
        <div className="row">
          {draft.units.length < 8 && (
            <button type="button" className="secondary" onClick={() => set({ units: [...draft.units, { label: "", grams: "" }] })}>
              + Add unit
            </button>
          )}
          <button type="submit" disabled={saving}>{saving ? "Saving…" : draft.id ? "Save changes" : "Add food"}</button>
          {draft.id && (
            <button type="button" className="secondary" onClick={() => setDraft(EMPTY)}>
              Cancel
            </button>
          )}
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      <h2>All foods ({foods.length})</h2>
      <table className="library only-desktop">
        <thead>
          <tr>
            <th>Food (per 100 g)</th>
            <th>kcal</th>
            <th>Protein</th>
            <th>Fat</th>
            <th>Carbs</th>
            <th>Fibre</th>
            <th>Units</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {foods.map((f) => (
            <tr key={f.id}>
              <td>{f.name}</td>
              <td>{f.kcal}</td>
              <td>{f.protein}</td>
              <td>{f.fat}</td>
              <td>{f.carbs}</td>
              <td>{f.fibre}</td>
              <td className="muted small">{f.units.map((u) => `${u.label} = ${u.grams} g`).join(", ") || "–"}</td>
              <td className="actions nowrap">
                <button className="link edit" onClick={() => edit(f)}>
                  Edit
                </button>{" "}
                <button className="link" onClick={() => remove(f)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="list only-mobile">
        {foods.map((f) => (
          <li key={f.id}>
            <div className="list-main">
              <div className="list-title-row">
                <strong>{f.name}</strong>
                <span>{f.kcal} kcal</span>
              </div>
              <div className="muted small">
                per 100 g · P {f.protein} · F {f.fat} · C {f.carbs} · Fibre {f.fibre}
                {f.units.length > 0 && ` · ${f.units.map((u) => `${u.label} = ${u.grams} g`).join(", ")}`}
              </div>
            </div>
            <div className="list-actions">
              <button className="link edit" onClick={() => edit(f)}>
                Edit
              </button>
              <button className="link" onClick={() => remove(f)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
