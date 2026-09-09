'use client';

import React from 'react';
import { ArrowLeft, Flame, RotateCcw, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  progressPercent: number;
  isRanked: boolean;
  isRetestMode: boolean;
  onExit: () => void;
}

export function QuizHeader({
  currentIndex,
  totalQuestions,
  progressPercent,
  isRanked,
  isRetestMode,
  onExit,
}: QuizHeaderProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={onExit}
          className="text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Thoát</span>
        </button>

        {/* Mode Badge Indicator */}
        <div className="flex items-center gap-1.5">
          {isRetestMode ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
              <RotateCcw className="w-3 h-3 animate-spin" />
              <span>Vòng lặp sửa sai</span>
            </span>
          ) : isRanked ? (
            <span className="px-2 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/30 font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3 text-brand" />
              <span>Kiểm tra Xếp hạng (Ranked)</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              <span>Luyện tập tự do (Bảo toàn Level)</span>
            </span>
          )}
        </div>

        {/* Progress percent */}
        <span className="font-mono text-text-secondary">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-surface border border-border/80 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            isRetestMode ? 'bg-amber-500' : 'bg-brand'
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
