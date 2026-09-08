/**
 * Query Key Factory Pattern cho TanStack Query v5
 * Quản lý cấu trúc cache phân cấp từ rộng đến hẹp
 */
export const cardKeys = {
  all: ['cards'] as const,
  lists: () => [...cardKeys.all, 'list'] as const,
  list: (filter?: Record<string, unknown>) => [...cardKeys.lists(), { filter }] as const,
  due: () => [...cardKeys.all, 'due'] as const,
  details: () => [...cardKeys.all, 'detail'] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
};

export const reviewKeys = {
  all: ['review'] as const,
  stats: () => [...reviewKeys.all, 'stats'] as const,
  forecast: (days: number = 7) => [...reviewKeys.all, 'forecast', days] as const,
  history: (range?: string) => [...reviewKeys.all, 'history', range] as const,
};

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export const aiKeys = {
  all: ['ai'] as const,
  providers: () => [...aiKeys.all, 'providers'] as const,
  activeProvider: () => [...aiKeys.providers(), 'active'] as const,
};

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filter?: Record<string, unknown>) => [...collectionKeys.lists(), { filter }] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
};

export const importKeys = {
  all: ['imported-texts'] as const,
  lists: () => [...importKeys.all, 'list'] as const,
  details: () => [...importKeys.all, 'detail'] as const,
  detail: (id: string) => [...importKeys.details(), id] as const,
  extract: (textHash: string) => [...importKeys.all, 'extract', textHash] as const,
};

export const imageKeys = {
  all: ['images'] as const,
  search: (query: string) => [...imageKeys.all, 'search', query] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
};


