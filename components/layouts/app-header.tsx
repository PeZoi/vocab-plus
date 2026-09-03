'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Flame, Zap, LogOut, BookOpen, Menu } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/features/auth/use-google-auth';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { formatXP } from '@/utils/formatters';
import { useUIStore } from '@/stores/use-ui-store';

export function AppHeader() {
  const { signOut } = useGoogleAuth();
  const { data } = useReviewStats();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const streak = data?.stats.streak_days || 0;
  const xp = data?.stats.total_xp || 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-base/85 backdrop-blur-md h-16 flex items-center px-4 sm:px-6 justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface md:hidden cursor-pointer"
          title="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white shadow-2xs"
          >
            <BookOpen className="w-4 h-4" />
          </motion.div>
          <span className="font-semibold text-base tracking-tight text-text-primary group-hover:text-brand transition-colors">
            Vocab<span className="text-brand">App</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak Badge with Motion */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/80 border border-border/70 text-xs font-medium cursor-default"
          title={`Chuỗi ${streak} ngày học liên tiếp`}
        >
          <Flame
            className={`w-3.5 h-3.5 ${
              streak > 0 ? 'text-amber-500 fill-amber-500' : 'text-text-secondary'
            }`}
          />
          <span className={streak > 0 ? 'text-amber-400 font-semibold' : 'text-text-secondary'}>
            {streak} ngày
          </span>
        </motion.div>

        {/* XP Badge with Motion */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/80 border border-border/70 text-xs font-medium cursor-default"
          title="Tổng điểm kinh nghiệm"
        >
          <Zap className="w-3.5 h-3.5 text-brand fill-brand" />
          <span className="text-text-primary font-semibold">{formatXP(xp)}</span>
        </motion.div>

        {/* Sign out button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => signOut()}
          className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors ml-1 cursor-pointer"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
}
