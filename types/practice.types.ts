import type { Card, CardWithProgress } from './card.types';
import type { WordLevelInfo } from '@/utils/fsrs-level';

export type PracticeExerciseType = 'multiple_choice' | 'cloze' | 'sentence_writing';
export type PracticeSourceType = 'all' | 'collection';
export type PracticeMode = 'mixed' | PracticeExerciseType;

export interface LevelUpItem {
  card: CardWithProgress;
  oldLevel: WordLevelInfo;
  newLevel: WordLevelInfo;
}

export interface WateredCardItem {
  card: CardWithProgress;
  oldLevel: WordLevelInfo;
  newLevel: WordLevelInfo;
  isLevelUp: boolean;
}

export interface PracticeQuestionItem {
  id: string;
  card: Card;
  exerciseType: PracticeExerciseType;
}

export interface PracticeSessionConfig {
  sourceType: PracticeSourceType;
  collectionId?: string;
  collectionTitle?: string;
  questionCount: number;
  questions: PracticeQuestionItem[];
}

export interface SentenceGradeRequest {
  word: string;
  user_sentence: string;
  target_meaning?: string;
}

export interface SentenceGradeErrorItem {
  original_part: string;
  correction: string;
  reason: string;
}

export interface SentenceGradeResponse {
  score: number; // 0 - 100
  is_correct: boolean;
  grammar_score: number; // 0 - 100
  vocabulary_score: number; // 0 - 100
  feedback_vi: string;
  improved_sentence: string;
  explanation_vi?: string;
  errors?: SentenceGradeErrorItem[];
}

export interface MultipleChoiceQuestion {
  id: string;
  targetCard: Card;
  promptType: 'word_to_meaning' | 'meaning_to_word';
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

export interface ClozeQuestion {
  id: string;
  targetCard: Card;
  maskedSentence: string;
  correctWord: string;
  hint: string;
  partOfSpeech?: string;
  translation?: string;
}

export interface PracticeSessionSummary {
  mode: PracticeMode;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  xpEarned: number;
  completedAt: string;
}

export interface SubmitPracticeSessionDto {
  mode?: PracticeMode;
  total_questions: number;
  correct_count: number;
  xp_earned: number;
  collection_title?: string;
}

export interface SubmitPracticeSessionResponse {
  success: boolean;
  actual_xp_awarded: number;
  streak_activated?: boolean;
  streak_count?: number;
}

