'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface HeaderStreakProps {
  streak: number;
  isStreakActive: boolean;
}

export function HeaderStreak({ streak, isStreakActive }: HeaderStreakProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors cursor-default ${
        isStreakActive
          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-xs shadow-amber-500/20'
          : 'bg-surface/80 border border-border/70 text-text-secondary'
      }`}
      title={
        isStreakActive
          ? `Đã thắp lửa hôm nay! Chuỗi ${streak} ngày học liên tiếp 🔥`
          : streak > 0
          ? `Hôm nay bạn chưa học! Hãy học bài để giữ chuỗi ${streak} ngày liên tục.`
          : 'Hãy học bài hôm nay để bắt đầu chuỗi streak!'
      }
    >
      <Flame
        className={`w-3.5 h-3.5 transition-colors ${
          isStreakActive ? 'text-amber-500 fill-amber-500' : 'text-text-secondary'
        }`}
      />
      <span className={`font-semibold transition-colors ${isStreakActive ? 'text-amber-400' : 'text-text-secondary'}`}>
        {streak}
      </span>
    </motion.div>
  );
}
