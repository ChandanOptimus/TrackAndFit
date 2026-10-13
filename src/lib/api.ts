"use client";

/** fetch wrapper: sends you to the PIN page if locked, and throws the server's error message otherwise. */
export async function request(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status === 401) {
    window.location.href = "/unlock"; // PIN cookie expired or was cleared
    throw new Error("Locked");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res;
}

export function jsonInit(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
