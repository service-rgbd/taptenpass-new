# CHAP-CREDIT

Mobile app for purchasing internet packages in Côte d'Ivoire — users can buy forfaits from Orange, MTN, and Moov in 3 taps.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Local state: AsyncStorage (`@react-native-async-storage/async-storage`)

## Where things live

- `artifacts/mobile/` — Expo app (main product)
- `artifacts/mobile/app/(auth)/` — Login & Register screens
- `artifacts/mobile/app/(tabs)/` — Home, History, Buy (purchase flow), Profile tabs
- `artifacts/mobile/app/payment.tsx` — Payment modal screen
- `artifacts/mobile/context/AuthContext.tsx` — Auth state (AsyncStorage-backed)
- `artifacts/mobile/context/DataContext.tsx` — Transaction state
- `artifacts/mobile/constants/packages.ts` — Package & operator data
- `artifacts/mobile/types/index.ts` — TypeScript types
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

- Frontend-only MVP: All state stored in AsyncStorage, no backend needed for v1
- Auth is simulated (stored phone number match) — real JWT/Firebase auth is a future upgrade
- 3-step purchase flow inline in the Buy tab (no nested navigation complexity)
- Payment processing is a modal stack screen (not a tab) for focus and immersion
- Operator colors and packages are static constants (easily replaced with API calls)

## Product

CHAP-CREDIT lets users in Côte d'Ivoire:
1. Register/login with phone number
2. View their wallet balance on the home screen
3. Buy internet packages from Orange, MTN, or Moov in 3 steps
4. Pay via Wave, Orange Money, MTN Money, or card
5. View full transaction history with status filters
6. Manage their profile

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- AsyncStorage is async — always await calls, handle errors with try/catch
- Do NOT run `npx expo start` in shell — use `restart_workflow` tool instead
- App icon path: `assets/images/icon.png`
- Operator colors defined in `constants/packages.ts` as `OPERATOR_COLORS`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
