'use client';

import React from 'react';
import type { UserCard } from '@/types/card.types';
import { useWordLevelInfo } from '@/hooks/common/use-word-level-info';
import { LottieIcon } from '@/components/common/lottie-icon';
import { cn } from '@/lib/utils';
import { Sparkles, Trophy, CheckCircle2, Flame, ShieldAlert } from 'lucide-react';

interface VocabDetailLevelCardProps {
  userCard?: UserCard | null;
}

export function VocabDetailLevelCard({ userCard }: VocabDetailLevelCardProps) {
  const levelInfo = useWordLevelInfo({ userCard });

  const {
    level,
    name,
    nameEn,
    lottieKey,
    colorClasses,
    progressPercent,
    stabilityDays,
    currentCount,
    nextTargetCount,
    description,
    isMaxLevel,
  } = levelInfo;

  return (
    <div
      className={cn(
        'rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4 transition-all',
        colorClasses.bg,
        colorClasses.border
      )}
    >
      {/* Card Header: Level Title & Lottie Icon */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
        <div className="flex items-center gap-2">
          <Trophy className={cn('w-4 h-4', colorClasses.text)} />
          <span className="text-sm font-bold text-white">Cấp độ sinh trưởng</span>
        </div>

        <span
          className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase font-mono tracking-wider',
            colorClasses.border,
            colorClasses.text,
            'bg-base/70'
          )}
        >
          Lv.{level}
        </span>
      </div>

      {/* Main Visual Display: Lottie Animated Icon + Level Identity */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-base/60 border border-border/70 backdrop-blur-xs">
        <div className="w-13 h-13 rounded-xl bg-surface/80 border border-border/80 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
          <LottieIcon animationKey={lottieKey} size="lg" loop autoplay />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className={cn('text-base font-bold tracking-tight', colorClasses.text)}>
              {name}
            </h3>
            <span className="text-xs text-slate-400 font-medium">({nameEn})</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* 2 Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
        <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-brand" />
            <span>Đúng liên tiếp</span>
          </span>
          <span className="text-[16px] sm:text-lg font-bold text-white block font-mono">
            {currentCount}{' '}
            <span className="text-xs text-slate-400 font-normal">
              / {isMaxLevel ? currentCount : nextTargetCount} lần
            </span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
          <span className="text-[8.5px] text-slate-400 uppercase tracking-wider block font-semibold flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            <span>Độ bền trí nhớ</span>
          </span>
          <span className="text-[16px] sm:text-lg font-bold text-emerald-400 block font-mono">
            {stabilityDays}{' '}
            <span className="text-xs text-slate-400 font-normal">ngày</span>
          </span>
        </div>
      </div>

      {/* 5-Step Evolution Bar & Next Target */}
      <div className="space-y-2 pt-1 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand" />
            <span>Tiến trình tiến hóa</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-brand">
            {isMaxLevel ? 'Cảnh giới tối đa' : `${progressPercent}% tới Lv.${level + 1}`}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => {
            const isPassed = level >= step;
            const isCurrent = level === step - 1;

            return (
              <div key={step} className="space-y-1">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300 overflow-hidden',
                    isPassed
                      ? 'bg-brand shadow-xs'
                      : isCurrent
                      ? 'bg-brand/25 border border-brand/40'
                      : 'bg-base/70 border border-border/70'
                  )}
                >
                  {isCurrent && (
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  )}
                </div>
                <div className="text-[9px] text-center font-mono text-slate-400/80">
                  Lv.{step}
                </div>
              </div>
            );
          })}
        </div>

        {!isMaxLevel ? (
          <p className="text-[11px] text-slate-400 text-center italic pt-1 leading-relaxed">
            Cần thêm{' '}
            <strong className="text-white font-semibold">
              {Math.max(1, nextTargetCount - currentCount)}
            </strong>{' '}
            lần kiểm tra đúng để thăng cấp lên{' '}
            <strong className="text-brand font-semibold">Lv.{level + 1}</strong>
          </p>
        ) : (
          <div className="flex items-center justify-center gap-1 text-[11px] text-amber-300 font-semibold pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã đạt cấp độ tối cao — Cổ thụ hoàng kim</span>
          </div>
        )}
      </div>
    </div>
  );
}
