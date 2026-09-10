import type { CardType, CEFRLevel, PartOfSpeech } from '@/types/card.types';

export const VALID_PARTS_OF_SPEECH: readonly PartOfSpeech[] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'pronoun',
  'interjection',
] as const;

export const VALID_CARD_TYPES: readonly CardType[] = [
  'word',
  'phrasal_verb',
  'idiom',
] as const;

export const VALID_CEFR_LEVELS: readonly CEFRLevel[] = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
] as const;

/**
 * Chuẩn hóa giá trị Part of Speech về 1 trong 8 loại từ vựng chuẩn của tiếng Anh
 * Xử lý các biến thể AI thường trả về như: "adjective phrase", "phrasal verb", "adv.", "adj."...
 */
export function normalizePartOfSpeech(pos: unknown): PartOfSpeech | null {
  if (!pos || typeof pos !== 'string') return null;
  const clean = pos.trim().toLowerCase();

  // 1. Trùng khớp chính xác
  if (VALID_PARTS_OF_SPEECH.includes(clean as PartOfSpeech)) {
    return clean as PartOfSpeech;
  }

  // 2. Nhận diện các biến thể cụm từ hoặc viết tắt
  if (clean.includes('adj') || clean === 'a.') {
    return 'adjective';
  }
  if (clean.includes('adv') || clean === 'adv.') {
    return 'adverb';
  }
  if (
    clean.includes('verb') ||
    clean === 'v.' ||
    clean === 'vi' ||
    clean === 'vt' ||
    clean === 'vi.' ||
    clean === 'vt.'
  ) {
    return 'verb';
  }
  if (clean.includes('noun') || clean === 'n.') {
    return 'noun';
  }
  if (clean.includes('prep')) {
    return 'preposition';
  }
  if (clean.includes('conj')) {
    return 'conjunction';
  }
  if (clean.includes('pron')) {
    return 'pronoun';
  }
  if (clean.includes('interj') || clean.includes('exclamation')) {
    return 'interjection';
  }

  // Nếu là cụm từ chung chung (phrase, idiom) không xác định được head word
  return null;
}

/**
 * Chuẩn hóa Card Type ('word' | 'phrasal_verb' | 'idiom')
 */
export function normalizeCardType(
  type: unknown,
  word?: string | null,
  rawPos?: string | null
): CardType {
  if (typeof type === 'string') {
    const clean = type.trim().toLowerCase();
    if (VALID_CARD_TYPES.includes(clean as CardType)) {
      return clean as CardType;
    }
    if (clean.includes('phrasal')) {
      return 'phrasal_verb';
    }
    if (clean.includes('idiom') || clean.includes('proverb')) {
      return 'idiom';
    }
  }

  // Nếu rawPos chứa phrasal verb
  if (typeof rawPos === 'string' && rawPos.toLowerCase().includes('phrasal')) {
    return 'phrasal_verb';
  }

  // Tự động nhận diện nếu từ có nhiều hơn 1 từ
  if (word && typeof word === 'string' && word.trim().split(/\s+/).length > 1) {
    const rawPosLower = typeof rawPos === 'string' ? rawPos.toLowerCase() : '';
    if (rawPosLower.includes('verb') || rawPosLower.includes('phrasal')) {
      return 'phrasal_verb';
    }
    return 'idiom';
  }

  return 'word';
}

/**
 * Chuẩn hóa CEFR Level ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')
 */
export function normalizeCEFRLevel(level: unknown): CEFRLevel | null {
  if (!level || typeof level !== 'string') return null;
  const upper = level.trim().toUpperCase() as CEFRLevel;
  if (VALID_CEFR_LEVELS.includes(upper)) {
    return upper;
  }
  return null;
}
