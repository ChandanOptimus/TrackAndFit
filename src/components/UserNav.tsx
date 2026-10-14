"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lock } from "@/app/actions";
import { useHeightVar } from "@/lib/use-height-var";
import type { User } from "@/lib/users";

const icon = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const ICONS = {
  dashboard: (
    <svg {...icon}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5h13V10" />
    </svg>
  ),
  weight: (
    <svg {...icon}>
      <rect x="3.5" y="4" width="17" height="16" rx="4" />
      <path d="M8 9.5a4 4 0 0 1 8 0" />
      <path d="m12 9.5 1.8-1.6" />
    </svg>
  ),
  food: (
    <svg {...icon}>
      <path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10" />
      <path d="M17.5 21V3c-2.2 1.2-3.5 3.7-3.5 7v2.5h3.5" />
    </svg>
  ),
  progress: (
    <svg {...icon}>
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  ),
  weekly: (
    <svg {...icon}>
      <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />
    </svg>
  ),
};

export function UserNav({ user }: { user: User }) {
  const pathname = usePathname();
  const navRef = useHeightVar("--nav-h");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const links = [
    { href: `/${user.id}/dashboard`, label: "Dashboard", tab: "Dashboard", icon: ICONS.dashboard },
    { href: `/${user.id}/weight`, label: "Log weight", tab: "Weight", icon: ICONS.weight },
    { href: `/${user.id}/food`, label: "Food", tab: "Food", icon: ICONS.food },
    { href: `/${user.id}/progress`, label: "Progress", tab: "Progress", icon: ICONS.progress },
    { href: `/${user.id}/weekly`, label: "Weekly report", tab: "Weekly", icon: ICONS.weekly },
  ];

  return (
    <>
      <header className="nav" ref={navRef}>
        <Link href="/" className="brand">
          Track And Fit
        </Link>
        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "active" : undefined}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="switch">
          {user.name}
          <span className="long"> · Switch user</span>
        </Link>
        <form action={lock}>
          <button type="submit" className="lock">Lock</button>
        </form>
      </header>

      <nav className="tabbar" aria-label="Main">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={isActive(l.href) ? "tab active" : "tab"}
            aria-current={isActive(l.href) ? "page" : undefined}
          >
            {l.icon}
            <span>{l.tab}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
