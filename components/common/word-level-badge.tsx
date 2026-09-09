'use client';

import React from 'react';
import type { UserCard } from '@/types/card.types';
import { useWordLevelInfo } from '@/hooks/common/use-word-level-info';
import { LottieIcon } from './lottie-icon';
import { cn } from '@/lib/utils';

interface WordLevelBadgeProps {
  userCard?: UserCard | null;
  level?: number;
  mode?: 'compact' | 'detailed' | 'minimal';
  showLottie?: boolean;
  className?: string;
  triggerLottieOnHover?: boolean;
}

export function WordLevelBadge({
  userCard,
  level: directLevel,
  mode = 'compact',
  showLottie = true,
  className,
  triggerLottieOnHover = true,
}: WordLevelBadgeProps) {
  const levelInfo = useWordLevelInfo({ userCard, directLevel });

  const {
    level,
    name,
    lottieKey,
    colorClasses,
    progressPercent,
    stabilityDays,
    currentCount,
    nextTargetCount,
    isMaxLevel,
  } = levelInfo;

  // 1. Chế độ Minimal: Chỉ icon + số level
  if (mode === 'minimal') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] font-semibold transition-all',
          colorClasses.bg,
          colorClasses.text,
          colorClasses.border,
          className
        )}
        title={`Cấp độ ${level}: ${name} (${stabilityDays} ngày)`}
      >
        {showLottie ? (
          <LottieIcon
            animationKey={lottieKey}
            size="xs"
            triggerOnHover={triggerLottieOnHover}
          />
        ) : (
          <span>{levelInfo.icon}</span>
        )}
        <span className="font-mono text-[10px]">Lv.{level}</span>
      </div>
    );
  }

  // 2. Chế độ Detailed: Hiển thị đầy đủ tiến trình 5 nấc vạch mini bars
  if (mode === 'detailed') {
    return (
      <div
        className={cn(
          'p-3 rounded-xl border flex flex-col gap-2 transition-all',
          colorClasses.bg,
          colorClasses.border,
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-surface/70 border border-border/80">
              <LottieIcon animationKey={lottieKey} size="md" loop autoplay />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-base/80 border border-border/60">
                  Lv.{level}
                </span>
                <span className={cn('text-sm font-bold tracking-tight', colorClasses.text)}>
                  {name}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Độ bền trí nhớ: <strong className="text-text-primary">{stabilityDays} ngày</strong> • Đúng liên tiếp: {currentCount} lần
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono font-semibold text-text-secondary">
              {isMaxLevel ? 'Đã tối đa' : `${progressPercent}% tới Lv.${level + 1}`}
            </span>
          </div>
        </div>

        {/* 5-Step Mini Evolution Bar */}
        <div className="space-y-1">
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((step) => {
              const isPassed = level >= step;
              const isCurrent = level === step - 1;

              return (
                <div key={step} className="space-y-0.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      isPassed
                        ? 'bg-brand shadow-xs'
                        : isCurrent
                        ? 'bg-brand/30 border border-brand/50'
                        : 'bg-surface border border-border/70'
                    )}
                  >
                    {isCurrent && (
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    )}
                  </div>
                  <div className="text-[9px] text-center font-mono text-text-secondary/60">
                    Lv.{step}
                  </div>
                </div>
              );
            })}
          </div>

          {!isMaxLevel && (
            <p className="text-[10px] text-text-secondary/80 text-center italic pt-0.5">
              Cần thêm {Math.max(1, nextTargetCount - currentCount)} lần làm đúng bài test để tiến hóa lên cấp tiếp theo
            </p>
          )}
        </div>
      </div>
    );
  }

  // 3. Chế độ Compact (Mặc định cho Card Grid & Table View)
  return (
    <div
      className={cn(
        'group/lvl inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs',
        colorClasses.bg,
        colorClasses.text,
        colorClasses.border,
        className
      )}
      title={`Cấp độ ${level}: ${name} (Độ bền trí nhớ: ${stabilityDays} ngày)`}
    >
      {showLottie ? (
        <LottieIcon
          animationKey={lottieKey}
          size="xs"
          triggerOnHover={triggerLottieOnHover}
        />
      ) : (
        <span className="text-xs">{levelInfo.icon}</span>
      )}
      <span className="font-mono text-[11px] font-bold">Lv.{level}</span>
      <span className="text-[11px] font-medium hidden sm:inline">{name}</span>
    </div>
  );
}
