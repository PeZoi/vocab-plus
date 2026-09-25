import type { DictationGradingResult, DiffToken } from '@/types/listening.types';
import { cleanWord } from './cloze-generator';

/**
 * Thuật toán tính Longest Common Subsequence (LCS) để so sánh 2 mảng từ
 */
function computeLCS(expectedTokens: string[], actualTokens: string[]): number[][] {
  const m = expectedTokens.length;
  const n = actualTokens.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const exp = cleanWord(expectedTokens[i - 1]).toLowerCase();
      const act = cleanWord(actualTokens[j - 1]).toLowerCase();

      if (exp === act) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Chấm điểm bài chép chính tả (Full Dictation) và xuất ra danh sách Diff Tokens
 */
export function gradeFullDictation(
  expectedSentence: string,
  actualSentence: string
): DictationGradingResult {
  if (!expectedSentence) {
    return {
      accuracyPercentage: 0,
      isPassed: false,
      totalWords: 0,
      correctWords: 0,
      diffTokens: [],
      feedback: 'Chưa có dữ liệu bài nghe.',
    };
  }

  const expectedWords = expectedSentence.trim().split(/\s+/).filter(Boolean);
  const actualWords = (actualSentence || '').trim().split(/\s+/).filter(Boolean);

  if (actualWords.length === 0) {
    return {
      accuracyPercentage: 0,
      isPassed: false,
      totalWords: expectedWords.length,
      correctWords: 0,
      diffTokens: expectedWords.map((w) => ({ type: 'missing', expected: w })),
      feedback: 'Hãy gõ những gì bạn nghe được nhé!',
    };
  }

  const dp = computeLCS(expectedWords, actualWords);
  const diffTokens: DiffToken[] = [];

  let i = expectedWords.length;
  let j = actualWords.length;
  let correctCount = 0;

  // Backtracking từ bảng DP để trích xuất diff
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const exp = cleanWord(expectedWords[i - 1]).toLowerCase();
      const act = cleanWord(actualWords[j - 1]).toLowerCase();

      if (exp === act) {
        diffTokens.unshift({
          type: 'correct',
          expected: expectedWords[i - 1],
          actual: actualWords[j - 1],
        });
        correctCount++;
        i--;
        j--;
        continue;
      }
    }

    if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffTokens.unshift({
        type: 'extra',
        actual: actualWords[j - 1],
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diffTokens.unshift({
        type: 'missing',
        expected: expectedWords[i - 1],
      });
      i--;
    }
  }

  // Gộp các cặp missing + extra liền kề thành 'incorrect' để hiển thị tự nhiên hơn
  const compactedTokens: DiffToken[] = [];
  for (let k = 0; k < diffTokens.length; k++) {
    const curr = diffTokens[k];
    const next = diffTokens[k + 1];

    if (curr.type === 'missing' && next && next.type === 'extra') {
      compactedTokens.push({
        type: 'incorrect',
        expected: curr.expected,
        actual: next.actual,
      });
      k++; // Bỏ qua token tiếp theo vì đã gộp
    } else if (curr.type === 'extra' && next && next.type === 'missing') {
      compactedTokens.push({
        type: 'incorrect',
        expected: next.expected,
        actual: curr.actual,
      });
      k++;
    } else {
      compactedTokens.push(curr);
    }
  }

  const totalWords = expectedWords.length;
  const accuracy = totalWords > 0 ? Math.min(100, Math.round((correctCount / totalWords) * 100)) : 0;
  const isPassed = accuracy >= 80;

  let feedback = 'Xuất sắc! Bạn đã nghe chính xác gần như toàn bộ câu.';
  if (accuracy < 50) {
    feedback = 'Tập trung lắng nghe lại các từ khóa và tốc độ nói của diễn giả nhé.';
  } else if (accuracy < 80) {
    feedback = 'Khá tốt! Bạn đã bắt được ý chính nhưng còn sót một vài chi tiết nhỏ.';
  }

  return {
    accuracyPercentage: accuracy,
    isPassed,
    totalWords,
    correctWords: correctCount,
    diffTokens: compactedTokens,
    feedback,
  };
}
