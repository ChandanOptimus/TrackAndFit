"use client";

import { useCallback, useEffect, useState } from "react";
import { jsonInit, request } from "./api";
import type { FoodInput } from "./food-validation";
import type { CustomNutrition, Food, LogEntry } from "./nutrition";

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

  const addEntry = useCallback(
    async (foodId: number, amount: number, unit: string) => {
      const res = await request(url, jsonInit("POST", { date, foodId, amount, unit }));
      const { entry } = (await res.json()) as { entry: LogEntry };
      setEntries((prev) => [...(prev ?? []), entry]);
    },
    [url, date],
  );

  const addCustomEntry = useCallback(
    async (custom: CustomNutrition) => {
      const res = await request(url, jsonInit("POST", { date, custom }));
      const { entry } = (await res.json()) as { entry: LogEntry };
      setEntries((prev) => [...(prev ?? []), entry]);
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

  return { entries, loadError, addEntry, addCustomEntry, removeEntry };
}
