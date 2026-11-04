// Argus design system — ported 1:1 from the web app's
// components/dashboard/tokens.ts (teal accent, off-white canvas, slate text).
export const colors = {
  // accent (teal — matches the web sidebar #0f6c6d)
  accent: '#0f6c6d',
  accentLight: '#0f6c6d14',
  accentMid: '#0f6c6d30',

  // backgrounds
  background: '#f7f8fa', // page canvas
  surface: '#ffffff', // cards / surfaces
  bgMuted: '#f1f3f6',

  // borders
  border: '#e4e8ef',
  borderFocus: '#c5cdd9',

  // text
  text: '#111827',
  muted: '#6b7280',
  faint: '#9ca3af',
  white: '#ffffff',

  // semantic
  success: '#10b981',
  successLight: '#10b98114',
  warning: '#f59e0b',
  warningLight: '#f59e0b14',
  danger: '#ef4444',
  dangerLight: '#ef444414',
  purple: '#8b5cf6',
  purpleLight: '#8b5cf614',
  blue: '#3b82f6',
  blueLight: '#3b82f614',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fontSize = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
} as const;
