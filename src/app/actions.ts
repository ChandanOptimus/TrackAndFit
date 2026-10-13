"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, AUTH_MAX_AGE, authToken, isPinConfigured, pinMatches } from "@/lib/auth";

export interface UnlockState {
  error?: string;
}

export async function unlock(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  if (!isPinConfigured()) return { error: "SITE_PIN is not set on the server." };

  // Small delay makes guessing a short PIN slow.
  await new Promise((r) => setTimeout(r, 700));

  if (!pinMatches(String(formData.get("pin") ?? ""))) return { error: "Wrong PIN. Try again." };

  (await cookies()).set(AUTH_COOKIE, authToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });
  redirect("/");
}

export async function lock() {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/unlock");
}
