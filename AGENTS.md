# Repository Guidelines

## Project Structure & Module Organization
- Monorepo driven by pnpm workspaces. Key apps live under `apps/` (e.g., `apps/admin` for the Vben console) and reusable packages under `packages/`.
- Global configuration, lint rules, and scripts sit in the repo root (`eslint.config.mjs`, `stylelint.config.mjs`, `turbo.json`, `scripts/`).
- Front-end source follows Vben conventions: `src/router/routes/modules/*` for route modules, `src/views/**` for pages, `src/api/**` for request definitions, `src/store/modules/**` for Pinia stores, and `src/components/**` for shared UI.
- Tests rely on Vitest; snapshots and reports are emitted under each package’s `tests/` or `__tests__/` directories.

## Build, Test, and Development Commands
- `pnpm install`: bootstrap dependencies across all workspaces; run after cloning or pulling.
- `pnpm dev --filter apps/admin`: start the Admin console in dev mode (Vite + hot reload).
- `pnpm build --filter apps/admin`: produce a production bundle under `apps/admin/dist`.
- `pnpm test`: execute the shared Vitest suite via the workspace runner.

## Coding Style & Naming Conventions
- TypeScript + Vue 3 with `<script setup>` preferred; stick to Composition API.
- Indentation is two spaces; keep lines under 120 chars.
- Use PascalCase for Vue components (`StudentTable.vue`), camelCase for composables/hooks (`useUserStore`), and kebab-case for route names/URLs.
- Run formatters before committing: `pnpm lint` (ESLint), `pnpm stylelint`, and `pnpm format` if defined.

## Testing Guidelines
- Write unit and component tests in `*.spec.ts` or `*.test.ts` colocated with the feature (`src/views/.../__tests__/`).
- Mock HTTP modules via Vben’s request utilities; avoid real API calls.
- Ensure new UI modules include at least one Vitest/Testing Library spec covering core state or rendering paths.

## Commit & Pull Request Guidelines
- Follow conventional commits (`feat: add homework table`, `fix: correct login guard`). Keep scope concise and reference the affected area.
- Each PR should include: summary of changes, linked issue ID (if any), testing evidence (`pnpm test` logs or screenshots), and notes on breaking changes.
- Keep PRs focused; split unrelated work into separate branches. Request review only after CI (lint + test + build) passes locally.
