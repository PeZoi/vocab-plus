import type { Card, UserCard } from './card.types';
import type { Tables } from './database.types';

export type ReviewLog = Tables<'review_logs'>;

export type ReviewRating = 1 | 2 | 3 | 4; // Thang điểm phản xạ FSRS nội bộ (1: Sai, 3: Đúng chuẩn, 4: Phản xạ nhanh)

export interface ReviewCardItem {
  card: Card;
  user_card: UserCard | null;
}

export interface SubmitReviewDto {
  card_id: string;
  rating: ReviewRating;
  response_ms?: number;
}

export interface StreakWeekDay {
  date: string; // YYYY-MM-DD
  day_label: string; // 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'
  full_label: string; // 'Thứ Hai', 'Thứ Ba'...
  day_number: number; // Ngày trong tháng (e.g. 15, 16, 17)
  is_today: boolean;
  is_past: boolean;
  is_future: boolean;
  is_active: boolean; // Đã ôn tập ngày này
}

export interface ActivityHistoryItem {
  date: string; // YYYY-MM-DD
  count: number; // Số lượt ôn tập
  xp: number; // XP kiếm được
  level: number; // 0, 1, 2, 3, 4 (cho màu sắc heatmap)
}

export interface ActivitySummary {
  total_reviews_year: number;
  total_active_days: number;
  current_streak: number;
  longest_streak: number;
}

export interface ReviewStats {
  learning_count: number;
  due_count: number;
  mastered_count: number;
  streak_days: number;
  longest_streak?: number;
  total_xp: number;
  today_xp?: number;
  daily_xp_cap?: number;
  league_min_threshold?: number;
  has_reviewed_today?: boolean;
  freezes_available?: number;
  week_days?: StreakWeekDay[];
  activity_history?: ActivityHistoryItem[];
  activity_summary?: ActivitySummary;
}

export interface ReviewForecastDay {
  date: string; // ISO date format YYYY-MM-DD
  day_label: string; // "Hôm nay", "T2", "T3"...
  count: number;
}

export interface CompleteReviewSessionDto {
  cards_reviewed: number;
  total_xp: number;
  is_preview_only?: boolean;
}

export interface CompleteReviewSessionResponse {
  success: boolean;
  actual_xp_awarded: number;
}

export type ReviewPhase = 'warmup' | 'preview' | 'quiz' | 'syncing' | 'completed';

export type QuizQuestionType = 'en_to_vi' | 'vi_to_en' | 'audio_to_en' | 'cloze';

export interface QuizOptionItem {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionItem {
  id: string;
  cardItem: ReviewCardItem;
  type: QuizQuestionType;
  questionText: string;
  contextSentence?: string;
  contextTranslation?: string;
  audioText?: string;
  options: QuizOptionItem[];
  isRanked: boolean; // Chỉ từ đến hạn mới tính thăng/hạ level
}

export interface LevelChangeResult {
  cardId: string;
  word: string;
  oldLevel: number;
  newLevel: number;
  direction: 'up' | 'down' | 'same';
}

export interface QuizSessionStats {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  xpEarned: number;
  levelUps: LevelChangeResult[];
  levelDowns: LevelChangeResult[];
  isRanked: boolean;
}

