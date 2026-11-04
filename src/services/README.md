# src/services — API clients (core layer)

Mirrors the web app's `src/services/`. Each file is a thin client over
`src/lib/api.ts` for one backend area (loyalty, notifications, …).

Rules:

- Core only — must never import a concrete usecase module
  (`src/usecases/<slug>/...`), enforced by `check-core-usecase-boundary.mjs`.
- Usecase-specific clients live inside their own pack folder.
