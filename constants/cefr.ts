import type { CEFRLevel } from '@/types/card.types';

export interface CEFRLevelConfig {
  level: CEFRLevel;
  label: string; // "Căn bản", "Sơ cấp", "Trung cấp", "Trung cao cấp", "Cao cấp", "Thành thạo"
  fullName: string; // "A1 - Căn bản"
  bg: string;
  text: string;
  border: string;
  barColor: string;
}

export const CEFR_LEVELS_LIST: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_LEVELS_CONFIG: Record<CEFRLevel, CEFRLevelConfig> = {
  A1: {
    level: 'A1',
    label: 'Căn bản',
    fullName: 'A1 - Căn bản',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    barColor: 'bg-emerald-500',
  },
  A2: {
    level: 'A2',
    label: 'Sơ cấp',
    fullName: 'A2 - Sơ cấp',
    bg: 'bg-teal-500/15',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
    barColor: 'bg-teal-500',
  },
  B1: {
    level: 'B1',
    label: 'Trung cấp',
    fullName: 'B1 - Trung cấp',
    bg: 'bg-sky-500/15',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    barColor: 'bg-sky-500',
  },
  B2: {
    level: 'B2',
    label: 'Trung cao cấp',
    fullName: 'B2 - Trung cao cấp',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    barColor: 'bg-blue-500',
  },
  C1: {
    level: 'C1',
    label: 'Cao cấp',
    fullName: 'C1 - Cao cấp',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    barColor: 'bg-purple-500',
  },
  C2: {
    level: 'C2',
    label: 'Thành thạo',
    fullName: 'C2 - Thành thạo',
    bg: 'bg-fuchsia-500/15',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500/30',
    barColor: 'bg-fuchsia-500',
  },
};

export const CEFR_SELECT_OPTIONS: { value: CEFRLevel | 'none'; label: string }[] = [
  { value: 'none', label: 'Chưa xác định' },
  ...CEFR_LEVELS_LIST.map((lvl) => ({
    value: lvl,
    label: CEFR_LEVELS_CONFIG[lvl].fullName,
  })),
];

export const CEFR_FILTER_OPTIONS: { value: CEFRLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả cấp độ' },
  ...CEFR_LEVELS_LIST.map((lvl) => ({
    value: lvl,
    label: CEFR_LEVELS_CONFIG[lvl].fullName,
  })),
];
