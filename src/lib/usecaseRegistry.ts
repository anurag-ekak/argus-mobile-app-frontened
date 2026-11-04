// src/lib/usecaseRegistry.ts
//
// Shared helpers for usecase pack resolution — mirror of the web app's
// src/lib/usecaseRegistry.ts. Core code resolves packs through the generated
// manifest (`src/usecases/index.ts`), never by importing a concrete module.
// This is what lets a new usecase pack ship on mobile without editing core.

import {getUsecaseModule, type UsecaseModule} from '../usecases';

/**
 * Fold a backend registry `code` to the frontend module slug.
 *
 * The backend keeps `loyalty_program` (underscore — RBAC depends on it), while
 * the frontend module folder is `loyalty-program` (hyphen). Lowercase +
 * `_` → `-` makes the two agree without touching the backend.
 */
export function normalizeUsecaseSlug(code: string): string {
  return code.trim().toLowerCase().replace(/_/g, '-');
}

/** Resolve a usecase module by its backend registry `code` (slug-normalized). */
export function getUsecaseModuleByCode(code: string): UsecaseModule | undefined {
  return getUsecaseModule(normalizeUsecaseSlug(code));
}
