/**
 * Pure Utility functions cho Smart Contextual Reader & Text Processing
 * Tuân thủ quy chuẩn DRY và TypeScript an toàn
 */

export const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both',
  'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does',
  'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll',
  'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
  'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its',
  'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so',
  'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s',
  'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve',
  'your', 'yours', 'yourself', 'yourselves'
]);

export interface ReaderToken {
  id: string;
  raw: string;
  clean: string;
  isWord: boolean;
  paragraphIndex: number;
}

/**
 * Làm sạch một từ tiếng Anh: loại bỏ dấu câu ở đầu/cuối, chuyển thường
 */
export function cleanWord(word: string): string {
  if (!word) return '';
  return word
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Kiểm tra xem từ có phải là từ vựng tiếng Anh hợp lệ không (có ít nhất 2 chữ cái)
 */
export function isValidEnglishWord(word: string): boolean {
  const cleaned = cleanWord(word);
  return /^[a-zA-Z]{2,}(-[a-zA-Z]+)*$/.test(cleaned);
}

/**
 * Tokenize văn bản thành mảng các đoạn, mỗi đoạn chứa mảng tokens bảo toàn nguyên bản dấu cách và dấu câu
 */
export function tokenizeTextForReader(text: string): ReaderToken[][] {
  if (!text || !text.trim()) return [];

  // Tách theo dòng mới (giữ lại các đoạn văn bản)
  const rawParagraphs = text.split(/\r?\n+/);

  return rawParagraphs
    .map((paragraph, pIdx) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return [];

      // Regex tách từ vựng tiếng Anh (bao gồm từ có gạch nối hoặc dấu nháy đơn như don't) và khoảng trắng/dấu câu
      const regex = /([a-zA-Z]+(?:['’-][a-zA-Z]+)*)|([^a-zA-Z\s]+)|(\s+)/g;
      const tokens: ReaderToken[] = [];
      let match: RegExpExecArray | null;
      let tokenIdx = 0;

      while ((match = regex.exec(paragraph)) !== null) {
        const raw = match[0];
        const isWord = Boolean(match[1]) && isValidEnglishWord(raw);
        const clean = isWord ? cleanWord(raw) : '';

        tokens.push({
          id: `p${pIdx}-t${tokenIdx++}`,
          raw,
          clean,
          isWord,
          paragraphIndex: pIdx,
        });
      }

      return tokens;
    })
    .filter((p) => p.length > 0);
}

/**
 * Trích xuất câu chứa từ mục tiêu trong toàn bộ đoạn văn
 */
export function extractSentenceAroundWord(fullText: string, targetWord: string): string {
  if (!fullText || !targetWord) return '';

  const cleanTarget = cleanWord(targetWord);
  if (!cleanTarget) return '';

  // Escape special regex characters to support phrases (e.g., "look up")
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedTarget = escapeRegExp(cleanTarget);

  // Tách văn bản thành các câu dựa trên dấu kết câu (. ! ?) và xuống dòng
  const rawSentences = fullText
    .replace(/\r?\n+/g, ' ')
    .split(/(?<=[.!?])\s+/);

  // Tìm câu đầu tiên có chứa từ mục tiêu (ở dạng ranh giới từ \b)
  const regex = new RegExp(`\\b${escapedTarget}\\b`, 'i');
  for (const sentence of rawSentences) {
    if (regex.test(sentence)) {
      // Làm sạch khoảng trắng thừa
      const cleaned = sentence.trim().replace(/\s+/g, ' ');
      if (cleaned.length > 0) {
        return cleaned;
      }
    }
  }

  // Fallback: nếu không khớp ranh giới câu chuẩn, trích xuất đoạn văn bản ~120 ký tự quanh từ đó
  const wordPos = fullText.toLowerCase().indexOf(cleanTarget);
  if (wordPos !== -1) {
    const start = Math.max(0, wordPos - 50);
    const end = Math.min(fullText.length, wordPos + cleanTarget.length + 50);
    return fullText.slice(start, end).trim().replace(/\s+/g, ' ');
  }

  return targetWord;
}

/**
 * Thống kê các chỉ số đọc hiểu cơ bản của văn bản
 */
export function calculateReadingStats(text: string) {
  if (!text || !text.trim()) {
    return {
      total_words: 0,
      unique_words: 0,
      reading_time_minutes: 0,
    };
  }

  const matches = text.match(/[a-zA-Z]+(?:['’-][a-zA-Z]+)*/g) || [];
  const total_words = matches.length;
  const uniqueSet = new Set(matches.map((m) => cleanWord(m)).filter(Boolean));

  // Tốc độ đọc trung bình tiếng Anh ~ 200 từ/phút
  const reading_time_minutes = Math.max(1, Math.round((total_words / 200) * 10) / 10);

  return {
    total_words,
    unique_words: uniqueSet.size,
    reading_time_minutes,
  };
}
