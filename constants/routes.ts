/**
 * Định nghĩa tập trung các route trong hệ thống
 */
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    CALLBACK: '/auth/callback',
  },
  APP: {
    DASHBOARD: '/',
    REVIEW: '/review',
    VOCAB: '/vocab',
    VOCAB_DETAIL: (id: string) => `/vocab/${id}`,
    COLLECTIONS: '/collections',
    COLLECTION_DETAIL: (id: string) => `/collections/${id}`,
    ADD: '/add',
    IMPORT: '/import',
    LEADERBOARD: '/leaderboard',
    SETTINGS: '/settings',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    CARDS: '/admin/cards',
    AI_PROVIDERS: '/admin/ai-providers',
    TELEGRAM: '/admin/telegram',
  },
} as const;
