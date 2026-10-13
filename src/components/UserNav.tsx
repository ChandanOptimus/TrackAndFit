"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lock } from "@/app/actions";
import type { User } from "@/lib/users";

export function UserNav({ user }: { user: User }) {
  const pathname = usePathname();
  const links = [
    { href: `/${user.id}/dashboard`, label: "Dashboard" },
    { href: `/${user.id}/weight`, label: "Log weight" },
    { href: `/${user.id}/weekly`, label: "Weekly report" },
  ];

  return (
    <header className="nav">
      <Link href="/" className="brand">
        Track And Fit
      </Link>
      <nav>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : undefined}
            aria-current={pathname === l.href ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="switch">
        {user.name} · Switch user
      </Link>
      <form action={lock}>
        <button type="submit" className="lock">Lock</button>
      </form>
    </header>
  );
}
