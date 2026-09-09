'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Sparkles } from 'lucide-react';

export function ReviewSyncingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="max-w-md mx-auto text-center py-16 px-4 space-y-6"
    >
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        {/* Hào quang xoay quanh */}
        <div className="absolute inset-0 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-lg shadow-brand/15">
          <BrainCircuit className="w-8 h-8 animate-pulse text-brand" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-brand">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Đang hoàn tất phiên học</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Hệ thống đang tính toán kết quả...
        </h2>
      </div>

      {/* Progress bar animation */}
      <div className="w-48 mx-auto h-1.5 bg-surface rounded-full overflow-hidden border border-border/70">
        <motion.div
          className="h-full bg-brand rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}
