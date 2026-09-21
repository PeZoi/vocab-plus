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
 * - Cho phép người dùng tùy chọn 1 hoặc kết hợp nhiều hình thức (mặc định chọn cả 3)
 */
export function createRandomMixedQuestions(
  selectedCards: CardWithProgress[],
  allowedModes: PracticeExerciseType[] = ['multiple_choice', 'cloze', 'sentence_writing']
): PracticeQuestionItem[] {
  if (!selectedCards || selectedCards.length === 0) return [];

  // Đảm bảo luôn có ít nhất 1 hình thức hợp lệ
  const validAllowedModes: PracticeExerciseType[] =
    allowedModes && allowedModes.length > 0
      ? allowedModes
      : ['multiple_choice', 'cloze', 'sentence_writing'];

  // 1. Trộn ngẫu nhiên danh sách thẻ bằng Fisher-Yates shuffle
  const shuffledCards = shuffleArray(selectedCards);

  // 2. Phân bổ hình thức hoàn toàn ngẫu nhiên cho từng câu, tránh lặp lại cùng 1 hình thức quá 2 lần liên tiếp nếu có thể
  const questions: PracticeQuestionItem[] = [];
  let lastMode: PracticeExerciseType | null = null;
  let secondLastMode: PracticeExerciseType | null = null;

  shuffledCards.forEach((card, idx) => {
    const hasExampleSentence =
      !!card.example_sentence && card.example_sentence.trim().length > 0;

    // Lọc các hình thức hợp lệ cho từ này dựa trên cấu hình người dùng
    let availableModes = validAllowedModes.filter((mode) => {
      // Hình thức điền khuyết Cloze bắt buộc phải có câu ví dụ thực tế
      if (mode === 'cloze') return hasExampleSentence;
      return true;
    });

    // Nếu từ này không có câu ví dụ mà người dùng chỉ chọn duy nhất 'cloze',
    // fallback sang các hình thức hợp lệ khác hoặc multiple_choice
    if (availableModes.length === 0) {
      availableModes = validAllowedModes.filter((m) => m !== 'cloze');
      if (availableModes.length === 0) {
        availableModes = ['multiple_choice'];
      }
    }

    // Lọc bỏ hình thức nếu nó đã xuất hiện 2 lần liên tiếp trước đó (chỉ khi có >= 2 hình thức khả dụng)
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
