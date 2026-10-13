import type { Metadata } from "next";
import { UnlockForm } from "./UnlockForm";

export const metadata: Metadata = { title: "Enter PIN" };

export default function UnlockPage() {
  return (
    <main className="landing">
      <div className="logo" aria-hidden>T&amp;F</div>
      <h1>Track And Fit</h1>
      <p className="muted">Enter the PIN to continue.</p>
      <UnlockForm />
    </main>
  );
}
