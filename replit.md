# Efootball Arena

Efootball Arena is a competitive Moroccan eFootball lobby for paid 1v1 challenges, tournaments, rankings, and wallet activity.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/efootball-arena run dev` — run the Efootball Arena web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/efootball-arena/src/App.tsx` — client-side routes, demo data, local persistence, and shared application shell
- `artifacts/efootball-arena/src/index.css` — dark competitive-lobby theme and responsive visual tokens
- `artifacts/efootball-arena/src/components/ui/` — reusable scaffold UI primitives
- `artifacts/api-server/` and `lib/api-*` — shared backend scaffold retained for future server-backed flows

## Architecture decisions

- The first rebuild is client-side so every screen is immediately usable in preview without requiring a database or external account connection.
- Browser localStorage holds demo auth, matches, tournaments, wallet activity, and settings so mutations survive refreshes.
- Wouter keeps the route surface lightweight while preserving the original URL structure, including match detail routes.

## Product

- Home page with live challenge preview and featured tournaments
- Open challenge browsing, filters, accepting matches, room codes, match chat, and result submission
- Tournament joining, leaderboard, profile/wallet flows, recharge and withdrawal requests
- Login, registration, language switching, RTL presentation, and admin controls

## User preferences

- Preserve the original project's layout, placement, copy, interactions, and visual appearance rather than redesigning it.

## Gotchas

- The web artifact workflow supplies `PORT` and `BASE_PATH`; run it through the managed workflow rather than a root-level dev command.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
