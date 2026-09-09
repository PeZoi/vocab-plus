export interface ReviewXpRates {
  per_card: number;
  again?: number;
  hard?: number;
  good?: number;
  easy?: number;
}

export interface PracticeXpRates {
  multiple_choice: number;
  cloze: number;
  sentence_writing: number;
  perfect_bonus: number;
}

export const DEFAULT_REVIEW_XP_RATES: ReviewXpRates = {
  per_card: 1,
};

export const DEFAULT_PRACTICE_XP_RATES: PracticeXpRates = {
  multiple_choice: 10,
  cloze: 15,
  sentence_writing: 20,
  perfect_bonus: 10,
};
