"use client";

import { useActionState } from "react";
import { unlock, type UnlockState } from "../actions";

export function UnlockForm() {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlock, {});

  return (
    <form action={action} className="pin-form">
      <input
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="current-password"
        placeholder="PIN"
        aria-label="PIN"
        autoFocus
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "Checking…" : "Unlock"}
      </button>
      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
