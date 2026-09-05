import type { CollectionCategory } from '@/types/collection.types';

export interface CategoryInfo {
  id: CollectionCategory;
  label: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  gradient: string;
  iconName: string;
}

export const COLLECTION_CATEGORIES: CategoryInfo[] = [
  {
    id: 'ielts',
    label: 'IELTS',
    description: 'Từ vựng trọng tâm IELTS theo band điểm và chủ đề',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
    badgeBorder: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-orange-500/20',
    iconName: 'GraduationCap',
  },
  {
    id: 'toeic',
    label: 'TOEIC',
    description: 'Từ vựng văn phòng, công sở và đề thi TOEIC thực chiến',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconName: 'Briefcase',
  },
  {
    id: 'toefl',
    label: 'TOEFL',
    description: 'Từ vựng học thuật chuyên sâu phục vụ thi TOEFL iBT',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/30',
    gradient: 'from-indigo-500/20 to-violet-500/20',
    iconName: 'BookMarked',
  },
  {
    id: 'daily_communication',
    label: 'Giao tiếp hàng ngày',
    description: 'Từ vựng, câu nói thông dụng trong đời sống sinh hoạt',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconName: 'MessageCircle',
  },
  {
    id: 'business',
    label: 'Kinh doanh & Thương mại',
    description: 'Từ vựng kinh tế, tài chính, đàm phán và email thương mại',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/30',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconName: 'TrendingUp',
  },
  {
    id: 'academic',
    label: 'Học thuật & Nghiên cứu',
    description: 'Từ vựng học thuật, viết luận văn và báo cáo khoa học',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-400',
    badgeBorder: 'border-purple-500/30',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconName: 'Award',
  },
  {
    id: 'travel',
    label: 'Du lịch & Khám phá',
    description: 'Hành lý, sân bay, khách sạn, nhà hàng và chỉ đường',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-400',
    badgeBorder: 'border-teal-500/30',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    iconName: 'Compass',
  },
  {
    id: 'slang_idioms',
    label: 'Thành ngữ & Tiếng lóng',
    description: 'Idioms, phrasal verbs và tiếng lóng tự nhiên của người bản xứ',
    badgeBg: 'bg-fuchsia-500/15',
    badgeText: 'text-fuchsia-400',
    badgeBorder: 'border-fuchsia-500/30',
    gradient: 'from-fuchsia-500/20 to-purple-500/20',
    iconName: 'Sparkles',
  },
  {
    id: 'other',
    label: 'Chủ đề khác',
    description: 'Các bộ từ vựng tổng hợp và phân loại tự do',
    badgeBg: 'bg-slate-500/15',
    badgeText: 'text-slate-400',
    badgeBorder: 'border-slate-500/30',
    gradient: 'from-slate-500/20 to-zinc-500/20',
    iconName: 'Folder',
  },
];

export const COLLECTION_CATEGORY_MAP: Record<CollectionCategory, CategoryInfo> =
  COLLECTION_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    },
    {} as Record<CollectionCategory, CategoryInfo>
  );

export const COLLECTION_CATEGORY_SELECT_OPTIONS: { value: CollectionCategory; label: string }[] =
  COLLECTION_CATEGORIES.map((cat) => ({
    value: cat.id,
    label: cat.label,
  }));

export const COLLECTION_CATEGORY_FILTER_OPTIONS: { value: CollectionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả danh mục' },
  ...COLLECTION_CATEGORY_SELECT_OPTIONS,
];
