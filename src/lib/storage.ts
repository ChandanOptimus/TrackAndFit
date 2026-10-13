"use client";

import { useCallback, useEffect, useState } from "react";
import type { Entries } from "./weeks";

async function request(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status === 401) {
    window.location.href = "/unlock"; // PIN cookie expired or was cleared
    throw new Error("Locked");
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res;
}

/** Weight entries for one user, stored in the database. `entries` is null until loaded. */
export function useWeightEntries(userId: string) {
  const [entries, setEntries] = useState<Entries | null>(null);
  const [loadError, setLoadError] = useState(false);
  const url = `/api/weights/${userId}`;

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setLoadError(false);
    request(url)
      .then((res) => res.json())
      .then((data: { entries: Entries }) => !cancelled && setEntries(data.entries))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [url]);

  /** Both throw if the server rejects the change, so callers can show an error. */
  const setWeight = useCallback(
    async (date: string, kg: number) => {
      await request(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, kg }),
      });
      setEntries((prev) => ({ ...(prev ?? {}), [date]: kg }));
    },
    [url],
  );

  const removeWeight = useCallback(
    async (date: string) => {
      await request(`${url}?date=${date}`, { method: "DELETE" });
      setEntries((prev) => {
        const next = { ...(prev ?? {}) };
        delete next[date];
        return next;
      });
    },
    [url],
  );

  return { entries, loadError, setWeight, removeWeight };
}
