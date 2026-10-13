"use client";

import { useState } from "react";
import {
  MAX_BODY_FAT,
  MAX_HEIGHT_CM,
  MIN_BODY_FAT,
  MIN_HEIGHT_CM,
  bmiLevel,
  bmiOf,
  bodyFatLevel,
} from "@/lib/health";
import { planFor } from "@/lib/plan";
import { useHeight } from "@/lib/profile-store";
import { useWeightEntries } from "@/lib/storage";
import { useHeightVar } from "@/lib/use-height-var";
import { todayISO } from "@/lib/weeks";
import { LevelPill, Loading, formatDateShort } from "./format";

const MIN_KG = 20;
const MAX_KG = 400;

export function WeightView({ userId }: { userId: string }) {
  const { entries, bodyFat, loadError, setWeight, removeWeight } = useWeightEntries(userId);
  const { heightCm, loaded: heightLoaded, saveHeight } = useHeight(userId);
  const [date, setDate] = useState(todayISO);
  const [weight, setWeightInput] = useState("");
  const [fat, setFatInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [error, setError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [saving, setSaving] = useState(false);
  const formRef = useHeightVar("--weight-form-h");

  if (!entries) return <Loading error={loadError} />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const kg = Number(weight);
    const fatNum = fat === "" ? null : Number(fat);
    if (!date || date > todayISO()) return setError("Pick a date that is today or earlier.");
    if (!Number.isFinite(kg) || kg < MIN_KG || kg > MAX_KG)
      return setError(`Enter a weight between ${MIN_KG} and ${MAX_KG} kg.`);
    if (fatNum !== null && (!Number.isFinite(fatNum) || fatNum < MIN_BODY_FAT || fatNum > MAX_BODY_FAT))
      return setError(`Body fat must be between ${MIN_BODY_FAT} and ${MAX_BODY_FAT}%, or left empty.`);
    setError("");
    setSaving(true);
    try {
      await setWeight(date, Math.round(kg * 100) / 100, fatNum === null ? null : Math.round(fatNum * 10) / 10);
      setWeightInput("");
      setFatInput("");
    } catch {
      setError("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function submitHeight(e: React.FormEvent) {
    e.preventDefault();
    const cm = Number(heightInput);
    if (!Number.isFinite(cm) || cm < MIN_HEIGHT_CM || cm > MAX_HEIGHT_CM)
      return setHeightError(`Enter a height between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.`);
    setHeightError("");
    try {
      await saveHeight(cm);
      setHeightInput("");
    } catch (err) {
      setHeightError(err instanceof Error ? err.message : "Couldn't save the height.");
    }
  }

  async function remove(d: string) {
    try {
      await removeWeight(d);
    } catch {
      setError("Couldn't delete. Please try again.");
    }
  }

  const dates = Object.keys(entries).sort().reverse();

  return (
    <>
      <h1>Log weight</h1>
      <div className="sticky-block" ref={formRef}>
        <form className="panel form weight-form" onSubmit={submit}>
          <label>
            Date
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={MIN_KG}
              max={MAX_KG}
              value={weight}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="e.g. 78.4"
              required
            />
          </label>
          <label className="bf-field">
            Body fat (%)
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={MIN_BODY_FAT}
              max={MAX_BODY_FAT}
              value={fat}
              onChange={(e) => setFatInput(e.target.value)}
              placeholder="optional"
            />
          </label>
          <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      </div>
      <p className="muted">Saving a date that already has an entry replaces it, including its body fat.</p>

      <form className="panel height-panel" onSubmit={submitHeight}>
        <label>
          Height (cm)
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min={MIN_HEIGHT_CM}
            max={MAX_HEIGHT_CM}
            value={heightInput}
            onChange={(e) => setHeightInput(e.target.value)}
            placeholder={heightCm ? String(heightCm) : "e.g. 170"}
          />
        </label>
        <button type="submit" className="secondary">{heightCm ? "Update height" : "Save height"}</button>
        <p className="muted small hint">
          {!heightLoaded
            ? "Loading…"
            : heightCm
              ? `Your height is ${heightCm} cm. It's used to work out BMI.`
              : "Add your height once to see BMI next to each weight."}
        </p>
        {heightError && <p className="error full" role="alert">{heightError}</p>}
      </form>

      <h2>History</h2>
      {dates.length === 0 ? (
        <p className="muted">No entries yet.</p>
      ) : (
        <table className="weight-history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th>BMI</th>
              <th>Body fat</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {dates.map((d) => {
              const bmi = heightCm ? bmiOf(entries[d], heightCm) : null;
              const fatValue = bodyFat[d];
              return (
                <tr key={d}>
                  <td>{formatDateShort(d)}</td>
                  <td className="metric-cell">{entries[d].toFixed(1)} kg</td>
                  <td className="metric-cell">
                    {bmi === null ? <span className="muted">–</span> : (
                      <>
                        {bmi.toFixed(1)}
                        <LevelPill level={bmiLevel(bmi)} />
                      </>
                    )}
                  </td>
                  <td className="metric-cell">
                    {fatValue === undefined ? <span className="muted">–</span> : (
                      <>
                        {fatValue.toFixed(1)}%
                        <LevelPill level={bodyFatLevel(fatValue, planFor(userId).bodyFatLimits)} />
                      </>
                    )}
                  </td>
                  <td className="actions">
                    <button className="link" onClick={() => remove(d)} aria-label={`Delete entry for ${formatDateShort(d)}`}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
