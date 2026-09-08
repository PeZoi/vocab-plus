/**
 * Tiện ích chuẩn hóa và tính toán độ tương đồng giữa các từ vựng (Text Similarity / Fuzzy Matching)
 * Áp dụng cho tính năng Smart Fork và kiểm tra trùng lặp từ vựng
 */

/**
 * Chuẩn hóa chuỗi từ vựng:
 * - Chuyển chữ thường (lowercase)
 * - Loại bỏ khoảng trắng thừa
 * - Bỏ các ký tự đặc biệt xung quanh, giữ lại chữ cái, số và khoảng trắng
 */
export function normalizeWord(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Lấy danh sách bigram (cặp 2 ký tự liên tiếp) của chuỗi
 */
function getBigrams(str: string): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Tính hệ số Sørensen–Dice dựa trên bigram (phù hợp bắt các từ tương đồng)
 */
export function diceCoefficient(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);

  let intersection = 0;
  const b2Copy = [...b2];

  for (const item of b1) {
    const idx = b2Copy.indexOf(item);
    if (idx !== -1) {
      intersection++;
      b2Copy.splice(idx, 1);
    }
  }

  const total = b1.length + b2.length;
  return total > 0 ? (2 * intersection) / total : 0;
}

/**
 * Kiểm tra xem 2 từ có phải là biến thể ngữ pháp cơ bản của nhau không
 * (Số nhiều: -s, -es, -ies; Quá khứ: -ed, -d; Tiếp diễn: -ing)
 */
function checkInflectionMatch(w1: string, w2: string): number {
  const [shortW, longW] = w1.length <= w2.length ? [w1, w2] : [w2, w1];

  // Nếu quá ngắn (< 3 ký tự) thì không xét
  if (shortW.length < 3) return 0;

  // 1. Đuôi -s, -es (ví dụ: cat -> cats, watch -> watches)
  if (longW === shortW + 's') return 0.92;
  if (longW === shortW + 'es') return 0.90;

  // 2. Đuôi -ed, -d (ví dụ: look -> looked, like -> liked)
  if (longW === shortW + 'ed') return 0.88;
  if (longW === shortW + 'd') return 0.92;

  // 3. Đuôi -ing (ví dụ: look -> looking, make -> making)
  if (longW === shortW + 'ing') return 0.85;
  if (shortW.endsWith('e') && longW === shortW.slice(0, -1) + 'ing') return 0.88;

  // 4. Biến thể y -> ies / ied (ví dụ: study -> studies, studied)
  if (shortW.endsWith('y')) {
    const base = shortW.slice(0, -1);
    if (longW === base + 'ies' || longW === base + 'ied') return 0.88;
  }

  // 5. Gấp đôi phụ âm + ed / ing (ví dụ: run -> running, stop -> stopped)
  const lastChar = shortW[shortW.length - 1];
  if (longW === shortW + lastChar + 'ed') return 0.86;
  if (longW === shortW + lastChar + 'ing') return 0.85;

  return 0;
}

/**
 * Tính toán độ tương đồng giữa 2 từ đơn (single tokens)
 * Trả về giá trị từ 0.0 đến 1.0
 */
function calculateSingleWordSimilarity(w1: string, w2: string): number {
  if (w1 === w2) return 1.0;

  // Kiểm tra biến thể ngữ pháp trực tiếp
  const inflectionScore = checkInflectionMatch(w1, w2);
  if (inflectionScore > 0) return inflectionScore;

  // Normalized Levenshtein
  const maxLen = Math.max(w1.length, w2.length);
  const dist = levenshteinDistance(w1, w2);
  const levScore = maxLen > 0 ? (maxLen - dist) / maxLen : 0;

  // Bigram Dice
  const diceScore = diceCoefficient(w1, w2);

  // Lấy điểm cao nhất giữa Levenshtein và Dice
  return Math.max(levScore, diceScore);
}

/**
 * Tính toán độ tương đồng giữa 2 từ / cụm từ bất kỳ (0 - 100%)
 * Có hỗ trợ cả từ đơn lẫn cụm từ (Phrasal Verbs, ví dụ: "look at" và "looked at")
 * 
 * @param word1 Từ thứ nhất
 * @param word2 Từ thứ hai
 * @returns Điểm phần trăm từ 0 đến 100 (làm tròn)
 */
export function calculateWordSimilarity(word1: string, word2: string): number {
  const s1 = normalizeWord(word1);
  const s2 = normalizeWord(word2);

  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  // Tách tokens cho cụm từ
  const tokens1 = s1.split(' ').filter(Boolean);
  const tokens2 = s2.split(' ').filter(Boolean);

  // Nếu cả 2 đều là cụm từ có cùng số lượng từ (ví dụ: "look at" và "looked at")
  if (tokens1.length > 1 && tokens1.length === tokens2.length) {
    let tokenScoreSum = 0;
    for (let i = 0; i < tokens1.length; i++) {
      tokenScoreSum += calculateSingleWordSimilarity(tokens1[i], tokens2[i]);
    }
    const tokenAvgScore = tokenScoreSum / tokens1.length;

    // Toàn chuỗi Levenshtein
    const maxLen = Math.max(s1.length, s2.length);
    const dist = levenshteinDistance(s1, s2);
    const fullLevScore = maxLen > 0 ? (maxLen - dist) / maxLen : 0;

    const finalScore = Math.max(tokenAvgScore, fullLevScore);
    return Math.min(100, Math.round(finalScore * 100));
  }

  // Nếu là từ đơn hoặc cụm từ khác số lượng từ
  const singleScore = calculateSingleWordSimilarity(s1, s2);

  // Toàn chuỗi Levenshtein
  const maxLen = Math.max(s1.length, s2.length);
  const dist = levenshteinDistance(s1, s2);
  const fullLevScore = maxLen > 0 ? (maxLen - dist) / maxLen : 0;

  const finalScore = Math.max(singleScore, fullLevScore);
  return Math.min(100, Math.round(finalScore * 100));
}
