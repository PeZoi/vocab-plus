import type { Collection } from './collection.types';

export interface AdminUserListItem {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  xp: number;
  created_at: string | null;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_cards: number;
  public_collections_count: number;
}

export interface UserLearningStats {
  total_cards: number;
  mastered_cards: number;
  learning_cards: number;
  new_cards: number;
  total_reviews: number;
}

export interface AdminUserDetail {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  xp: number;
  created_at: string | null;
  timezone: string | null;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  freezes_available: number;
  stats: UserLearningStats;
  public_collections: Collection[];
}

export interface ResetStreakPayload {
  target_streak?: number;
  simulate_yesterday?: boolean;
}

export interface ResetStreakResponse {
  success: boolean;
  user_id: string;
  current_streak: number;
  last_active_date: string | null;
  message?: string;
}
