import {
  fsrs,
  generatorParameters,
  Rating,
  State,
  createEmptyCard,
  type Card as FSRSCard,
  type RecordLog,
} from 'ts-fsrs';

// Khởi tạo tham số FSRS tối ưu
const params = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
});

export const fsrsInstance = fsrs(params);

export { Rating, State, createEmptyCard };
export type { FSRSCard, RecordLog };

/**
 * Tính toán trạng thái tiếp theo cho 4 lựa chọn (Again, Hard, Good, Easy)
 */
export function calculateNextReviews(
  card: FSRSCard,
  now: Date = new Date()
): RecordLog {
  return fsrsInstance.repeat(card, now);
}
