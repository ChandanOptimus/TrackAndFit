import Link from "next/link";
import { USERS } from "@/lib/users";

export default function Landing() {
  return (
    <main className="landing">
      <div className="logo" aria-hidden>T&amp;F</div>
      <h1>Track And Fit</h1>
      <p className="muted">Log your weight daily. Get weekly averages, grades and targets.</p>
      <h2 className="landing-prompt">Who&apos;s training?</h2>
      <div className="user-grid">
        {USERS.map((u) => (
          <Link
            key={u.id}
            href={`/${u.id}/dashboard`}
            className="user-card"
            style={{ "--user": u.accent, "--user-soft": u.accentSoft } as React.CSSProperties}
          >
            <span className="avatar">{u.name[0]}</span>
            <span>{u.name}</span>
            <span className="user-cta">Open dashboard →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
