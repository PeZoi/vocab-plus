'use client';

import { ROUTES } from '@/constants/routes';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import { UserAvatar } from '@/components/common/user-avatar';
import { LeagueBadge } from '@/components/features/leaderboard/league-badge';
import type { LeagueTier } from '@/constants/leagues';
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
      href: ROUTES.APP.IMPORT,
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
                    ? 'bg-brand/12 text-brand font-semibold border border-brand/25 shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/70 hover:translate-x-0.5'
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
                    ? 'bg-brand/12 text-brand font-semibold border border-brand/25 shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/70 hover:translate-x-0.5'
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
                    ? 'bg-brand/12 text-brand font-semibold border border-brand/25 shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/70 hover:translate-x-0.5'
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
                      ? 'bg-brand/12 text-brand font-semibold border border-brand/25 shadow-2xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/70 hover:translate-x-0.5'
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

      {/* FOOTER: Thông tin User, Avatar, Tên & Bậc Rank */}
      <div className="pt-2.5 mt-2 border-t border-border/70 shrink-0">
        <Link
          href={ROUTES.APP.PROFILE}
          className={cn(
            'flex items-center gap-2.5 p-2 rounded-xl border transition-all group select-none shadow-2xs',
            pathname === ROUTES.APP.PROFILE
              ? 'bg-brand/10 border-brand/40 text-brand'
              : 'bg-surface/50 border-border/60 hover:bg-surface/90 hover:border-brand/30 text-text-secondary hover:text-text-primary'
          )}
          title="Xem hồ sơ cá nhân"
        >
          <UserAvatar
            src={profile?.avatar_url}
            name={profile?.display_name || 'Học viên'}
            size="sm"
            className="ring-1 ring-border group-hover:ring-brand/40 transition-all shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
                {profile?.display_name || 'Học viên'}
              </p>
              {isAdmin && (
                <span className="text-[9px] font-bold text-brand bg-brand/10 px-1 py-0.2 rounded border border-brand/20 shrink-0">
                  Admin
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center">
              <LeagueBadge tier={userTier} size="sm" className="scale-90 origin-left py-0" />
            </div>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-text-secondary/60 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
