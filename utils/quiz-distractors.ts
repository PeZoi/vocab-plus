import type { CardWithProgress } from '@/types/card.types';
import type { QuizOptionItem, QuizQuestionItem, QuizQuestionType, ReviewCardItem } from '@/types/review.types';
import { canCardLevelUp } from './fsrs-level';

export interface DistractorCandidate {
  word: string;
  definition: string;
  part_of_speech?: string | null;
}

/**
 * Kho từ gây nhiễu hệ thống (System Distractor Pool)
 * Dự phòng trong trường hợp kho từ của người dùng có ít hơn 4 từ
 */
export const SYSTEM_DISTRACTOR_POOL: DistractorCandidate[] = [
  // --- ADJECTIVES (Tính từ) ---
  { word: 'curious', definition: 'tò mò, muốn tìm hiểu khám phá', part_of_speech: 'adjective' },
  { word: 'resilient', definition: 'kiên cường, có khả năng phục hồi nhanh', part_of_speech: 'adjective' },
  { word: 'fascinating', definition: 'hấp dẫn, lôi cuốn', part_of_speech: 'adjective' },
  { word: 'elaborate', definition: 'tỉ mỉ, trau chuốt, phức tạp', part_of_speech: 'adjective' },
  { word: 'inevitable', definition: 'không thể tránh khỏi, tất yếu', part_of_speech: 'adjective' },
  { word: 'innovative', definition: 'mang tính đổi mới, sáng tạo', part_of_speech: 'adjective' },
  { word: 'meticulous', definition: 'tỉ mỉ, cẩn thận từng chi tiết', part_of_speech: 'adjective' },
  { word: 'spontaneous', definition: 'tự phát, ngẫu hứng', part_of_speech: 'adjective' },
  { word: 'ubiquitous', definition: 'phổ biến ở khắp mọi nơi', part_of_speech: 'adjective' },
  { word: 'pragmatic', definition: 'thực tế, thực dụng', part_of_speech: 'adjective' },
  { word: 'ambiguous', definition: 'mơ hồ, đa nghĩa', part_of_speech: 'adjective' },
  { word: 'vulnerable', definition: 'dễ bị tổn thương', part_of_speech: 'adjective' },
  { word: 'versatile', definition: 'đa năng, linh hoạt', part_of_speech: 'adjective' },
  { word: 'coherent', definition: 'mạch lạc, chặt chẽ', part_of_speech: 'adjective' },
  { word: 'profound', definition: 'sâu sắc, uyên thâm', part_of_speech: 'adjective' },
  { word: 'fundamental', definition: 'cơ bản, nền tảng', part_of_speech: 'adjective' },
  { word: 'widespread', definition: 'lan rộng, phổ biến rộng rãi', part_of_speech: 'adjective' },
  { word: 'generous', definition: 'hào phóng, rộng lượng', part_of_speech: 'adjective' },
  { word: 'patient', definition: 'kiên nhẫn, nhẫn nại', part_of_speech: 'adjective' },
  { word: 'cautious', definition: 'thận trọng, cẩn giác', part_of_speech: 'adjective' },
  { word: 'enthusiastic', definition: 'nhiệt tình, hào hứng', part_of_speech: 'adjective' },
  { word: 'diligent', definition: 'chăm chỉ, siêng năng', part_of_speech: 'adjective' },
  { word: 'optimistic', definition: 'lạc quan, tích cực', part_of_speech: 'adjective' },

  // --- VERBS (Động từ) ---
  { word: 'accomplish', definition: 'hoàn thành, đạt được mục tiêu', part_of_speech: 'verb' },
  { word: 'contemplate', definition: 'suy ngẫm, cân nhắc kỹ lưỡng', part_of_speech: 'verb' },
  { word: 'persevere', definition: 'kiên trì, bền chí', part_of_speech: 'verb' },
  { word: 'fluctuate', definition: 'dao động, biến động', part_of_speech: 'verb' },
  { word: 'diminish', definition: 'giảm bớt, thu nhỏ lại', part_of_speech: 'verb' },
  { word: 'stimulate', definition: 'kích thích, khuyến khích', part_of_speech: 'verb' },
  { word: 'accumulate', definition: 'tích lũy, gom góp', part_of_speech: 'verb' },
  { word: 'advocate', definition: 'ủng hộ, chủ trương', part_of_speech: 'verb' },
  { word: 'collaborate', definition: 'hợp tác, cộng tác', part_of_speech: 'verb' },
  { word: 'comprehend', definition: 'thấu hiểu, lĩnh hội', part_of_speech: 'verb' },
  { word: 'distinguish', definition: 'phân biệt, nhận ra sự khác biệt', part_of_speech: 'verb' },
  { word: 'generate', definition: 'tạo ra, phát sinh', part_of_speech: 'verb' },
  { word: 'hinder', definition: 'cản trở, gây trở ngại', part_of_speech: 'verb' },
  { word: 'illustrate', definition: 'minh họa, làm sáng tỏ', part_of_speech: 'verb' },
  { word: 'justify', definition: 'biện minh, chứng minh là hợp lý', part_of_speech: 'verb' },
  { word: 'maintain', definition: 'duy trì, giữ vững', part_of_speech: 'verb' },
  { word: 'negotiate', definition: 'đàm phán, thương lượng', part_of_speech: 'verb' },
  { word: 'overcome', definition: 'vượt qua khó khăn', part_of_speech: 'verb' },
  { word: 'perceive', definition: 'nhận thức, cảm nhận', part_of_speech: 'verb' },
  { word: 'reinforce', definition: 'củng cố, tăng cường', part_of_speech: 'verb' },
  { word: 'transform', definition: 'biến đổi, chuyển hóa', part_of_speech: 'verb' },
  { word: 'validate', definition: 'xác thực, phê chuẩn', part_of_speech: 'verb' },
  { word: 'explore', definition: 'thăm dò, khám phá', part_of_speech: 'verb' },
  { word: 'enhance', definition: 'nâng cao, gia tăng chất lượng', part_of_speech: 'verb' },

  // --- NOUNS (Danh từ) ---
  { word: 'opportunity', definition: 'cơ hội, thời cơ thuận lợi', part_of_speech: 'noun' },
  { word: 'perspective', definition: 'góc nhìn, quan điểm', part_of_speech: 'noun' },
  { word: 'challenge', definition: 'thách thức, khó khăn', part_of_speech: 'noun' },
  { word: 'achievement', definition: 'thành tựu, kết quả đạt được', part_of_speech: 'noun' },
  { word: 'consequence', definition: 'hệ quả, kết quả theo sau', part_of_speech: 'noun' },
  { word: 'diversity', definition: 'sự phong phú, đa dạng', part_of_speech: 'noun' },
  { word: 'initiative', definition: 'sáng kiến, sự chủ động khởi xướng', part_of_speech: 'noun' },
  { word: 'priority', definition: 'sự ưu tiên hàng đầu', part_of_speech: 'noun' },
  { word: 'strategy', definition: 'chiến lược, kế hoạch dài hạn', part_of_speech: 'noun' },
  { word: 'obstacle', definition: 'chướng ngại vật, rào cản', part_of_speech: 'noun' },

  // --- ADVERBS (Phó từ) ---
  { word: 'constantly', definition: 'liên tục, không ngớt', part_of_speech: 'adverb' },
  { word: 'remarkably', definition: 'đáng kể, một cách xuất sắc', part_of_speech: 'adverb' },
  { word: 'accurately', definition: 'chính xác, đúng đắn', part_of_speech: 'adverb' },
  { word: 'deliberately', definition: 'cố ý, có chủ đích', part_of_speech: 'adverb' },
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
 * Lấy 3 đáp án gây nhiễu (distractors) độc nhất, không trùng với từ đúng.
 * Tự động mượn từ SYSTEM_DISTRACTOR_POOL nếu kho từ của user có ít hơn 4 từ.
 */
export function getDistractors(
  correctWord: string,
  correctDef: string,
  candidatePool: DistractorCandidate[],
  mode: 'word' | 'definition',
  targetPartOfSpeech?: string | null
): string[] {
  const cleanCorrectWord = correctWord.trim().toLowerCase();
  const cleanCorrectDef = correctDef.trim().toLowerCase();

  // Lọc bỏ từ trùng lặp với từ đúng
  const filteredCandidates = candidatePool.filter((item) => {
    const w = item.word.trim().toLowerCase();
    const d = item.definition.trim().toLowerCase();
    return w !== cleanCorrectWord && d !== cleanCorrectDef;
  });

  const distractors: string[] = [];

  // Ưu tiên 1: Lấy các từ có cùng từ loại (part_of_speech) từ candidatePool của user
  if (targetPartOfSpeech) {
    const samePosCandidates = shuffleArray(
      filteredCandidates.filter(
        (c) => c.part_of_speech && c.part_of_speech.toLowerCase() === targetPartOfSpeech.toLowerCase()
      )
    );
    for (const item of samePosCandidates) {
      const val = mode === 'word' ? item.word : item.definition;
      if (!distractors.includes(val)) {
        distractors.push(val);
      }
      if (distractors.length >= 3) return distractors;
    }
  }

  // Ưu tiên 2: Lấy các từ còn lại trong candidatePool của user
  const shuffledCandidates = shuffleArray(filteredCandidates);
  for (const item of shuffledCandidates) {
    const val = mode === 'word' ? item.word : item.definition;
    if (!distractors.includes(val)) {
      distractors.push(val);
    }
    if (distractors.length >= 3) return distractors;
  }

  // Ưu tiên 3: Nếu vẫn thiếu (kho từ của user có ít hơn 4 từ), mượn từ SYSTEM_DISTRACTOR_POOL
  if (distractors.length < 3) {
    // 3.1: Ưu tiên từ trong SYSTEM_DISTRACTOR_POOL có cùng từ loại
    if (targetPartOfSpeech) {
      const samePosSystem = shuffleArray(
        SYSTEM_DISTRACTOR_POOL.filter(
          (c) =>
            c.part_of_speech &&
            c.part_of_speech.toLowerCase() === targetPartOfSpeech.toLowerCase() &&
            c.word.trim().toLowerCase() !== cleanCorrectWord &&
            c.definition.trim().toLowerCase() !== cleanCorrectDef
        )
      );
      for (const item of samePosSystem) {
        const val = mode === 'word' ? item.word : item.definition;
        if (!distractors.includes(val)) {
          distractors.push(val);
        }
        if (distractors.length >= 3) return distractors;
      }
    }

    // 3.2: Lấy bất kỳ từ nào còn lại trong SYSTEM_DISTRACTOR_POOL
    const systemShuffled = shuffleArray(SYSTEM_DISTRACTOR_POOL);
    for (const item of systemShuffled) {
      const w = item.word.trim().toLowerCase();
      const d = item.definition.trim().toLowerCase();
      if (w === cleanCorrectWord || d === cleanCorrectDef) continue;
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
  const combinedPool: DistractorCandidate[] = [
    ...reviewCards.map((rc) => ({
      word: rc.card.word,
      definition: rc.card.definition,
      part_of_speech: rc.card.part_of_speech,
    })),
    ...allCards.map((c) => ({
      word: c.word,
      definition: c.definition,
      part_of_speech: c.part_of_speech,
    })),
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
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'definition', card.part_of_speech);
        rawOptions = [
          { text: card.definition, isCorrect: true },
          ...distractors.map((d) => ({ text: d, isCorrect: false })),
        ];
        break;
      }
      case 'vi_to_en': {
        questionText = `Từ tiếng Anh nào có nghĩa là: "${card.definition}"?`;
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'word', card.part_of_speech);
        rawOptions = [
          { text: card.word, isCorrect: true },
          ...distractors.map((d) => ({ text: d, isCorrect: false })),
        ];
        break;
      }
      case 'audio_to_en': {
        questionText = 'Nghe phát âm và chọn từ tiếng Anh chính xác:';
        audioText = card.word;
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'word', card.part_of_speech);
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
        const distractors = getDistractors(card.word, card.definition, combinedPool, 'word', card.part_of_speech);
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
