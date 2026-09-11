import type { CardWithProgress } from '@/types/card.types';
import type { PracticeExerciseType, PracticeQuestionItem } from '@/types/practice.types';

/**
 * Thuật toán Fisher-Yates Shuffle chuẩn xác để xáo trộn mảng không thiên vị
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Tạo danh sách câu hỏi kiểm tra tổng hợp ngẫu nhiên từ danh sách thẻ được chọn
 * - Xáo trộn ngẫu nhiên thứ tự các từ vựng bằng Fisher-Yates shuffle
 * - Các hình thức kiểm tra (Trắc nghiệm, Điền khuyết Cloze, Đặt câu AI) xuất hiện hoàn toàn ngẫu nhiên và bất ngờ
 */
export function createRandomMixedQuestions(
  selectedCards: CardWithProgress[]
): PracticeQuestionItem[] {
  if (!selectedCards || selectedCards.length === 0) return [];

  // 1. Trộn ngẫu nhiên danh sách thẻ bằng Fisher-Yates shuffle
  const shuffledCards = shuffleArray(selectedCards);

  // 2. Phân bổ hình thức hoàn toàn ngẫu nhiên cho từng câu, tránh lặp lại cùng 1 hình thức quá 2 lần liên tiếp nếu có thể
  const questions: PracticeQuestionItem[] = [];
  let lastMode: PracticeExerciseType | null = null;
  let secondLastMode: PracticeExerciseType | null = null;

  shuffledCards.forEach((card, idx) => {
    const hasExampleSentence =
      !!card.example_sentence && card.example_sentence.trim().length > 0;

    // Tập hợp các hình thức hợp lệ cho từ này
    const availableModes: PracticeExerciseType[] = hasExampleSentence
      ? ['multiple_choice', 'cloze', 'sentence_writing']
      : ['multiple_choice', 'sentence_writing'];

    // Lọc bỏ hình thức nếu nó đã xuất hiện 2 lần liên tiếp trước đó (để tăng tính đa dạng)
    let candidateModes = availableModes;
    if (
      lastMode &&
      secondLastMode &&
      lastMode === secondLastMode &&
      availableModes.length > 1
    ) {
      const filtered = availableModes.filter((m) => m !== lastMode);
      if (filtered.length > 0) {
        candidateModes = filtered;
      }
    }

    // Bốc ngẫu nhiên một hình thức
    const chosenMode =
      candidateModes[Math.floor(Math.random() * candidateModes.length)];

    secondLastMode = lastMode;
    lastMode = chosenMode;

    questions.push({
      id: `${card.id}-${idx}-${Date.now()}`,
      card,
      exerciseType: chosenMode,
    });
  });

  return questions;
}
