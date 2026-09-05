'use client';

import { Brain, CheckCircle2, Cpu, Sparkles, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

const AI_STEPS = [
  {
    icon: Sparkles,
    label: 'Kết nối mô hình AI',
    detail: 'Khởi tạo tiến trình phân tích đa tầng...',
  },
  {
    icon: Brain,
    label: 'Phân tích ngữ nghĩa',
    detail: 'Bóc tách từ loại & nghĩa theo ngữ cảnh...',
  },
  {
    icon: Cpu,
    label: 'Chuẩn hoá CEFR & IPA',
    detail: 'Xác định cấp độ & phiên âm quốc tế...',
  },
  {
    icon: Zap,
    label: 'Tạo mẹo nhớ & ví dụ',
    detail: 'Tổng hợp mnemonic & câu ứng dụng...',
  },
  {
    icon: CheckCircle2,
    label: 'Hoàn tất cấu trúc thẻ',
    detail: 'Tối ưu hoá dữ liệu thẻ từ vựng...',
  },
];

interface AiAnalysisLoadingProps {
  word: string;
}

export function AiAnalysisLoading({ word }: AiAnalysisLoadingProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Chuyển step mượt mà mỗi 1.2 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % AI_STEPS.length);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const currentStep = AI_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative rounded-xl border border-brand/30 bg-surface/90 backdrop-blur-md p-3.5 sm:p-4 overflow-hidden shadow-sm"
    >
      {/* Background subtle aura & shimmer light */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
      <motion.div
        animate={{ x: ['-100%', '250%'] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-brand/10 to-transparent pointer-events-none"
      />

      <div className="relative z-10 space-y-3">
        {/* Header line: Icon + Word info + Step Counter */}
        <div className="flex items-center gap-3">
          {/* Glowing AI Icon */}
          <div className="relative shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-brand/15 via-purple-500/10 to-cyan-500/15 border border-brand/25 flex items-center justify-center shadow-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0, rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <StepIcon className="w-4 h-4 text-brand" />
              </motion.div>
            </AnimatePresence>
            <span className="absolute -inset-0.5 rounded-lg bg-brand/15 blur-xs -z-10 animate-pulse" />
          </div>

          {/* Word and status message */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-semibold text-text-primary truncate">
                  AI đang phân tích &ldquo;{word}&rdquo;
                </span>
              </div>
              <span className="text-[11px] font-mono text-text-secondary shrink-0">
                {currentStepIndex + 1}/{AI_STEPS.length}
              </span>
            </div>

            {/* Dynamic Step description */}
            <div className="h-4.5 relative overflow-hidden mt-0.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="text-[11px] text-text-secondary truncate flex items-center gap-1.5"
                >
                  <span className="font-medium text-text-primary/90">
                    {currentStep.label}
                  </span>
                  <span className="text-text-muted hidden sm:inline">
                    — {currentStep.detail}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Segmented Step Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5 pt-0.5">
          {AI_STEPS.map((_, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className="h-1 rounded-full bg-base/80 overflow-hidden relative"
              >
                {isCompleted && (
                  <div className="w-full h-full bg-brand transition-all duration-300" />
                )}
                {isCurrent && (
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.1, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-brand via-purple-500 to-cyan-400 shadow-[0_0_6px_rgba(234,88,12,0.6)]"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
