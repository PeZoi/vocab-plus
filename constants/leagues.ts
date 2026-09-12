export type LeagueTier =
  | 'unranked'
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'platinum'
  | 'emerald'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'challenger';

export type ZoneType = 'promotion' | 'safe' | 'demotion';

export interface LeagueTierMeta {
  key: LeagueTier;
  order: number;
  nameVi: string;
  nameEn: string;
  icon: string;
  lottieFile: string;
  defaultPromoteXp: number;
  defaultStayXp: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glowColor: string;
  gradientText: string;
  description: string;
}

export const LEAGUE_TIERS_CONFIG: Record<LeagueTier, LeagueTierMeta> = {
  unranked: {
    key: 'unranked',
    order: 0,
    nameVi: 'Chưa có rank',
    nameEn: 'Unranked',
    icon: '🔘',
    lottieFile: '/animations/ranks/unranked.json',
    defaultPromoteXp: 50,
    defaultStayXp: 0,
    badgeBg: 'bg-slate-500/15',
    badgeText: 'text-slate-400',
    badgeBorder: 'border-slate-500/30',
    glowColor: 'rgba(148, 163, 184, 0.25)',
    gradientText: 'from-slate-400 to-slate-200',
    description: 'Học viên mới gia nhập, tích lũy điểm để tiến vào đấu trường Sắt.',
  },
  iron: {
    key: 'iron',
    order: 1,
    nameVi: 'Sắt',
    nameEn: 'Iron',
    icon: '⚔️',
    lottieFile: '/animations/ranks/iron.json',
    defaultPromoteXp: 120,
    defaultStayXp: 30,
    badgeBg: 'bg-zinc-500/15',
    badgeText: 'text-zinc-300',
    badgeBorder: 'border-zinc-500/30',
    glowColor: 'rgba(161, 161, 170, 0.35)',
    gradientText: 'from-zinc-400 via-zinc-200 to-zinc-400',
    description: 'Bậc tôi luyện ý chí sắt đá, nền tảng cho hành trình chinh phục.',
  },
  bronze: {
    key: 'bronze',
    order: 2,
    nameVi: 'Đồng',
    nameEn: 'Bronze',
    icon: '🥉',
    lottieFile: '/animations/ranks/bronze.json',
    defaultPromoteXp: 180,
    defaultStayXp: 50,
    badgeBg: 'bg-amber-800/20',
    badgeText: 'text-amber-500',
    badgeBorder: 'border-amber-700/40',
    glowColor: 'rgba(217, 119, 6, 0.35)',
    gradientText: 'from-amber-600 via-amber-400 to-amber-700',
    description: 'Ánh đồng kiên cố, chứng minh sự chăm chỉ học tập mỗi ngày.',
  },
  silver: {
    key: 'silver',
    order: 3,
    nameVi: 'Bạc',
    nameEn: 'Silver',
    icon: '🥈',
    lottieFile: '/animations/ranks/silver.json',
    defaultPromoteXp: 250,
    defaultStayXp: 80,
    badgeBg: 'bg-slate-300/15',
    badgeText: 'text-slate-200',
    badgeBorder: 'border-slate-300/40',
    glowColor: 'rgba(226, 232, 240, 0.4)',
    gradientText: 'from-slate-200 via-white to-slate-300',
    description: 'Bạc sáng Demacia, phong độ ổn định và kiến thức từ vựng vững vàng.',
  },
  platinum: {
    key: 'platinum',
    order: 4,
    nameVi: 'Bạch Kim',
    nameEn: 'Platinum',
    icon: '💿',
    lottieFile: '/animations/ranks/platinum.json',
    defaultPromoteXp: 350,
    defaultStayXp: 120,
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/40',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    gradientText: 'from-cyan-300 via-teal-200 to-cyan-400',
    description: 'Kim loại quý Piltover thanh khiết, phản xạ từ vựng sắc bén.',
  },
  emerald: {
    key: 'emerald',
    order: 5,
    nameVi: 'Lục Bảo',
    nameEn: 'Emerald',
    icon: '❇️',
    lottieFile: '/animations/ranks/emerald.json',
    defaultPromoteXp: 480,
    defaultStayXp: 180,
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/40',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    gradientText: 'from-emerald-400 via-green-200 to-emerald-500',
    description: 'Ngọc bích Ionia tinh xảo, phản xạ ngôn ngữ như bản năng tự nhiên.',
  },
  diamond: {
    key: 'diamond',
    order: 6,
    nameVi: 'Kim Cương',
    nameEn: 'Diamond',
    icon: '💎',
    lottieFile: '/animations/ranks/diamond.json',
    defaultPromoteXp: 650,
    defaultStayXp: 260,
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-400/40',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    gradientText: 'from-blue-400 via-cyan-200 to-blue-500',
    description: 'Tinh thể kim cương vĩnh cửu Freljord, bậc cao thủ xuất sắc của cộng đồng.',
  },
  master: {
    key: 'master',
    order: 7,
    nameVi: 'Cao Thủ',
    nameEn: 'Master',
    icon: '🔮',
    lottieFile: '/animations/ranks/master.json',
    defaultPromoteXp: 850,
    defaultStayXp: 380,
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400/40',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    gradientText: 'from-purple-400 via-fuchsia-200 to-purple-600',
    description: 'Ma thuật Hư Không huyền bí, đẳng cấp vượt trội được ngưỡng mộ.',
  },
  grandmaster: {
    key: 'grandmaster',
    order: 8,
    nameVi: 'Đại Cao Thủ',
    nameEn: 'Grandmaster',
    icon: '🔱',
    lottieFile: '/animations/ranks/grandmaster.json',
    defaultPromoteXp: 1100,
    defaultStayXp: 550,
    badgeBg: 'bg-red-500/15',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/40',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    gradientText: 'from-red-500 via-rose-300 to-red-600',
    description: 'Huyết thạch rực lửa Noxus, sức mạnh học thuật bền bỉ và khủng khiếp.',
  },
  challenger: {
    key: 'challenger',
    order: 9,
    nameVi: 'Thách Đấu',
    nameEn: 'Challenger',
    icon: '👑',
    lottieFile: '/animations/ranks/challenger.json',
    defaultPromoteXp: 0, // Đỉnh cao tối thượng, không thăng hạng nữa
    defaultStayXp: 750,
    badgeBg: 'bg-amber-400/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/50',
    glowColor: 'rgba(251, 191, 36, 0.7)',
    gradientText: 'from-yellow-300 via-amber-100 to-amber-400',
    description: 'Vương miện hoàng kim Targon tối thượng, huyền thoại sống của giải đấu!',
  },
};

export const LEAGUE_TIER_ORDER: LeagueTier[] = [
  'unranked',
  'iron',
  'bronze',
  'silver',
  'platinum',
  'emerald',
  'diamond',
  'master',
  'grandmaster',
  'challenger',
];

export function getNextTier(current: LeagueTier): LeagueTier | null {
  const currentIndex = LEAGUE_TIER_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex >= LEAGUE_TIER_ORDER.length - 1) {
    return null;
  }
  return LEAGUE_TIER_ORDER[currentIndex + 1];
}

export function getPreviousTier(current: LeagueTier): LeagueTier | null {
  const currentIndex = LEAGUE_TIER_ORDER.indexOf(current);
  if (currentIndex <= 1) {
    // Sắt hoặc Chưa có rank không bị giáng xuống thêm
    return current === 'iron' ? 'iron' : 'unranked';
  }
  return LEAGUE_TIER_ORDER[currentIndex - 1];
}
