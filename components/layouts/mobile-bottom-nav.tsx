'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Layers, PlusCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data } = useReviewStats();
  const dueCount = data?.stats.due_count || 0;

  const items = [
    { label: 'Tổng quan', href: ROUTES.APP.DASHBOARD, icon: LayoutDashboard },
    {
      label: 'Ôn tập',
      href: ROUTES.APP.REVIEW,
      icon: Layers,
      badge: dueCount > 0 ? dueCount : undefined,
    },
    { label: 'Thêm từ', href: ROUTES.APP.ADD, icon: PlusCircle },
    { label: 'Cài đặt', href: ROUTES.APP.SETTINGS, icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base/95 backdrop-blur-md border-t border-border px-3 py-2 flex items-center justify-around">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors relative',
              isActive ? 'text-brand font-bold' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[10px] rounded-full bg-brand text-white font-bold animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
