import type { Card, UserCard } from './card.types';
import type { Tables } from './database.types';

export type ReviewLog = Tables<'review_logs'>;

export type ReviewRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface ReviewCardItem {
  card: Card;
  user_card: UserCard | null;
}

export interface SubmitReviewDto {
  card_id: string;
  rating: ReviewRating;
  response_ms?: number;
}

export interface ReviewStats {
  learning_count: number;
  due_count: number;
  mastered_count: number;
  streak_days: number;
  total_xp: number;
}

export interface ReviewForecastDay {
  date: string; // ISO date format YYYY-MM-DD
  day_label: string; // "Hôm nay", "T2", "T3"...
  count: number;
}
