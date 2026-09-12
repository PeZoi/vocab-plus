'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Flame, Loader2, Sparkles, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROCESSING_STEPS = [
  { id: 1, label: 'Ghi nhận kết quả bài kiểm tra', icon: CheckCircle2 },
  { id: 2, label: 'Tưới nước & Cập nhật thuật toán', icon: Sprout },
  { id: 3, label: 'Đánh giá Cây Sinh Trưởng & Cấp độ', icon: Sparkles },
  { id: 4, label: 'Ghi nhận chuỗi học Streak 🔥 & XP thưởng', icon: Flame },
];

export function PracticeProcessing() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 300);
    const timer2 = setTimeout(() => setCurrentStep(3), 650);
    const timer3 = setTimeout(() => setCurrentStep(4), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="max-w-md mx-auto py-10 sm:py-16 px-4 text-center space-y-6"
    >
      {/* Central Glowing Icon */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
        <div className="absolute -inset-2 rounded-full bg-brand/10 blur-xl animate-pulse pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand/20 via-surface to-brand/10 border border-brand/40 flex items-center justify-center text-brand shadow-lg shadow-brand/20">
          <Sparkles className="w-8 h-8 text-brand animate-pulse" />
        </div>
      </div>

      {/* Header text */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/30">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Đang tổng kết kết quả</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
          Hệ thống đang tính toán kết quả...
        </h2>
        <p className="text-xs text-text-secondary max-w-sm mx-auto">
          Đồng bộ lịch ôn tập, đánh giá cấp độ cây sinh trưởng và ghi nhận điểm thưởng.
        </p>
      </div>

      {/* Gradient Progress Bar */}
      <div className="w-56 mx-auto h-1.5 bg-surface rounded-full overflow-hidden border border-border/80">
        <motion.div
          className="h-full bg-gradient-to-r from-brand via-purple-500 to-emerald-400 rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
        />
      </div>

      {/* 4 Multi-Step Process Indicators */}
      <div className="p-4 rounded-2xl bg-surface/80 border border-border/80 text-left space-y-2.5 shadow-sm max-w-sm mx-auto">
        {PROCESSING_STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-2.5 text-xs transition-all duration-300 py-0.5',
                isDone
                  ? 'text-success font-medium'
                  : isCurrent
                  ? 'text-brand font-bold scale-[1.02] origin-left'
                  : 'text-text-secondary/50'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] transition-colors',
                  isDone
                    ? 'bg-success/20 text-success border border-success/40'
                    : isCurrent
                    ? 'bg-brand/20 text-brand border border-brand/50'
                    : 'bg-base border border-border/60 text-text-secondary/40'
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin text-brand" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
