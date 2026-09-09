'use client';

import { staggerContainer, staggerItem } from '@/constants/animations';
import { ROUTES } from '@/constants/routes';
import { BookOpen, CheckCircle2, ChevronRight, Flame, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

interface DashboardStatsGridProps {
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  streakDays: number;
}

export function DashboardStatsGrid({
  dueCount,
  learningCount,
  masteredCount,
  streakDays,
}: DashboardStatsGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
    >
      {/* 1. Cần ôn tập */}
      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Link
          href={`${ROUTES.APP.VOCAB}?state=review`}
          className="group block p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs hover:border-brand/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-1">
                Cần ôn tập
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand" />
              </span>
              <p className="text-2xl font-bold text-brand">{dueCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* 2. Đang học */}
      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Link
          href={`${ROUTES.APP.VOCAB}?state=learning`}
          className="group block p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs hover:border-sky-500/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-1">
                Đang học
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-400" />
              </span>
              <p className="text-2xl font-bold text-text-primary">{learningCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* 3. Đã thuộc */}
      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Link
          href={`${ROUTES.APP.VOCAB}?state=mastered`}
          className="group block p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs hover:border-success/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-1">
                Đã thuộc
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-success" />
              </span>
              <p className="text-2xl font-bold text-success">{masteredCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* 4. Chuỗi học */}
      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Link
          href={ROUTES.APP.LEADERBOARD}
          className="group block p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs hover:border-amber-500/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-1">
                Chuỗi học
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </span>
              <p className="text-2xl font-bold text-amber-400">{streakDays} ngày</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
