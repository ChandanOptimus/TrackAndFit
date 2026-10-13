import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "tf_auth";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sign(value: string): Buffer {
  return createHmac("sha256", process.env.SITE_PIN ?? "").update(value).digest();
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/** True when the server has a PIN configured. Without one, everything stays locked. */
export function isPinConfigured(): boolean {
  return Boolean(process.env.SITE_PIN);
}

export function pinMatches(pin: string): boolean {
  if (!isPinConfigured()) return false;
  // Compare HMACs so both sides have equal length and comparison is constant-time.
  return safeEqual(sign(`pin:${pin}`), sign(`pin:${process.env.SITE_PIN}`));
}

/** Cookie value proving the PIN was entered. Changes automatically if SITE_PIN changes. */
export function authToken(): string {
  return sign("track-and-fit:session").toString("hex");
}

export function isValidToken(token: string | undefined): boolean {
  if (!token || !isPinConfigured()) return false;
  return safeEqual(Buffer.from(token), Buffer.from(authToken()));
}
