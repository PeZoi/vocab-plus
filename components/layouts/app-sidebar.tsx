'use client';

import { ROUTES } from '@/constants/routes';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import { UserAvatar } from '@/components/common/user-avatar';
import { RankCrestIcon } from '@/components/features/leaderboard/rank-crest-icon';
import { LEAGUE_TIERS_CONFIG, type LeagueTier } from '@/constants/leagues';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  BookOpenText,
  CalendarClock,
  ChevronRight,
  Cpu,
  FolderKanban,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Plus,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useReviewStats();
  const { profile, isAdmin } = useUserProfile();
  const dueCount = data?.stats.due_count || 0;
  const userTier: LeagueTier = profile?.league || 'unranked';
  const tierConfig = LEAGUE_TIERS_CONFIG[userTier] || LEAGUE_TIERS_CONFIG.unranked;

  // Nhóm 1: Học tập & Luyện tập cốt lõi
  const learningNavItems = [
    {
      label: 'Tổng quan',
      href: ROUTES.APP.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: 'Học từ vựng',
      href: ROUTES.APP.REVIEW,
      icon: Layers,
      badge: dueCount > 0 ? dueCount : undefined,
    },
    {
      label: 'Ôn tập & Kiểm tra',
      href: ROUTES.APP.PRACTICE,
      icon: GraduationCap,
    },
  ];

  // Nhóm 2: Kho từ vựng & Sáng tạo nội dung (Tạo story)
  const contentNavItems = [
    {
      label: 'Kho từ vựng',
      href: ROUTES.APP.VOCAB,
      icon: BookOpen,
    },
    {
      label: 'Bộ sưu tập',
      href: ROUTES.APP.COLLECTIONS,
      icon: FolderKanban,
    },
    {
      label: 'Tạo story',
      href: ROUTES.APP.STORY,
      icon: BookOpenText,
      tag: 'AI',
    },
  ];

  // Nhóm 3: Xã hội & Cá nhân
  const secondaryNavItems = [
    {
      label: 'Bảng xếp hạng',
      href: ROUTES.APP.LEADERBOARD,
      icon: Trophy,
    },
    {
      label: 'Cài đặt',
      href: ROUTES.APP.SETTINGS,
      icon: Settings,
    },
  ];

  // Nhóm 4: Quản trị Admin (Chỉ hiển thị với Admin)
  const adminNavItems = [
    {
      label: 'Quản lý người dùng',
      href: ROUTES.ADMIN.USERS,
      icon: Users,
      matchPrefix: true,
    },
    {
      label: 'Cấu hình AI hệ thống',
      href: ROUTES.ADMIN.AI_PROVIDERS,
      icon: Cpu,
    },
    {
      label: 'Cài đặt hệ thống',
      href: ROUTES.ADMIN.SETTINGS,
      icon: Sliders,
    },
    {
      label: 'Quản lý Cron Jobs',
      href: ROUTES.ADMIN.CRON_JOBS,
      icon: CalendarClock,
    },
  ];

  const isAddActive = pathname === ROUTES.APP.ADD;

  return (
    <aside className="hidden md:flex flex-col w-60 fixed top-16 left-0 bottom-0 border-r border-border/80 bg-base p-3 z-30 select-none">
      {/* KHỐI CTA ĐẶC BIỆT: Nút Thêm Từ Vựng Nổi Bật Siêu Cấp */}
      <div className="mb-3 shrink-0">
        <Link
          href={ROUTES.APP.ADD}
          prefetch={true}
          className={cn(
            'group relative flex items-center justify-between w-full px-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white transition-all duration-200 shadow-md outline-none overflow-hidden',
            isAddActive
              ? 'bg-gradient-to-r from-orange-500 via-brand to-amber-500 shadow-brand/35 ring-2 ring-brand ring-offset-2 ring-offset-base scale-[1.01]'
              : 'bg-gradient-to-r from-brand via-orange-500 to-amber-500 hover:from-brand-hover hover:via-orange-600 hover:to-amber-600 shadow-brand/20 hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.02] active:scale-[0.98]'
          )}
        >
          {/* Hiệu ứng ánh sáng bóng loáng khi hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/25 shadow-xs group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="tracking-tight drop-shadow-xs truncate font-bold">
              Thêm từ vựng
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-white/25 shadow-2xs shrink-0">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span className="text-white/95">AI</span>
          </div>
        </Link>
      </div>

      {/* Danh sách Menu cuộn độc lập với thanh cuộn tinh tế */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-0.5">
        {/* NHÓM 1: HỌC TẬP */}
        <div className="space-y-1">
          <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
            Học tập
          </p>
          {learningNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all group outline-none',
                  isActive
                    ? 'bg-brand/10 text-brand font-semibold shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/70 hover:translate-x-0.5'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors shrink-0',
                      isActive ? 'text-brand' : 'text-text-secondary group-hover:text-text-primary'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand text-white shadow-xs animate-pulse shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* NHÓM 2: NỘI DUNG & SÁNG TẠO */}
        <div className="space-y-1">
          <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
            Nội dung
          </p>
          {contentNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all group outline-none',
                  isActive
                    ? 'bg-brand/10 text-brand font-semibold shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/70 hover:translate-x-0.5'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors shrink-0',
                      isActive ? 'text-brand' : 'text-text-secondary group-hover:text-text-primary'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.tag && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 tracking-wider shrink-0">
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* NHÓM 3: XÃ HỘI & HỆ THỐNG */}
        <div className="space-y-1">
          <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
            Khác
          </p>
          {secondaryNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all group outline-none',
                  isActive
                    ? 'bg-brand/10 text-brand font-semibold shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/70 hover:translate-x-0.5'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors shrink-0',
                      isActive ? 'text-brand' : 'text-text-secondary group-hover:text-text-primary'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* NHÓM 4: QUẢN TRỊ ADMIN (Chỉ hiển thị với Admin) */}
        {isAdmin && (
          <div className="pt-2 border-t border-border/60 space-y-1">
            <div className="px-2.5 flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
                Quản trị
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] text-brand font-semibold bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
                <ShieldCheck className="w-2.5 h-2.5" />
                Admin
              </span>
            </div>

            {adminNavItems.map((item) => {
              const isActive = item.matchPrefix
                ? pathname.startsWith(item.href)
                : pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium transition-all group outline-none',
                    isActive
                      ? 'bg-brand/10 text-brand font-semibold shadow-2xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/70 hover:translate-x-0.5'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors shrink-0',
                        isActive ? 'text-brand' : 'text-text-secondary group-hover:text-text-primary'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER: Thông tin User, Avatar, Tên, Role & Bậc Rank */}
      <div className="pt-2 mt-auto border-t border-border/60 shrink-0">
        <Link
          href={ROUTES.APP.PROFILE}
          className={cn(
            'group relative flex items-center gap-2.5 p-2 rounded-2xl border transition-all duration-200 select-none overflow-hidden outline-none',
            pathname === ROUTES.APP.PROFILE
              ? 'bg-gradient-to-br from-brand/10 via-brand/5 to-surface border-brand/40 shadow-xs'
              : 'bg-surface/70 hover:bg-surface border-border/70 hover:border-brand/40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(234,88,12,0.08)] dark:shadow-none'
          )}
          title="Xem hồ sơ cá nhân"
        >
          {/* Avatar với Gradient Ring & Online Dot */}
          <div className="relative shrink-0">
            <div className="p-[1.5px] rounded-full bg-gradient-to-tr from-brand/50 via-amber-400/40 to-orange-500/30 group-hover:from-brand group-hover:to-amber-400 transition-all duration-300 shadow-2xs">
              <UserAvatar
                src={profile?.avatar_url}
                name={profile?.display_name || 'Học viên'}
                size="sm"
                className="w-8 h-8 rounded-full bg-surface border border-white/80 dark:border-white/10"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface shadow-xs" />
          </div>

          {/* User Info (Tên, Role, Rank & XP) */}
          <div className="min-w-0 flex-1">
            {/* Hàng 1: Tên đầy đủ hiển thị trọn vẹn kèm huy hiệu verified */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-text-primary truncate tracking-tight group-hover:text-brand transition-colors">
                {profile?.display_name || 'Học viên'}
              </span>
              {isAdmin && (
                <span title="Quản trị viên" className="inline-flex shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                </span>
              )}
            </div>

            {/* Hàng 2: Bậc Rank & Huy hiệu Admin hoặc XP */}
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider border shadow-2xs transition-colors backdrop-blur-xs',
                  tierConfig.badgeBg,
                  tierConfig.badgeBorder,
                  tierConfig.badgeText
                )}
              >
                <RankCrestIcon
                  tier={userTier}
                  size="xs"
                  animated={false}
                  showGlow={false}
                  className="w-3.5 h-3.5 shrink-0"
                />
                <span>{tierConfig.nameVi}</span>
              </span>

              {isAdmin ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                  Admin
                </span>
              ) : (
                typeof profile?.xp === 'number' && profile.xp > 0 && (
                  <span className="text-[10px] font-semibold text-text-secondary/70 truncate">
                    {profile.xp.toLocaleString('vi-VN')} XP
                  </span>
                )
              )}
            </div>
          </div>

          {/* Chevron Action */}
          <ChevronRight className="w-3.5 h-3.5 text-text-secondary/40 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
