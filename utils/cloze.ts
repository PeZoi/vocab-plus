import { IRREGULAR_WORDS_MAP, getBaseWordCandidates } from './lemmatizer';

export interface ClozeSplitResult {
  before: string;
  matchedWord: string;
  after: string;
  hasMatch: boolean;
}

/**
 * Tìm và tách từ mục tiêu (bao gồm các biến thể ngữ pháp, thì quá khứ, tiếp diễn, số nhiều...)
 * ra khỏi câu ví dụ một cách an toàn và chuẩn xác.
 * Tuyệt đối không cắt ngang giữa chừng một từ khác (như cắt vào giữa từ 'during').
 */
export function findAndSplitClozeWord(
  sentence?: string | null,
  targetWord?: string | null
): ClozeSplitResult {
  const cleanWord = (targetWord || '').trim();
  const cleanSentence = (sentence || '').trim();

  // Fallback nếu không có câu hoặc không có từ
  if (!cleanWord) {
    return {
      before: cleanSentence,
      matchedWord: '',
      after: '',
      hasMatch: false,
    };
  }

  if (!cleanSentence) {
    const fallbackSentence = `She uses the word ${cleanWord} in daily context.`;
    return findAndSplitClozeWord(fallbackSentence, cleanWord);
  }

  const escapedTarget = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1. Khớp chính xác từ gốc nguyên mẫu (word boundary)
  const exactRegex = new RegExp(`\\b${escapedTarget}\\b`, 'i');
  const exactMatch = cleanSentence.match(exactRegex);
  if (exactMatch && exactMatch.index !== undefined) {
    return {
      before: cleanSentence.slice(0, exactMatch.index),
      matchedWord: exactMatch[0],
      after: cleanSentence.slice(exactMatch.index + exactMatch[0].length),
      hasMatch: true,
    };
  }

  // 2. Khớp các biến thể hậu tố thông dụng của từ
  // - Nếu từ kết thúc bằng 'e' (vd: exchange -> exchanged, exchanges, exchanging)
  // - Nếu từ kết thúc bằng 'y' (vd: study -> studied, studies, studying)
  // - Nếu từ thêm s, es, ed, d, ing, r, er, st, est
  const patterns: RegExp[] = [];

  if (cleanWord.toLowerCase().endsWith('e')) {
    const stem = escapedTarget.slice(0, -1);
    patterns.push(new RegExp(`\\b${escapedTarget}(d|s|r)?\\b`, 'i'));
    patterns.push(new RegExp(`\\b${stem}ing\\b`, 'i'));
  } else if (cleanWord.toLowerCase().endsWith('y')) {
    const stem = escapedTarget.slice(0, -1);
    patterns.push(new RegExp(`\\b${stem}(ies|ied)\\b`, 'i'));
    patterns.push(new RegExp(`\\b${escapedTarget}(ing|s)?\\b`, 'i'));
  } else {
    // Từ thông thường: book -> books, play -> played, playing
    patterns.push(new RegExp(`\\b${escapedTarget}(s|es|ed|ing|er|est)?\\b`, 'i'));
    // Gấp đôi phụ âm cuối nếu có: stop -> stopped, stopping, run -> running
    const lastChar = cleanWord.slice(-1);
    if (/[b-df-hj-np-tv-z]/i.test(lastChar) && cleanWord.length >= 3) {
      patterns.push(new RegExp(`\\b${escapedTarget}${lastChar}(ed|ing)\\b`, 'i'));
    }
  }

  for (const regex of patterns) {
    const match = cleanSentence.match(regex);
    if (match && match.index !== undefined) {
      return {
        before: cleanSentence.slice(0, match.index),
        matchedWord: match[0],
        after: cleanSentence.slice(match.index + match[0].length),
        hasMatch: true,
      };
    }
  }

  // 3. Khớp các dạng bất quy tắc (Irregular forms)
  // Tìm trong IRREGULAR_WORDS_MAP xem có từ nào biến thể từ cleanWord không (vd: go -> went, gone; buy -> bought)
  const lowerTarget = cleanWord.toLowerCase();
  const irregularForms: string[] = [];
  for (const [inflected, base] of Object.entries(IRREGULAR_WORDS_MAP)) {
    if (base === lowerTarget) {
      irregularForms.push(inflected);
    }
  }

  for (const irreg of irregularForms) {
    const irregRegex = new RegExp(`\\b${irreg}\\b`, 'i');
    const match = cleanSentence.match(irregRegex);
    if (match && match.index !== undefined) {
      return {
        before: cleanSentence.slice(0, match.index),
        matchedWord: match[0],
        after: cleanSentence.slice(match.index + match[0].length),
        hasMatch: true,
      };
    }
  }

  // 4. Quét từng token từ trong câu và phân tích Lemmatizer (getBaseWordCandidates)
  // Regex tìm các từ riêng biệt trong câu
  const wordRegex = /\b[a-zA-Z]+(?:['’][a-zA-Z]+)?\b/g;
  let wordMatch: RegExpExecArray | null;
  while ((wordMatch = wordRegex.exec(cleanSentence)) !== null) {
    const token = wordMatch[0];
    const candidates = getBaseWordCandidates(token);
    if (candidates.some((c) => c.toLowerCase() === lowerTarget)) {
      return {
        before: cleanSentence.slice(0, wordMatch.index),
        matchedWord: token,
        after: cleanSentence.slice(wordMatch.index + token.length),
        hasMatch: true,
      };
    }
  }

  // 5. Fallback an toàn: Nếu câu ví dụ thực sự không chứa từ hoặc biến thể nào của từ,
  // tuyệt đối KHÔNG cắt giữa chừng một từ khác (như không cắt ngang chữ 'during')!
  // Thay vào đó tạo câu ngữ cảnh chuẩn chứa từ này.
  const fallbackSentence = `She uses the word ${cleanWord} in daily context.`;
  const fallbackMatch = fallbackSentence.match(new RegExp(`\\b${escapedTarget}\\b`, 'i'));
  if (fallbackMatch && fallbackMatch.index !== undefined) {
    return {
      before: fallbackSentence.slice(0, fallbackMatch.index),
      matchedWord: fallbackMatch[0],
      after: fallbackSentence.slice(fallbackMatch.index + fallbackMatch[0].length),
      hasMatch: true,
    };
  }

  return {
    before: cleanSentence + ' (Từ cần điền: ',
    matchedWord: cleanWord,
    after: ')',
    hasMatch: false,
  };
}

/**
 * Ẩn từ mục tiêu trong câu cho dạng câu hỏi điền khuyết / trắc nghiệm cloze
 */
export function maskClozeInSentence(
  sentence?: string | null,
  targetWord?: string | null,
  maskPlaceholder: string = '[ _____ ]'
): string {
  const result = findAndSplitClozeWord(sentence, targetWord);
  if (result.hasMatch) {
    return `${result.before}${maskPlaceholder}${result.after}`;
  }
  return sentence || '';
}
