export interface ReviewXpRates {
  per_card: number;
  again?: number;
  hard?: number;
  good?: number;
  easy?: number;
}

export interface PracticeXpRates {
  multiple_choice: number;
  cloze: number;
  sentence_writing: number;
  perfect_bonus: number;
}

export const DEFAULT_REVIEW_XP_RATES: ReviewXpRates = {
  per_card: 1,
};

export const DEFAULT_PRACTICE_XP_RATES: PracticeXpRates = {
  multiple_choice: 10,
  cloze: 15,
  sentence_writing: 20,
  perfect_bonus: 10,
};

export type LevelColorTheme = 'slate' | 'lime' | 'emerald' | 'teal' | 'rose' | 'amber';

export interface LevelThresholdConfig {
  level: number; // 0, 1, 2, 3, 4, 5
  name: string; // "Hạt mầm", "Nảy mầm", "Nhánh non", "Cây xanh", "Nở hoa", "Đại thụ"
  nameEn: string; // "Seed", "Sprout", "Sapling", "Green Tree", "Blossom", "Ancient Tree"
  icon: string; // "🌰", "🌱", "🌿", "🌳", "🌸", "👑"
  lottieKey: string; // "seed" | "sprout" | "sapling" | "tree" | "blossom" | "ancient-tree"
  colorTheme: LevelColorTheme;
  minConsecutiveCorrect: number; // 0, 1, 2, 3, 5, 8
  minStabilityDays: number; // 0, 1, 3, 7, 21, 60
  description: string;
}

export type LevelPenaltyRule = 'drop_one' | 'drop_to_zero';

export interface VocabLevelSettings {
  penaltyRule: LevelPenaltyRule;
  allowLevelUpInCasualMode: boolean; // false
  levels: LevelThresholdConfig[];
}

export const DEFAULT_VOCAB_LEVEL_SETTINGS: VocabLevelSettings = {
  penaltyRule: 'drop_one',
  allowLevelUpInCasualMode: false,
  levels: [
    {
      level: 0,
      name: 'Hạt mầm',
      nameEn: 'Seed',
      icon: '🌰',
      lottieKey: 'seed',
      colorTheme: 'slate',
      minConsecutiveCorrect: 0,
      minStabilityDays: 0,
      description: 'Trạng thái tiềm năng, vừa thêm từ vào kho',
    },
    {
      level: 1,
      name: 'Nảy mầm',
      nameEn: 'Sprout',
      icon: '🌱',
      lottieKey: 'sprout',
      colorTheme: 'lime',
      minConsecutiveCorrect: 1,
      minStabilityDays: 1,
      description: 'Mầm xanh 2 lá non nhô lên, bước đi đầu tiên',
    },
    {
      level: 2,
      name: 'Nhánh non',
      nameEn: 'Sapling',
      icon: '🌿',
      lottieKey: 'sapling',
      colorTheme: 'emerald',
      minConsecutiveCorrect: 2,
      minStabilityDays: 3,
      description: 'Cây nhỏ có cành lá cứng cáp, hình thành phản xạ',
    },
    {
      level: 3,
      name: 'Cây xanh',
      nameEn: 'Green Tree',
      icon: '🌳',
      lottieKey: 'tree',
      colorTheme: 'teal',
      minConsecutiveCorrect: 3,
      minStabilityDays: 7,
      description: 'Cây trưởng thành, tán lá tròn, vững vàng',
    },
    {
      level: 4,
      name: 'Nở hoa',
      nameEn: 'Blossom',
      icon: '🌸',
      lottieKey: 'blossom',
      colorTheme: 'rose',
      minConsecutiveCorrect: 5,
      minStabilityDays: 21,
      description: 'Cây đơm hoa kết trái sum suê, đạt thành tích cao',
    },
    {
      level: 5,
      name: 'Đại thụ',
      nameEn: 'Ancient Tree',
      icon: '👑',
      lottieKey: 'ancient-tree',
      colorTheme: 'amber',
      minConsecutiveCorrect: 8,
      minStabilityDays: 60,
      description: 'Cây cổ thụ tán rộng tỏa hào quang, bậc thầy uy tín',
    },
  ],
};

