'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Sprout,
  Trophy,
} from 'lucide-react';
import { DualAudioButtons } from '@/components/common/dual-audio-buttons';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { LottieIcon } from '@/components/common/lottie-icon';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { CardWithProgress } from '@/types/card.types';
import type { LevelUpItem, PracticeMode, WateredCardItem } from '@/types/practice.types';

export interface PracticeSummaryProps {
  mode: PracticeMode;
  totalQuestions: number;
  correctCount: number;
  wrongCards: CardWithProgress[];
  xpEarned?: number;
  collectionTitle?: string;
  levelUps?: LevelUpItem[];
  wateredCards?: WateredCardItem[];
  onRestart: () => void;
}

export function PracticeSummary({
  mode,
  totalQuestions,
  correctCount,
  wrongCards,
  xpEarned: passedXp,
  collectionTitle,
  levelUps,
  wateredCards,
  onRestart,
}: PracticeSummaryProps) {
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;
  const xpEarned =
    passedXp !== undefined
      ? passedXp
      : correctCount * (mode === 'sentence_writing' ? 20 : mode === 'cloze' ? 15 : 10);

  // Bắn Toast chúc mừng nếu có từ vựng lên level
  useEffect(() => {
    if (levelUps && levelUps.length > 0) {
      if (levelUps.length === 1) {
        toast.success(
          `🎉 Chúc mừng! Từ "${levelUps[0].card.word}" đã thăng cấp lên ${levelUps[0].newLevel.name}! 🌱`
        );
      } else {
        toast.success(
          `🎉 Chúc mừng! Có ${levelUps.length} từ vựng đã thăng cấp Cây Sinh Trưởng! 🌱`
        );
      }
    }
  }, [levelUps]);

  const gardenScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollGarden = (direction: 'left' | 'right') => {
    if (gardenScrollRef.current) {
      const scrollAmount = 300;
      gardenScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getModeLabel = (m: PracticeMode) => {
    switch (m) {
      case 'mixed':
        return collectionTitle
          ? `Kiểm tra tổng hợp: ${collectionTitle}`
          : 'Bài kiểm tra tổng hợp ngẫu nhiên';
      case 'multiple_choice':
        return 'Trắc nghiệm 4 lựa chọn';
      case 'cloze':
        return 'Điền khuyết ngữ cảnh';
      case 'sentence_writing':
        return 'Đặt câu & AI chấm điểm';
    }
  };

  const hasLevelUps = Boolean(levelUps && levelUps.length > 0);

  // Sắp xếp các từ tăng level (isLevelUp === true) lên đầu danh sách
  const sortedWateredCards = React.useMemo(() => {
    if (!wateredCards || wateredCards.length === 0) return [];
    return [...wateredCards].sort((a, b) => {
      // 1. Ưu tiên các từ thăng cấp (isLevelUp) lên đầu danh sách
      if (a.isLevelUp && !b.isLevelUp) return -1;
      if (!a.isLevelUp && b.isLevelUp) return 1;

      // 2. Nếu cùng thăng cấp: ưu tiên cấp độ mới cao hơn lên trước
      if (a.isLevelUp && b.isLevelUp) {
        return b.newLevel.level - a.newLevel.level;
      }

      // 3. Đối với các từ chưa thăng cấp: ưu tiên tiến độ (% hoặc sắp lên cấp) cao hơn
      return b.newLevel.progressPercent - a.newLevel.progressPercent;
    });
  }, [wateredCards]);

  const hasWateredCards = Boolean(sortedWateredCards.length > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 1. Hero Celebration Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-surface via-surface to-base border border-border/80 shadow-xl text-center relative overflow-hidden space-y-6"
      >
        {/* Ambient Top Glow & Banner Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand via-purple-500 to-emerald-400" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-52 h-52 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-brand/25 via-brand/10 to-transparent border border-brand/40 flex items-center justify-center text-brand shadow-lg shadow-brand/20">
          <Trophy className="w-8 h-8 text-brand" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand/15 text-brand border border-brand/30 inline-block">
            {getModeLabel(mode)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Hoàn Thành Bài Kiểm Tra!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            {accuracy >= 80
              ? 'Phong độ xuất sắc! Bạn đã phản xạ và ghi nhớ rất tốt các từ vựng này.'
              : accuracy >= 50
              ? 'Khá tốt! Hãy ôn lại các từ chưa nhớ để củng cố thêm phản xạ lâu dài.'
              : 'Đừng nản lòng! Luyện tập đều đặn sẽ giúp phản xạ của bạn tăng lên nhanh chóng.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-3 border-t border-border/60">
          {/* Accuracy */}
          <div className="p-3.5 rounded-2xl bg-base/70 border border-border/70 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
              Độ chính xác
            </span>
            <span
              className={cn(
                'text-xl sm:text-3xl font-black tracking-tight',
                accuracy >= 80
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : accuracy >= 50
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {accuracy}%
            </span>
          </div>

          {/* Correct count */}
          <div className="p-3.5 rounded-2xl bg-base/70 border border-border/70 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
              Số câu đúng
            </span>
            <span className="text-xl sm:text-3xl font-black text-text-primary tracking-tight">
              {correctCount}
              <span className="text-xs sm:text-sm text-text-secondary font-normal">
                /{totalQuestions}
              </span>
            </span>
          </div>

          {/* XP earned */}
          <div className="p-3.5 rounded-2xl bg-base/70 border border-border/70 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
              Điểm thưởng XP
            </span>
            <span className="text-xl sm:text-3xl font-black text-brand flex items-center justify-center gap-1 tracking-tight">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 dark:text-amber-300" />
              +{xpEarned}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. PHẦN TƯỚI NƯỚC (CHỈ HIỂN THỊ KHI CÓ TỪ VỰNG CẦN ÔN TẬP ĐÃ ĐƯỢC TƯỚI NƯỚC) */}
      {hasWateredCards && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-3xl p-5 sm:p-6 bg-surface border border-border/80 shadow-md space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-text-primary tracking-tight flex items-center gap-1.5">
                  <span>Khu Vườn Vừa Được Tưới Nước!</span>
                  <span className="text-base">💧</span>
                  <span className="text-xs text-text-secondary font-medium ml-1">
                    ({sortedWateredCards.length} từ)
                  </span>
                </h3>
              </div>
            </div>

            {/* Nút điều hướng cuộn ngang nhanh */}
            {sortedWateredCards.length > 3 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleScrollGarden('left')}
                  className="w-7 h-7 rounded-lg border border-border/80 bg-base/50 hover:bg-surface-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-all active:scale-95 cursor-pointer select-none"
                  title="Cuộn sang trái"
                  aria-label="Cuộn sang trái"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollGarden('right')}
                  className="w-7 h-7 rounded-lg border border-border/80 bg-base/50 hover:bg-surface-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-all active:scale-95 cursor-pointer select-none"
                  title="Cuộn sang phải"
                  aria-label="Cuộn sang phải"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Banner Thông Báo Thăng Cấp (nếu có từ vựng lên level) */}
          {hasLevelUps && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/[0.06] dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 text-base">
                🎉
              </div>
              <div className="text-xs">
                <span className="font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 block">
                  Cây Sinh Trưởng Thăng Cấp! ({levelUps?.length} từ vựng)
                </span>
                <span className="text-text-secondary text-[11px] leading-relaxed block mt-0.5">
                  Các từ vựng đã tích lũy đủ độ bền và lần làm đúng để tiến hóa lên cấp độ mới.
                </span>
              </div>
            </div>
          )}

          {/* Danh sách từ vựng được tưới nước: sắp xếp từ tăng cấp lên đầu, cuộn ngang mượt mà */}
          <div
            ref={gardenScrollRef}
            className="flex items-stretch gap-3 overflow-x-auto custom-scrollbar pb-3 pt-1 px-1 -mx-1 snap-x snap-mandatory"
          >
            {sortedWateredCards.map(({ card, oldLevel, newLevel, isLevelUp }) => (
              <div
                key={card.id}
                className={cn(
                  'flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all text-center gap-2 w-[115px] sm:w-[125px] shrink-0 snap-start select-none group',
                  isLevelUp
                    ? 'border-emerald-500/40 dark:border-emerald-500/40 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] shadow-xs shadow-emerald-500/10 hover:border-emerald-500/60'
                    : 'border-border/80 bg-base/50 dark:bg-base/60 hover:border-border hover:bg-surface'
                )}
              >
                {/* Icon hạt mầm / cây sinh trưởng size md */}
                <LottieIcon
                  animationKey={newLevel.lottieKey}
                  size="md"
                  loop
                  autoplay
                />

                {/* Tên từ vựng */}
                <span
                  className="text-xs sm:text-sm font-bold text-text-primary truncate max-w-[110px]"
                  title={card.word}
                >
                  {card.word}
                </span>

                {/* Cấp độ */}
                {isLevelUp ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 dark:border-emerald-500/40">
                      Lv.{oldLevel.level} → Lv.{newLevel.level}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      {newLevel.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-mono font-bold text-text-secondary">
                      Lv.{newLevel.level}
                    </span>
                    <span className="text-[10px] text-text-secondary/80 font-medium">
                      {newLevel.name}
                    </span>
                  </div>
                )}

                {/* Thanh Progress mini & số lần đúng nữa sẽ lên cấp */}
                <div className="w-full pt-1.5 border-t border-border/50 flex flex-col items-center gap-1">
                  <div className="w-full h-1 bg-surface rounded-full overflow-hidden border border-border/60">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        isLevelUp
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : newLevel.progressPercent >= 50
                          ? 'bg-amber-400'
                          : 'bg-brand'
                      )}
                      style={{
                        width: isLevelUp
                          ? '100%'
                          : `${Math.max(10, newLevel.progressPercent)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-medium leading-none">
                    {newLevel.isMaxLevel ? (
                      <span className="text-text-secondary">Tối đa ⭐</span>
                    ) : isLevelUp ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                        Lên cấp! 🎉
                      </span>
                    ) : (
                      <span className="text-text-secondary">
                        Còn {Math.max(1, newLevel.nextTargetCount - newLevel.currentCount)} lần đúng
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. Từ vựng cần ôn lại (Wrong Cards) */}
      {wrongCards.length > 0 && (
        <div className="rounded-3xl p-5 sm:p-6 bg-surface/80 border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Từ vựng cần ôn lại ({wrongCards.length} từ):</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {wrongCards.map((card) => (
              <div
                key={card.id}
                className="p-3 rounded-xl bg-base/60 border border-border/70 flex items-center justify-between gap-2 hover:border-amber-500/30 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-primary truncate">
                      {card.word}
                    </span>
                    {card.cefr_level && (
                      <CEFRBadge level={card.cefr_level} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate">{card.definition}</p>
                </div>
                <DualAudioButtons
                  word={card.word}
                  cardId={card.id}
                  initialAudio={card.audio_url}
                  size="xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onRestart}
          className="flex-1 h-11 text-xs sm:text-sm font-bold gap-2 shadow-md shadow-brand/20"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Luyện tập bài khác</span>
        </Button>

        <Link href={ROUTES.APP.REVIEW} className="flex-1">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-11 text-xs sm:text-sm border-border/80 hover:bg-surface gap-2"
          >
            <GraduationCap className="w-4 h-4 text-brand" />
            <span>Học thẻ Flashcard</span>
          </Button>
        </Link>

        <Link href={ROUTES.APP.DASHBOARD}>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-11 text-xs text-text-secondary hover:text-text-primary"
          >
            Về Tổng quan
          </Button>
        </Link>
      </div>
    </div>
  );
}
