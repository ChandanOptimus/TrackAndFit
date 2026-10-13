"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useFoodLog, useFoods, type EntryPayload } from "@/lib/food-store";
import {
  GRAMS,
  MEALS,
  OTHERS_LABEL,
  describeAmount,
  entryNutrients,
  gramsFor,
  groupByMeal,
  nutrientsFor,
  totalsFor,
  type Food,
  type LogEntry,
  type MealId,
} from "@/lib/nutrition";
import { computePlan } from "@/lib/plan";
import { useHeight } from "@/lib/profile-store";
import { useWeightEntries } from "@/lib/storage";
import { useHeightVar } from "@/lib/use-height-var";
import { todayISO } from "@/lib/weeks";
import { Loading } from "./format";
import { IntakeSummary } from "./IntakeSummary";

const fmt = (n: number, d = 0) => n.toFixed(d);

function defaultUnit(food: Food | undefined): string {
  return food?.units[0]?.label ?? GRAMS;
}

function entryName(e: LogEntry, byId: Map<number, Food>): string {
  if (e.custom) return e.custom.name;
  return (e.foodId !== null && byId.get(e.foodId)?.name) || "Deleted food";
}

/** A sensible starting meal for the time of day. After that the last choice is kept. */
function mealForTime(now = new Date()): MealId {
  const h = now.getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 19) return "snacks";
  return "dinner";
}

const EMPTY_OTHER = { name: "", kcal: "", protein: "", fat: "", carbs: "", fibre: "" };
const OTHER_FIELDS = [
  { key: "kcal", label: "Calories (kcal)" },
  { key: "protein", label: "Protein (g)" },
  { key: "fat", label: "Fat (g)" },
  { key: "carbs", label: "Carbs (g)" },
  { key: "fibre", label: "Fibre (g)" },
] as const;

export function FoodView({ userId }: { userId: string }) {
  const [date, setDate] = useState(todayISO);
  const { entries: weights, bodyFat } = useWeightEntries(userId);
  const { heightCm, loaded: heightLoaded } = useHeight(userId);
  const { foods, loadError: foodsError } = useFoods();
  const { entries, loadError, saveEntry, removeEntry } = useFoodLog(userId, date);

  const [foodText, setFoodText] = useState("");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState(GRAMS);
  const [category, setCategory] = useState<MealId>(() => mealForTime());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [other, setOther] = useState(EMPTY_OTHER);
  const foodInput = useRef<HTMLInputElement>(null);
  const summaryRef = useHeightVar("--food-summary-h");
  const formRef = useHeightVar("--food-form-h");

  if (!foods || !entries || !heightLoaded) return <Loading error={foodsError || loadError} />;

  const latestDate = weights ? Object.keys(weights).sort().pop() : undefined;
  const targets =
    weights && latestDate
      ? computePlan(userId, weights[latestDate], { heightCm, bodyFat, asOf: todayISO() }).targets
      : null;

  const isOther = foodText.trim().toLowerCase() === OTHERS_LABEL.toLowerCase();
  const selected = foods.find((f) => f.name.toLowerCase() === foodText.trim().toLowerCase());
  const amountNum = Number(amount);
  const previewGrams = selected && amountNum > 0 ? gramsFor(selected, amountNum, unit) : null;
  const preview = selected && previewGrams !== null ? nutrientsFor(selected, previewGrams) : null;
  const byId = new Map(foods.map((f) => [f.id, f]));

  function resetForm() {
    setEditingId(null);
    setFoodText("");
    setAmount("1");
    setUnit(GRAMS);
    setOther(EMPTY_OTHER);
    setError("");
  }

  function chooseFood(text: string) {
    setFoodText(text);
    const food = foods?.find((f) => f.name.toLowerCase() === text.trim().toLowerCase());
    if (food) {
      const u = defaultUnit(food);
      setUnit(u);
      setAmount(u === GRAMS ? "" : "1");
    }
  }

  /** Loads an entry into the form so it can be changed. */
  function startEdit(e: LogEntry) {
    setError("");
    setEditingId(e.id);
    if (e.category) setCategory(e.category);
    if (e.custom) {
      setFoodText(OTHERS_LABEL);
      setOther({
        name: e.custom.name,
        kcal: String(e.custom.kcal),
        protein: String(e.custom.protein),
        fat: String(e.custom.fat),
        carbs: String(e.custom.carbs),
        fibre: String(e.custom.fibre),
      });
    } else {
      setFoodText((e.foodId !== null && byId.get(e.foodId)?.name) || "");
      setAmount(String(e.amount));
      setUnit(e.unit);
    }
    foodInput.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    foodInput.current?.focus({ preventScroll: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let payload: EntryPayload;
    if (isOther) {
      const numbers = OTHER_FIELDS.map((f) => (other[f.key] === "" ? 0 : Number(other[f.key])));
      if (numbers.some((n) => !Number.isFinite(n) || n < 0)) return setError("Values can't be negative.");
      if (numbers.every((n) => n === 0)) return setError("Enter at least one value, such as calories.");
      payload = {
        custom: {
          name: other.name.trim() || "Other",
          kcal: numbers[0],
          protein: numbers[1],
          fat: numbers[2],
          carbs: numbers[3],
          fibre: numbers[4],
        },
        category,
      };
    } else {
      if (!selected) return setError("Pick a food from the list, or add it on the Foods page.");
      if (!(amountNum > 0)) return setError("Enter an amount greater than 0.");
      payload = { foodId: selected.id, amount: amountNum, unit, category };
    }

    setError("");
    setSaving(true);
    try {
      await saveEntry(payload, editingId ?? undefined);
      const wasEditing = editingId !== null;
      resetForm();
      if (!wasEditing) foodInput.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      await removeEntry(id);
      if (editingId === id) resetForm();
    } catch {
      setError("Couldn't delete. Please try again.");
    }
  }

  function changeDate(value: string) {
    if (!value) return;
    if (editingId !== null) resetForm(); // the entry being edited belongs to the previous day
    setDate(value);
  }

  const totals = totalsFor(entries, foods);
  const groups = groupByMeal(entries).map((g) => ({
    ...g,
    kcal: g.entries.reduce((sum, e) => sum + (entryNutrients(e, byId)?.kcal ?? 0), 0),
  }));
  const editing = editingId !== null;

  return (
    <>
      <div className="row between">
        <h1>Food</h1>
        <label className="inline-label">
          Day
          <input type="date" value={date} max={todayISO()} onChange={(e) => changeDate(e.target.value)} />
        </label>
      </div>

      <div className="sticky-block" ref={summaryRef}>
        <IntakeSummary totals={totals} targets={targets} compact />
      </div>
      <p className="muted small">
        {targets
          ? "Targets come from your latest weight and calorie plan (see the Dashboard)."
          : "Log your weight to see targets alongside what you ate."}{" "}
        Carbs are compared in kcal because that is how the carbs target is calculated.
      </p>

      <h2>{editing ? "Edit entry" : "Add food"}</h2>
      <form className="panel form food-form sticky-form" onSubmit={submit} ref={formRef}>
        {editing && (
          <p className="edit-banner full">
            Editing an entry.{" "}
            <button type="button" className="link" onClick={resetForm}>
              Cancel
            </button>
          </p>
        )}
        <label className="grow food-field">
          Food
          <input
            ref={foodInput}
            list="food-options"
            value={foodText}
            onChange={(e) => chooseFood(e.target.value)}
            placeholder="Start typing, e.g. chapati"
            autoComplete="off"
            required
          />
          <datalist id="food-options">
            <option value={OTHERS_LABEL} />
            {foods.map((f) => (
              <option key={f.id} value={f.name} />
            ))}
          </datalist>
        </label>
        <label className="meal-field">
          Meal
          <select value={category} onChange={(e) => setCategory(e.target.value as MealId)}>
            {MEALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        {isOther ? (
          <>
            <div className="other-fields">
              <label className="other-name">
                What did you eat? (optional)
                <input value={other.name} maxLength={80} onChange={(e) => setOther({ ...other, name: e.target.value })} placeholder="e.g. Restaurant biryani" />
              </label>
              {OTHER_FIELDS.map((f) => (
                <label key={f.key}>
                  {f.label}
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    value={other[f.key]}
                    onChange={(e) => setOther({ ...other, [f.key]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add"}</button>
            <p className="muted small full">Enter the totals for everything you ate, not per 100 g. Leave a field empty if it&apos;s zero.</p>
          </>
        ) : (
          <>
            <label>
              Amount
              <input type="number" inputMode="decimal" step="any" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>
            <label>
              Unit
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value={GRAMS}>g (or ml)</option>
                {selected?.units.map((u) => (
                  <option key={u.label} value={u.label}>
                    {u.label} ({u.grams} g)
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add"}</button>
            {preview && selected && (
              <p className="muted small full">
                {describeAmount(amountNum, unit)} of {selected.name} ≈ {fmt(preview.kcal)} kcal · protein {fmt(preview.protein, 1)} g · fat{" "}
                {fmt(preview.fat, 1)} g · carbs {fmt(preview.carbs, 1)} g · fibre {fmt(preview.fibre, 1)} g
                {preview.waterMl > 0 && ` · water ${fmt(preview.waterMl)} ml`}
              </p>
            )}
          </>
        )}
        {error && <p className="error" role="alert">{error}</p>}
      </form>
      <p className="muted small">
        Log each ingredient on its own line: for 40 g raw chole cooked in 1 tsp oil, add the chole (40 g) and the oil (1 tsp).{" "}
        <Link href={`/${userId}/food/library`}>Manage foods →</Link>
      </p>

      <h2>Eaten on this day</h2>
      {entries.length === 0 ? (
        <p className="muted">Nothing logged yet.</p>
      ) : (
        <>
          <table className="food-log only-desktop">
            <thead>
              <tr>
                <th>Food</th>
                <th>Amount</th>
                <th>kcal</th>
                <th>Protein</th>
                <th>Fat</th>
                <th>Carbs</th>
                <th>Fibre</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => [
                <tr key={`g-${g.id ?? "none"}`} className="group-row">
                  <td colSpan={8}>
                    {g.label} <span className="group-kcal">· {fmt(g.kcal)} kcal</span>
                  </td>
                </tr>,
                ...g.entries.map((e) => {
                  const n = entryNutrients(e, byId);
                  const name = entryName(e, byId);
                  return (
                    <tr key={e.id} className={e.id === editingId ? "editing" : undefined}>
                      <td>{name}</td>
                      <td>
                        {e.custom ? (
                          <span className="muted small">Manual entry</span>
                        ) : (
                          <>
                            {describeAmount(e.amount, e.unit)}
                            {e.unit !== GRAMS && <span className="muted small"> ({fmt(e.grams, 0)} g)</span>}
                          </>
                        )}
                      </td>
                      <td>{n ? fmt(n.kcal) : "–"}</td>
                      <td>{n ? fmt(n.protein, 1) : "–"}</td>
                      <td>{n ? fmt(n.fat, 1) : "–"}</td>
                      <td>{n ? fmt(n.carbs, 1) : "–"}</td>
                      <td>{n ? fmt(n.fibre, 1) : "–"}</td>
                      <td className="actions nowrap">
                        <button className="link edit" onClick={() => startEdit(e)} aria-label={`Edit ${name}`}>
                          Edit
                        </button>{" "}
                        <button className="link" onClick={() => remove(e.id)} aria-label={`Delete ${name}`}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                }),
              ])}
            </tbody>
          </table>

          <ul className="list only-mobile">
            {groups.map((g) => [
              <li key={`g-${g.id ?? "none"}`} className="group-header">
                <span>{g.label}</span>
                <span>{fmt(g.kcal)} kcal</span>
              </li>,
              ...g.entries.map((e) => {
                const n = entryNutrients(e, byId);
                const name = entryName(e, byId);
                return (
                  <li key={e.id} className={e.id === editingId ? "editing" : undefined}>
                    <div className="list-main">
                      <div className="list-title-row">
                        <strong>{name}</strong>
                        <span>{n ? `${fmt(n.kcal)} kcal` : "–"}</span>
                      </div>
                      <div className="muted small">
                        {e.custom ? "Manual entry" : describeAmount(e.amount, e.unit)}
                        {!e.custom && e.unit !== GRAMS && ` (${fmt(e.grams, 0)} g)`}
                        {n && ` · P ${fmt(n.protein, 1)} · F ${fmt(n.fat, 1)} · C ${fmt(n.carbs, 1)} · Fibre ${fmt(n.fibre, 1)}`}
                      </div>
                    </div>
                    <div className="list-actions">
                      <button className="link edit" onClick={() => startEdit(e)} aria-label={`Edit ${name}`}>
                        Edit
                      </button>
                      <button className="link" onClick={() => remove(e.id)} aria-label={`Delete ${name}`}>
                        Delete
                      </button>
                    </div>
                  </li>
                );
              }),
            ])}
          </ul>
        </>
      )}
    </>
  );
}
