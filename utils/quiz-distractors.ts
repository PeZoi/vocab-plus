import type { CardWithProgress } from '@/types/card.types';
import type { QuizOptionItem, QuizQuestionItem, QuizQuestionType, ReviewCardItem } from '@/types/review.types';
import { canCardLevelUp } from './fsrs-level';

/**
 * Kho từ gây nhiễu hệ thống (System Distractor Pool)
 * Dự phòng trong trường hợp kho từ của người dùng có ít hơn 4 từ
 */
export const SYSTEM_DISTRACTOR_POOL: Array<{ word: string; definition: string }> = [
  { word: 'accomplish', definition: 'hoàn thành, đạt được mục tiêu' },
  { word: 'resilient', definition: 'kiên cường, có khả năng phục hồi nhanh' },
  { word: 'fascinating', definition: 'hấp dẫn, lôi cuốn' },
  { word: 'elaborate', definition: 'tỉ mỉ, trau chuốt, phức tạp' },
  { word: 'inevitable', definition: 'không thể tránh khỏi, tất yếu' },
  { word: 'contemplate', definition: 'suy ngẫm, cân nhắc kỹ lưỡng' },
  { word: 'persevere', definition: 'kiên trì, bền chí' },
  { word: 'innovative', definition: 'mang tính đổi mới, sáng tạo' },
  { word: 'meticulous', definition: 'tỉ mỉ, cẩn thận từng chi tiết' },
  { word: 'spontaneous', definition: 'tự phát, ngẫu hứng' },
  { word: 'ubiquitous', definition: 'phổ biến ở khắp mọi nơi' },
  { word: 'pragmatic', definition: 'thực tế, thực dụng' },
  { word: 'ambiguous', definition: 'mơ hồ, đa nghĩa' },
  { word: 'vulnerable', definition: 'dễ bị tổn thương' },
  { word: 'versatile', definition: 'đa năng, linh hoạt' },
  { word: 'coherent', definition: 'mạch lạc, chặt chẽ' },
  { word: 'profound', definition: 'sâu sắc, uyên thâm' },
  { word: 'fluctuate', definition: 'dao động, biến động' },
  { word: 'diminish', definition: 'giảm bớt, thu nhỏ lại' },
  { word: 'stimulate', definition: 'kích thích, khuyến khích' },
  { word: 'accumulate', definition: 'tích lũy, gom góp' },
  { word: 'advocate', definition: 'ủng hộ, chủ trương' },
  { word: 'collaborate', definition: 'hợp tác, cộng tác' },
  { word: 'comprehend', definition: 'thấu hiểu, lĩnh hội' },
  { word: 'distinguish', definition: 'phân biệt, nhận ra sự khác biệt' },
  { word: 'fundamental', definition: 'cơ bản, nền tảng' },
  { word: 'generate', definition: 'tạo ra, phát sinh' },
  { word: 'hinder', definition: 'cản trở, gây trở ngại' },
  { word: 'illustrate', definition: 'minh họa, làm sáng tỏ' },
  { word: 'justify', definition: 'biện minh, chứng minh là hợp lý' },
  { word: 'maintain', definition: 'duy trì, giữ vững' },
  { word: 'negotiate', definition: 'đàm phán, thương lượng' },
  { word: 'overcome', definition: 'vượt qua khó khăn' },
  { word: 'perceive', definition: 'nhận thức, cảm nhận' },
  { word: 'reinforce', definition: 'củng cố, tăng cường' },
  { word: 'subsequent', definition: 'xảy ra sau, tiếp theo' },
  { word: 'transform', definition: 'biến đổi, chuyển hóa' },
  { word: 'underlying', definition: 'nằm ở gốc rễ, cơ bản' },
  { word: 'validate', definition: 'xác thực, phê chuẩn' },
  { word: 'widespread', definition: 'lan rộng, phổ biến rộng rãi' },
];

/**
 * Trộn ngẫu nhiên một mảng (Fisher-Yates Shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Lấy 3 đáp án gây nhiễu (distractors) độc nhất, không trùng với từ đúng
 */
function getDistractors(
  correctWord: string,
  correctDef: string,
  candidatePool: Array<{ word: string; definition: string }>,
  mode: 'word' | 'definition'
): string[] {
  const filteredCandidates = candidatePool.filter(
    (item) =>
      item.word.toLowerCase() !== correctWord.toLowerCase() &&
      item.definition.toLowerCase() !== correctDef.toLowerCase()
  );

  const shuffled = shuffleArray(filteredCandidates);
  const distractors: string[] = [];

  for (const item of shuffled) {
    const val = mode === 'word' ? item.word : item.definition;
    if (!distractors.includes(val)) {
      distractors.push(val);
    }
    if (distractors.length >= 3) break;
  }

  // Nếu vẫn thiếu (do candidatePool ít hơn 3 từ khác biệt), mượn từ System Distractor Pool
  if (distractors.length < 3) {
    const systemShuffled = shuffleArray(SYSTEM_DISTRACTOR_POOL);
    for (const item of systemShuffled) {
      if (item.word.toLowerCase() === correctWord.toLowerCase()) continue;
      const val = mode === 'word' ? item.word : item.definition;
      if (!distractors.includes(val)) {
        distractors.push(val);
      }
      if (distractors.length >= 3) break;
    }
  }

  return distractors;
}

/**
 * Ẩn từ mục tiêu trong câu ví dụ dạng [_____]
 */
function maskWordInSentence(sentence: string, word: string): string {
  if (!sentence || !word) return sentence || '';

  // Thoát ký tự đặc biệt cho Regex
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Regex tìm từ độc lập (word boundary) hoặc các biến thể chia thì cơ bản
  const regex = new RegExp(`\\b${escapedWord}(s|es|ed|d|ing)?\\b`, 'gi');

  if (regex.test(sentence)) {
    return sentence.replace(regex, '[ _____ ]');
  }

  // Nếu không khớp regex chính xác, thay thế case-insensitive
  const lowerSentence = sentence.toLowerCase();
  const lowerWord = word.toLowerCase();
  const index = lowerSentence.indexOf(lowerWord);

  if (index !== -1) {
    return (
      sentence.substring(0, index) +
      '[ _____ ]' +
      sentence.substring(index + word.length)
    );
  }

  return sentence;
}

/**
 * Sinh danh sách câu hỏi trắc nghiệm phản xạ thông minh từ danh sách thẻ cần review
 */
export function generateQuizQuestions(
  reviewCards: ReviewCardItem[],
  allCards: CardWithProgress[] = [],
  isCustomSession: boolean = false
): QuizQuestionItem[] {
  if (reviewCards.length === 0) return [];

  // Tạo kho tổng hợp ứng viên làm đáp án gây nhiễu
  const combinedPool: Array<{ word: string; definition: string }> = [
    ...reviewCards.map((rc) => ({ word: rc.card.word, definition: rc.card.definition })),
    ...allCards.map((c) => ({ word: c.word, definition: c.definition })),
    ...SYSTEM_DISTRACTOR_POOL,
  ];

  // Thứ tự các hình thức câu hỏi xoay vòng để tạo sự đa dạng
  const availableTypes: QuizQuestionType[] = ['en_to_vi', 'vi_to_en', 'audio_to_en', 'cloze'];

  return reviewCards.map((item, index) => {
    const card = item.card;
    const isRanked = canCardLevelUp(item, isCustomSession);
    const hasExampleSentence = !!card.example_sentence && card.example_sentence.trim().length > 5;

    // Chọn hình thức câu hỏi xoay vòng
    let questionType: QuizQuestionType = availableTypes[index % availableTypes.length];
    if (questionType === 'cloze' && !hasExampleSentence) {
      questionType = index % 2 === 0 ? 'en_to_vi' : 'vi_to_en';
    }

    let questionText = '';
    let contextSentence: string | undefined = undefined;
    let contextTranslation: string | undefined = undefined;
    let audioText: string | undefined = undefined;
    let rawOptions: Array<{ text: string; isCorrect: boolean }> = [];

    switch (questionType) {
      case 'en_to_vi': {
        questionText = `Từ "${card.word}" có nghĩa là gì?`;
        audioText = card.word;
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'definition');
        rawOptions = [
          { text: card.definition, isCorrect: true },
          ...distractors.map((d) => ({ text: d, isCorrect: false })),
        ];
        break;
      }
      case 'vi_to_en': {
        questionText = `Từ tiếng Anh nào có nghĩa là: "${card.definition}"?`;
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'word');
        rawOptions = [
          { text: card.word, isCorrect: true },
          ...distractors.map((d) => ({ text: d, isCorrect: false })),
        ];
        break;
      }
      case 'audio_to_en': {
        questionText = 'Nghe phát âm và chọn từ tiếng Anh chính xác:';
        audioText = card.word;
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'word');
        rawOptions = [
          { text: card.word, isCorrect: true },
          ...distractors.map((d) => ({ text: d, isCorrect: false })),
        ];
        break;
      }
      case 'cloze': {
        questionText = 'Chọn từ thích hợp để điền vào chỗ trống:';
        contextSentence = maskWordInSentence(card.example_sentence || '', card.word);
        contextTranslation = card.example_translation || undefined;
        audioText = card.word;
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'word');
        rawOptions = [
          { text: card.word, isCorrect: true },
          ...distractors.map((d) => ({ text: d, isCorrect: false })),
        ];
        break;
      }
    }

    // Trộn ngẫu nhiên 4 đáp án
    const shuffledOptions: QuizOptionItem[] = shuffleArray(rawOptions).map((opt, optIdx) => ({
      id: `opt-${card.id}-${optIdx}`,
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));

    return {
      id: `q-${card.id}-${index}`,
      cardItem: item,
      type: questionType,
      questionText,
      contextSentence,
      contextTranslation,
      audioText,
      options: shuffledOptions,
      isRanked,
    };
  });
}
