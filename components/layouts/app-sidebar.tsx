'use client';

import { ROUTES } from '@/constants/routes';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Cpu,
  FileText,
  FolderKanban,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldCheck,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();
  const { data } = useReviewStats();
  const { isAdmin } = useUserProfile();
  const dueCount = data?.stats.due_count || 0;

  const userNavItems = [
    {
      label: 'Tổng quan',
      href: ROUTES.APP.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      label: 'Ôn tập SRS',
      href: ROUTES.APP.REVIEW,
      icon: Layers,
      badge: dueCount > 0 ? dueCount : undefined,
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
    <aside className="hidden md:flex flex-col w-60 fixed top-16 left-0 bottom-0 border-r border-border/80 bg-base p-3 z-30 overflow-y-auto">
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
        </div>
      )}
    </aside>
  );
}
