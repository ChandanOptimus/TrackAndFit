"use client";

import { useCallback, useEffect, useState } from "react";
import { jsonInit, request } from "./api";
import type { FoodInput } from "./food-validation";
import type { CustomNutrition, Food, LogEntry, MealId } from "./nutrition";

const byName = (a: Food, b: Food) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

/** The shared food library. `foods` is null until loaded. Mutations throw with the server's message. */
export function useFoods() {
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    request("/api/foods")
      .then((res) => res.json())
      .then((data: { foods: Food[] }) => !cancelled && setFoods(data.foods))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const saveFood = useCallback(async (input: FoodInput, id?: number) => {
    const res = await request(id ? `/api/foods/${id}` : "/api/foods", jsonInit(id ? "PUT" : "POST", input));
    const { food } = (await res.json()) as { food: Food };
    setFoods((prev) => [...(prev ?? []).filter((f) => f.id !== food.id), food].sort(byName));
  }, []);

  const removeFood = useCallback(async (id: number) => {
    await request(`/api/foods/${id}`, { method: "DELETE" });
    setFoods((prev) => (prev ?? []).filter((f) => f.id !== id));
  }, []);

  return { foods, loadError, saveFood, removeFood };
}

export type EntryPayload =
  | { foodId: number; amount: number; unit: string; category: MealId | null }
  | { custom: CustomNutrition; category: MealId | null };

/** One user's food log for one day. `entries` is null until loaded. */
export function useFoodLog(userId: string, date: string) {
  const [entries, setEntries] = useState<LogEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const url = `/api/food-log/${userId}`;

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setLoadError(false);
    request(`${url}?date=${date}`)
      .then((res) => res.json())
      .then((data: { entries: LogEntry[] }) => !cancelled && setEntries(data.entries))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [url, date]);

  /** Adds an entry, or edits entry `id`. Throws with the server's message if it is rejected. */
  const saveEntry = useCallback(
    async (payload: EntryPayload, id?: number) => {
      const res = id
        ? await request(`${url}?id=${id}`, jsonInit("PUT", payload))
        : await request(url, jsonInit("POST", { date, ...payload }));
      const { entry } = (await res.json()) as { entry: LogEntry };
      setEntries((prev) =>
        id ? (prev ?? []).map((e) => (e.id === id ? entry : e)) : [...(prev ?? []), entry],
      );
    },
    [url, date],
  );

  const removeEntry = useCallback(
    async (id: number) => {
      await request(`${url}?id=${id}`, { method: "DELETE" });
      setEntries((prev) => (prev ?? []).filter((e) => e.id !== id));
    },
    [url],
  );

  return { entries, loadError, saveEntry, removeEntry };
}
