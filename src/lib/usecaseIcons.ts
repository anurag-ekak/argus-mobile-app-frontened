// src/lib/usecaseIcons.ts
// String→glyph resolver mirroring the web's lib/usecaseIcons.tsx. The usecase
// descriptor carries only icon name strings; the shell resolves them here with
// a fallback so new packs stay icon-consistent with zero core edits.

const ICON_MAP: Record<string, string> = {
  award: '⭐',
  users: '👥',
  footprints: '👣',
  'calendar-clock': '📅',
  grid: '🧩',
  home: '🏠',
};

export function resolveUsecaseIcon(name?: string | null): string {
  const key = (name ?? '').trim().toLowerCase();
  return ICON_MAP[key] ?? ICON_MAP.grid;
}
