/**
 * Central backend endpoint registry — paths only.
 * `apiFetch` prepends `API_URL` (src/config/env.ts).
 * Loyalty routes are filled in when the loyalty usecase feature lands.
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  OVERVIEW: {
    STATS: '/dashboard/overview/stats',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  LOYALTY: {
    KPIS: '/loyalty/kpis',
    MEMBERS: '/loyalty/members',
    MEMBER_DETAIL: (id: string) => `/loyalty/members/${id}`,
    MEMBER_VISITS: (id: string) => `/loyalty/members/${id}/visits`,
    MEMBER_STATS: (id: string) => `/loyalty/members/${id}/stats`,
    SEARCH: '/loyalty/members/search',
    ARRIVALS: '/loyalty/arrivals',
    CANDIDATES: '/loyalty/candidates',
    ONBOARDING: '/loyalty/onboarding',
    LOYALTY_NOTIFICATIONS: '/loyalty/notifications',
    WALKINS_LOG: '/loyalty/visits/log',
    REPEAT_LOG: '/loyalty/visits/repeat/log',
  },
} as const;
