'use client';

import { staggerContainer, staggerItem } from '@/constants/animations';
import { BookOpen, CheckCircle2, Flame, Layers } from 'lucide-react';
import { motion } from 'motion/react';
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
      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-secondary">Cần ôn tập</span>
            <p className="text-2xl font-bold text-brand">{dueCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-secondary">Đang học</span>
            <p className="text-2xl font-bold text-text-primary">{learningCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-secondary">Đã thuộc</span>
            <p className="text-2xl font-bold text-success">{masteredCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <div className="p-4 rounded-xl bg-surface/90 border border-border/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-text-secondary">Chuỗi học</span>
            <p className="text-2xl font-bold text-amber-400">{streakDays} ngày</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
