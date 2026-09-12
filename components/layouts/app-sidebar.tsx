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
  Cpu,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sliders,
  Trophy,
  Users,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useReviewStats();
  const { profile, isAdmin } = useUserProfile();
  const dueCount = data?.stats.due_count || 0;
  const userTier: LeagueTier = profile?.league || 'unranked';

  const userNavItems = [
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
      label: 'Thêm từ vựng',
      href: ROUTES.APP.ADD,
      icon: PlusCircle,
    },
    {
      label: 'Import văn bản',
      href: ROUTES.APP.IMPORT,
      icon: FileText,
    },
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

  return (
    <aside className="hidden md:flex flex-col w-60 fixed top-16 left-0 bottom-0 border-r border-border/80 bg-base p-3 z-30">
      {/* Menu điều hướng cuộn độc lập */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
        {/* Menu người dùng thông thường */}
        <div className="space-y-1">
          {userNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors group outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none select-none',
                  isActive
                    ? 'bg-brand/12 text-brand font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-brand' : 'text-text-secondary group-hover:text-text-primary'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-brand/15 text-brand font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Khu vực chỉ dành cho Admin */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-border/60 space-y-1">
            <div className="px-3 flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Quản trị Admin
              </span>
              <span className="flex items-center gap-1 text-[9px] text-brand font-medium bg-brand/10 px-1.5 py-0.2 rounded border border-brand/20">
                <ShieldCheck className="w-2.5 h-2.5" />
                Admin
              </span>
            </div>

            <Link
              href={ROUTES.ADMIN.USERS}
              prefetch={true}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors group outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none select-none',
                pathname.startsWith(ROUTES.ADMIN.USERS)
                  ? 'bg-brand/12 text-brand font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Users
                  className={cn(
                    'w-4 h-4 transition-colors',
                    pathname.startsWith(ROUTES.ADMIN.USERS)
                      ? 'text-brand'
                      : 'text-text-secondary group-hover:text-text-primary'
                  )}
                />
                <span>Quản lý người dùng</span>
              </div>
            </Link>

            <Link
              href={ROUTES.ADMIN.AI_PROVIDERS}
              prefetch={true}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors group outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none select-none',
                pathname === ROUTES.ADMIN.AI_PROVIDERS
                  ? 'bg-brand/12 text-brand font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Cpu
                  className={cn(
                    'w-4 h-4 transition-colors',
                    pathname === ROUTES.ADMIN.AI_PROVIDERS
                      ? 'text-brand'
                      : 'text-text-secondary group-hover:text-text-primary'
                  )}
                />
                <span>Cấu hình AI hệ thống</span>
              </div>
            </Link>

            <Link
              href={ROUTES.ADMIN.SETTINGS}
              prefetch={true}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors group outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none select-none',
                pathname === ROUTES.ADMIN.SETTINGS
                  ? 'bg-brand/12 text-brand font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Sliders
                  className={cn(
                    'w-4 h-4 transition-colors',
                    pathname === ROUTES.ADMIN.SETTINGS
                      ? 'text-brand'
                      : 'text-text-secondary group-hover:text-text-primary'
                  )}
                />
                <span>Cài đặt hệ thống</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Footer: Thông tin User, Ảnh đại diện, Tên & Bậc Rank */}
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
