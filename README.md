# Track And Fit

Next.js (App Router) + React + TypeScript fitness tracker for two users (Chandan, Ankita).

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # formula / weekly-average / grading tests
npm run build
```

## Setup

Data is stored in Neon Postgres and the whole site is protected by one PIN. Two environment variables are required:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string. The `weights` table is created automatically on first use. |
| `SITE_PIN` | PIN to open the site (use 6+ digits). Changing it logs everyone out. |

Locally, copy `.env.example` to `.env.local` and fill both in.

## Deploy to Vercel

1. Push the repo to GitHub and import it at vercel.com/new.
2. In the project, open **Storage** (or the Marketplace) and add **Neon**. This sets `DATABASE_URL` automatically.
3. Under **Settings → Environment Variables**, add `SITE_PIN`.
4. Redeploy.

## Where things live

- `src/lib/formulas.ts` – the six formulas
- `src/lib/weeks.ts` – weekly averages, week-to-week change, grading bands
- `src/lib/db.ts`, `src/app/api/weights/[user]/route.ts` – Neon database access
- `src/lib/storage.ts` – client hook that talks to the API
- `src/proxy.ts`, `src/lib/auth.ts`, `src/app/actions.ts` – PIN protection
- `src/lib/users.ts` – the user list
- Pages: `/`, `/[user]/dashboard`, `/[user]/weight`, `/[user]/weekly`
