"use client";

import { useState } from "react";
import { useWeightEntries } from "@/lib/storage";
import { useHeightVar } from "@/lib/use-height-var";
import { todayISO } from "@/lib/weeks";
import { Loading, formatDate } from "./format";

const MIN_KG = 20;
const MAX_KG = 400;

export function WeightView({ userId }: { userId: string }) {
  const { entries, loadError, setWeight, removeWeight } = useWeightEntries(userId);
  const [date, setDate] = useState(todayISO);
  const [weight, setWeightInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const formRef = useHeightVar("--weight-form-h");

  if (!entries) return <Loading error={loadError} />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const kg = Number(weight);
    if (!date || date > todayISO()) return setError("Pick a date that is today or earlier.");
    if (!Number.isFinite(kg) || kg < MIN_KG || kg > MAX_KG)
      return setError(`Enter a weight between ${MIN_KG} and ${MAX_KG} kg.`);
    setError("");
    setSaving(true);
    try {
      await setWeight(date, Math.round(kg * 100) / 100);
      setWeightInput("");
    } catch {
      setError("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
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
        <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        {error && <p className="error" role="alert">{error}</p>}
      </form>
      </div>
      <p className="muted">Saving a date that already has an entry replaces it.</p>

      <h2>History</h2>
      {dates.length === 0 ? (
        <p className="muted">No entries yet.</p>
      ) : (
        <table className="weight-history">
          <thead>
            <tr>
              <th>Date</th>
              <th>Weight</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {dates.map((d) => (
              <tr key={d}>
                <td>{formatDate(d)}</td>
                <td>{entries[d].toFixed(1)} kg</td>
                <td className="actions">
                  <button className="link" onClick={() => remove(d)} aria-label={`Delete entry for ${formatDate(d)}`}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
