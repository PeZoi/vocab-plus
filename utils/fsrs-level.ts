import type { UserCard } from '@/types/card.types';
import type { ReviewCardItem, ReviewRating } from '@/types/review.types';
import {
  DEFAULT_VOCAB_LEVEL_SETTINGS,
  type LevelColorTheme,
  type LevelThresholdConfig,
  type VocabLevelSettings,
} from '@/types/system-settings.types';

export interface WordLevelInfo {
  level: number; // 0, 1, 2, 3, 4, 5
  name: string; // Tên tiếng Việt (Hạt mầm, Nảy mầm...)
  nameEn: string; // Tên tiếng Anh (Seed, Sprout...)
  icon: string; // Emoji / Icon fallback
  lottieKey: string; // "seed" | "sprout" | ...
  colorTheme: LevelColorTheme;
  colorClasses: {
    bg: string;
    text: string;
    border: string;
    ring: string;
    glow: string;
  };
  progressPercent: number; // 0 - 100% đến level tiếp theo
  currentCount: number; // Số lần test đúng
  nextTargetCount: number; // Mục tiêu lần đúng cho level tiếp theo
  stabilityDays: number;
  description: string;
  isMaxLevel: boolean;
}

/**
 * Bảng ánh xạ màu sắc chuẩn theo token dark theme cho từng bộ màu
 */
export const LEVEL_COLOR_MAP: Record<
  LevelColorTheme,
  { bg: string; text: string; border: string; ring: string; glow: string }
> = {
  slate: {
    bg: 'bg-slate-500/10 hover:bg-slate-500/15',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    ring: 'ring-slate-500/30',
    glow: 'rgba(148, 163, 184, 0.25)',
  },
  lime: {
    bg: 'bg-lime-500/10 hover:bg-lime-500/15',
    text: 'text-lime-400',
    border: 'border-lime-500/30',
    ring: 'ring-lime-500/30',
    glow: 'rgba(163, 230, 53, 0.35)',
  },
  emerald: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/30',
    glow: 'rgba(52, 211, 153, 0.35)',
  },
  teal: {
    bg: 'bg-teal-500/10 hover:bg-teal-500/15',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
    ring: 'ring-teal-500/30',
    glow: 'rgba(45, 212, 191, 0.35)',
  },
  rose: {
    bg: 'bg-rose-500/10 hover:bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500/30',
    glow: 'rgba(251, 113, 133, 0.4)',
  },
  amber: {
    bg: 'bg-amber-500/15 hover:bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    ring: 'ring-amber-500/40',
    glow: 'rgba(251, 191, 36, 0.5)',
  },
};

/**
 * Tính toán Cấp độ Cây Sinh Trưởng (0 -> 5) cho một từ vựng
 * Dựa trên cấu hình Admin (hoặc mặc định) kết hợp số lần đúng liên tiếp và độ bền FSRS
 */
export function calculateWordLevel(
  userCard: UserCard | null | undefined,
  config: VocabLevelSettings = DEFAULT_VOCAB_LEVEL_SETTINGS
): WordLevelInfo {
  const levels = config.levels || DEFAULT_VOCAB_LEVEL_SETTINGS.levels;

  // Nếu thẻ mới tạo chưa có tiến trình học
  if (!userCard || userCard.state === 'new' || !userCard.review_count) {
    const lvl0 = levels[0] || DEFAULT_VOCAB_LEVEL_SETTINGS.levels[0];
    const lvl1 = levels[1] || DEFAULT_VOCAB_LEVEL_SETTINGS.levels[1];
    return {
      level: 0,
      name: lvl0.name,
      nameEn: lvl0.nameEn,
      icon: lvl0.icon,
      lottieKey: lvl0.lottieKey || 'seed',
      colorTheme: lvl0.colorTheme,
      colorClasses: LEVEL_COLOR_MAP[lvl0.colorTheme] || LEVEL_COLOR_MAP.slate,
      progressPercent: 0,
      currentCount: 0,
      nextTargetCount: lvl1.minConsecutiveCorrect,
      stabilityDays: 0,
      description: lvl0.description,
      isMaxLevel: false,
    };
  }

  const reviewCount = Number(userCard.review_count) || 0;
  const lapseCount = Number(userCard.lapse_count) || 0;
  const stability = Number(userCard.stability) || 0;

  // Ước tính số lần test đúng thực tế (net positive reviews)
  const netCorrect = Math.max(0, reviewCount - lapseCount);

  // Tìm level cao nhất mà từ này thỏa mãn điều kiện
  // Duyệt từ Level 5 xuống Level 1: Phải đạt đủ số lần đúng yêu cầu (minConsecutiveCorrect) của Admin
  let matchedConfig: LevelThresholdConfig = levels[0];
  let matchedIndex = 0;

  for (let i = levels.length - 1; i >= 1; i--) {
    const lvl = levels[i];
    const meetsCorrect = netCorrect >= lvl.minConsecutiveCorrect;

    if (meetsCorrect) {
      matchedConfig = lvl;
      matchedIndex = i;
      break;
    }
  }

  const isMax = matchedIndex >= levels.length - 1;
  const nextLvl = !isMax ? levels[matchedIndex + 1] : null;

  // Tính % tiến độ tới level tiếp theo
  let progressPercent = 100;
  let nextTargetCount = levels[1]?.minConsecutiveCorrect || 1;

  if (nextLvl) {
    nextTargetCount = nextLvl.minConsecutiveCorrect;
    // Level 0 có base là 0
    const currentBase = matchedIndex === 0 ? 0 : matchedConfig.minConsecutiveCorrect;
    const gap = Math.max(1, nextTargetCount - currentBase);
    const earnedInGap = Math.max(0, netCorrect - currentBase);
    progressPercent = Math.min(99, Math.round((earnedInGap / gap) * 100));
  }

  return {
    level: matchedConfig.level,
    name: matchedConfig.name,
    nameEn: matchedConfig.nameEn,
    icon: matchedConfig.icon,
    lottieKey: matchedConfig.lottieKey || 'seed',
    colorTheme: matchedConfig.colorTheme,
    colorClasses: LEVEL_COLOR_MAP[matchedConfig.colorTheme] || LEVEL_COLOR_MAP.slate,
    progressPercent,
    currentCount: netCorrect,
    nextTargetCount,
    stabilityDays: Math.round(stability),
    description: matchedConfig.description,
    isMaxLevel: isMax,
  };
}

/**
 * Kiểm tra xem một thẻ từ vựng có đủ điều kiện thăng/hạ cấp trong phiên hay không
 * QUY TẮC: Chỉ từ đang đến hạn (isDue === true) hoặc thẻ mới học (Level 0) mới được thăng cấp!
 */
export function canCardLevelUp(
  cardItem: ReviewCardItem,
  isCustomSession: boolean = false
): boolean {
  // Nếu là Custom Study Session (ôn theo bộ từ/tag mà không phải phiên due)
  if (isCustomSession) {
    // Chỉ cho phép nếu từ đó tình cờ cũng đang đến hạn ôn tập
    const userCard = cardItem.user_card;
    if (!userCard || !userCard.due_at) return false;
    const isDue = new Date(userCard.due_at).getTime() <= Date.now();
    return isDue;
  }

  // Trong phiên review chính (/review):
  // 1. Thẻ mới tinh (chưa có user_card hoặc state = new) -> CÓ THỂ lên cấp
  if (!cardItem.user_card || cardItem.user_card.state === 'new') {
    return true;
  }

  // 2. Thẻ đã có due_at và đã đến hạn ôn
  if (cardItem.user_card.due_at) {
    const isDue = new Date(cardItem.user_card.due_at).getTime() <= Date.now() + 60 * 1000; // Sai số 1 phút
    return isDue;
  }

  return false;
}

/**
 * Ánh xạ kết quả Quiz phản xạ sang thang điểm FSRS (1 - 4)
 * - Sai: Again (1)
 * - Trắc nghiệm đúng: Good (3) (tránh đoán mò trắc nghiệm làm méo mó độ khó)
 * - Tự luận / Gõ từ đúng nhanh (< 4000ms): Easy (4)
 */
export function mapQuizResultToFSRS(
  isCorrect: boolean,
  responseTimeMs: number = 0,
  questionType: string = 'multiple_choice'
): ReviewRating {
  if (!isCorrect) {
    return 1; // Again
  }

  // Trắc nghiệm nhiều lựa chọn: đúng được ghi nhận là Good (3) chuẩn mực
  if (questionType === 'multiple_choice') {
    return 3;
  }

  // Đối với câu hỏi tự luận / gõ từ / đặt câu: nếu gõ đúng và nhanh (< 4 giây) -> Easy (4)
  if (
    (questionType === 'typing' || questionType === 'sentence_writing' || questionType === 'cloze_typing') &&
    responseTimeMs > 0 &&
    responseTimeMs < 4000
  ) {
    return 4;
  }

  return 3; // Good
}

/**
 * Tính toán trạng thái thăng/hạ cấp khi có điểm số mới
 */
export function calculateLevelChange(
  oldLevel: number,
  newLevel: number
): 'up' | 'down' | 'same' {
  if (newLevel > oldLevel) return 'up';
  if (newLevel < oldLevel) return 'down';
  return 'same';
}
