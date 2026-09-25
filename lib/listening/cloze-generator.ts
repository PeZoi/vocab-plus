import type { WordClozeItem, ChunkClozeItem } from '@/types/listening.types';

// Danh sách các từ dừng cơ bản không nên khoét lỗ ở chế độ Dễ
const COMMON_STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'and', 'or', 'but', 'nor', 'so', 'yet', 'for', 'at', 'by', 'in', 'of', 'on',
  'to', 'with', 'from', 'into', 'onto', 'about', 'as', 'than',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
  'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could', 'will', 'would', 'shall', 'should',
  'there', 'here', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
]);

// Danh sách một số cụm từ & Phrasal Verbs phổ biến để ưu tiên khoét lỗ ở chế độ Vừa
const COMMON_PHRASAL_PATTERNS = [
  'rely on', 'kick-start', 'flushes out', 'lead to', 'cope with', 'stay awake',
  'focus on', 'deal with', 'carry out', 'bring about', 'take advantage of',
  'in terms of', 'as a result', 'on the other hand', 'in order to', 'give up',
  'point out', 'find out', 'come up with', 'look forward to', 'run out of',
  'set up', 'break down', 'turn out', 'end up', 'work out', 'depend on',
];

/**
 * Loại bỏ dấu câu ở đầu/cuối từ để so khớp thuần túy
 */
export function cleanWord(word: string): string {
  return word.replace(/^[^\w]+|[^\w]+$/g, '').trim();
}

function simpleStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Sinh danh sách các ô khoét lỗ theo TỪ (Level Dễ - Word Cloze)
 * Luôn đảm bảo cùng một câu sẽ sinh ra các ô khoét lỗ cố định 100% (Deterministic)
 */
export function generateWordCloze(sentence: string): WordClozeItem[] {
  if (!sentence) return [];

  // Tách câu thành các từ (giữ nguyên khoảng trắng và dấu câu)
  const tokens = sentence.split(/\s+/);
  const eligibleIndices: number[] = [];

  tokens.forEach((token, idx) => {
    const cleaned = cleanWord(token);
    const lower = cleaned.toLowerCase();

    // Điều kiện từ có thể khoét lỗ: độ dài >= 4 và không phải stopword phổ thông
    if (cleaned.length >= 4 && !COMMON_STOPWORDS.has(lower) && /^[a-zA-Z-]+$/.test(cleaned)) {
      eligibleIndices.push(idx);
    }
  });

  // Tỷ lệ khoét lỗ: khoảng 30% - 45% tổng số từ đủ điều kiện (tối thiểu 1 từ, tối đa 5 từ)
  const countToMask = Math.max(1, Math.min(5, Math.ceil(eligibleIndices.length * 0.4)));

  // Chọn từ khoét lỗ CỐ ĐỊNH dựa trên hash của câu (không dùng Math.random gây đổi vị trí khi rerender)
  const hashVal = simpleStringHash(sentence);
  const sortedByStability = [...eligibleIndices].sort((a, b) => {
    const scoreA = (a * 37 + hashVal) % 101;
    const scoreB = (b * 37 + hashVal) % 101;
    return scoreB - scoreA;
  });

  const selectedMaskIndices = new Set(sortedByStability.slice(0, countToMask));

  return tokens.map((token, index) => {
    const cleaned = cleanWord(token);
    const isMasked = selectedMaskIndices.has(index);

    return {
      index,
      originalWord: token,
      cleanedWord: cleaned,
      isMasked,
      hint: isMasked
        ? {
            firstLetter: cleaned.charAt(0).toUpperCase(),
            length: cleaned.length,
          }
        : undefined,
    };
  });
}

/**
 * Sinh danh sách các ô khoét lỗ theo CỤM (Level Vừa - Chunk Cloze)
 */
export function generateChunkCloze(sentence: string): ChunkClozeItem {
  const tokens = sentence.split(/\s+/);
  const lowerSentence = sentence.toLowerCase();

  let startIdx = -1;
  let endIdx = -1;
  let matchedPhrase = '';

  // 1. Thử tìm cụm phrasal verb/idiom quen thuộc
  for (const phrase of COMMON_PHRASAL_PATTERNS) {
    const phrasePos = lowerSentence.indexOf(phrase);
    if (phrasePos !== -1) {
      // Tìm vị trí token bắt đầu và kết thúc
      const phraseWords = phrase.split(/\s+/);
      for (let i = 0; i <= tokens.length - phraseWords.length; i++) {
        const slice = tokens
          .slice(i, i + phraseWords.length)
          .map((t) => cleanWord(t).toLowerCase())
          .join(' ');
        if (slice === phrase) {
          startIdx = i;
          endIdx = i + phraseWords.length;
          matchedPhrase = tokens.slice(i, endIdx).join(' ');
          break;
        }
      }
      if (startIdx !== -1) break;
    }
  }

  // 2. Nếu không có cụm trong từ điển, tự động nhóm một chunk 2-3 từ liên tiếp ở giữa câu
  if (startIdx === -1 && tokens.length >= 4) {
    const midStart = Math.max(1, Math.floor(tokens.length / 2) - 1);
    const chunkSize = Math.min(3, tokens.length - midStart - 1);
    startIdx = midStart;
    endIdx = midStart + chunkSize;
    matchedPhrase = tokens.slice(startIdx, endIdx).join(' ');
  }

  return {
    id: `chunk-${Date.now()}`,
    originalText: sentence,
    maskedChunks: [
      {
        startWordIndex: Math.max(0, startIdx),
        endWordIndex: Math.max(1, endIdx),
        text: matchedPhrase,
        cleanedText: cleanWord(matchedPhrase),
        hint: `Cụm ${matchedPhrase.split(/\s+/).length} từ`,
      },
    ],
  };
}

/**
 * So sánh câu trả lời của người dùng với từ gốc (bỏ qua dấu câu & hoa/thường)
 */
export function checkWordMatch(expected: string, actual: string): boolean {
  if (!expected || !actual) return false;
  const cleanExp = cleanWord(expected).toLowerCase();
  const cleanAct = cleanWord(actual).toLowerCase();
  return cleanExp === cleanAct;
}
