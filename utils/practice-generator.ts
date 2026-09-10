import type { CardWithProgress } from '@/types/card.types';
import type { PracticeExerciseType, PracticeQuestionItem } from '@/types/practice.types';

/**
 * Tạo danh sách câu hỏi kiểm tra tổng hợp ngẫu nhiên từ danh sách thẻ được chọn
 * Tự động cân bằng giữa 3 hình thức: Trắc nghiệm, Điền khuyết (Cloze) và Đặt câu (Sentence Writing)
 */
export function createRandomMixedQuestions(
  selectedCards: CardWithProgress[]
): PracticeQuestionItem[] {
  // 3 hình thức bài tập
  const baseModes: PracticeExerciseType[] = ['multiple_choice', 'cloze', 'sentence_writing'];

  // Trộn ngẫu nhiên thứ tự các thẻ trước
  const shuffledCards = [...selectedCards].sort(() => 0.5 - Math.random());

  return shuffledCards.map((card, idx) => {
    const hasExampleSentence =
      !!card.example_sentence && card.example_sentence.trim().length > 0;

    // Xoay vòng và chọn ngẫu nhiên để bài kiểm tra luôn có đủ các hình thức
    let targetMode = baseModes[idx % baseModes.length];

    // Nếu thẻ không có câu ví dụ thì không thể làm điền khuyết (Cloze) -> đổi sang Trắc nghiệm hoặc Đặt câu
    if (targetMode === 'cloze' && !hasExampleSentence) {
      targetMode = Math.random() > 0.5 ? 'multiple_choice' : 'sentence_writing';
    }

    return {
      id: `${card.id}-${idx}`,
      card,
      exerciseType: targetMode,
    };
  });
}
