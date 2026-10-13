"use client";

import { useCallback, useEffect, useState } from "react";
import { jsonInit, request } from "./api";

/** One user's height in cm (needed for BMI). `loaded` is false until the first response. */
export function useHeight(userId: string) {
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const url = `/api/profile/${userId}`;

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setHeightCm(null);
    request(url)
      .then((res) => res.json())
      .then((data: { heightCm: number | null }) => {
        if (cancelled) return;
        setHeightCm(data.heightCm);
        setLoaded(true);
      })
      .catch(() => !cancelled && setLoaded(true)); // BMI just stays hidden if this fails
    return () => {
      cancelled = true;
    };
  }, [url]);

  /** Throws with the server's message if the height is rejected. */
  const saveHeight = useCallback(
    async (cm: number) => {
      const res = await request(url, jsonInit("PUT", { heightCm: cm }));
      const data = (await res.json()) as { heightCm: number };
      setHeightCm(data.heightCm);
    },
    [url],
  );

  return { heightCm, loaded, saveHeight };
}
