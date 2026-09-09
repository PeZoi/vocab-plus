'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { LottieIcon } from '@/components/common/lottie-icon';
import type { LevelChangeResult } from '@/types/review.types';

interface QuizLevelUpOverlayProps {
  levelUpPopup: LevelChangeResult | null;
}

export function QuizLevelUpOverlay({ levelUpPopup }: QuizLevelUpOverlayProps) {
  return (
    <AnimatePresence>
      {levelUpPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed inset-x-0 top-16 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-brand/20 to-emerald-500/20 backdrop-blur-md border border-amber-500/50 shadow-xl shadow-amber-500/10 flex items-center gap-3">
            <div className="w-12 h-12 shrink-0">
              <LottieIcon animationKey="level-up-burst" size="lg" autoplay loop={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>TIẾN HÓA CÂY SINH TRƯỞNG!</span>
              </div>
              <p className="text-sm font-bold text-text-primary mt-0.5">
                Từ &ldquo;{levelUpPopup.word}&rdquo; đã lên{' '}
                <span className="text-brand font-extrabold">
                  Level {levelUpPopup.newLevel}
                </span>
                ! 🌿✨
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
