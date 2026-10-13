"use client";

import { useCallback, useEffect, useState } from "react";
import { request } from "./api";
import type { Entries } from "./weeks";

/** Weight entries for one user, stored in the database. `entries` is null until loaded. */
export function useWeightEntries(userId: string) {
  const [entries, setEntries] = useState<Entries | null>(null);
  const [loadError, setLoadError] = useState(false);
  const url = `/api/weights/${userId}`;

  useEffect(() => {
    setEntries(null); // switching user: don't show the previous person's data
  }, [url]);

  useEffect(() => {
    let cancelled = false;
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
