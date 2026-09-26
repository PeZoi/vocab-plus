import {
  fsrs,
  generatorParameters,
  Rating,
  State,
  createEmptyCard,
  type Card as FSRSCard,
  type RecordLog,
} from 'ts-fsrs';

// Khởi tạo tham số FSRS tối ưu với learning_steps cho Hạt mầm
const params = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['10m', '4h', '1d'],
  relearning_steps: ['10m', '2h'],
  request_retention: 0.9,
  maximum_interval: 365,
});

export const fsrsInstance = fsrs(params);

export { Rating, State, createEmptyCard };
export type { FSRSCard, RecordLog };

/**
 * Tính toán các trạng thái lịch ôn tập tiếp theo theo mô hình FSRS
 */
export function calculateNextReviews(
  card: FSRSCard,
  now: Date = new Date()
): RecordLog {
  return fsrsInstance.repeat(card, now);
}
