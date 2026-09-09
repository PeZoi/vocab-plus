'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, BookOpen, Flame, FolderKanban, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { LottieIcon } from '@/components/common/lottie-icon';
import type { QuizSessionStats } from '@/types/review.types';

interface ReviewCompletionScreenProps {
  cardsReviewedCount: number;
  isCustomSession: boolean;
  collectionId?: string;
  totalXpEarned?: number;
  quizStats?: QuizSessionStats | null;
  onRestartReview?: () => void;
}

export function ReviewCompletionScreen({
  cardsReviewedCount,
  isCustomSession,
  collectionId,
  totalXpEarned,
  quizStats,
  onRestartReview,
}: ReviewCompletionScreenProps) {
  const hasLevelUps = (quizStats?.levelUps.length ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-lg mx-auto text-center py-6 px-3 space-y-6"
    >
      {/* Celebration Animation: Lottie Burst if has level ups, or Trophy */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        {hasLevelUps ? (
          <div className="w-full h-full flex items-center justify-center">
            <LottieIcon animationKey="level-up-burst" size="xl" loop={true} autoplay={true} />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success success-glow">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
        )}
      </div>

      {/* Heading */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-success">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phiên học hoàn thành xuất sắc</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
          Tuyệt vời! Cây đã được tưới nước 🌱
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Bạn đã hoàn thành xem trước <span className="font-bold text-brand">{cardsReviewedCount}</span> thẻ và vượt qua bài kiểm tra trí nhớ.
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-surface border border-border text-center shadow-xs">
        <div>
          <span className="text-[11px] text-text-secondary font-medium">Thẻ đã học</span>
          <p className="text-lg sm:text-xl font-bold text-text-primary mt-0.5">{cardsReviewedCount}</p>
        </div>
        <div className="border-x border-border">
          <span className="text-[11px] text-text-secondary font-medium">Đúng bài test</span>
          <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">
            {quizStats ? `${quizStats.correctCount}/${quizStats.totalQuestions}` : `${cardsReviewedCount}`}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-text-secondary font-medium">Tổng XP</span>
          <p className="text-lg sm:text-xl font-bold text-brand mt-0.5">
            +{totalXpEarned !== undefined ? totalXpEarned : (cardsReviewedCount * 2 + (quizStats?.xpEarned || 0))} XP
          </p>
        </div>
      </div>

      {/* Level Up List (if any) */}
      {quizStats && quizStats.levelUps.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>DANH SÁCH TỪ TIẾN HÓA CẤP ĐỘ ({quizStats.levelUps.length} từ)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quizStats.levelUps.map((up) => (
              <div
                key={up.cardId}
                className="p-2 rounded-xl bg-surface/80 border border-amber-500/30 flex items-center justify-between gap-2 text-xs"
              >
                <span className="font-bold text-text-primary truncate">{up.word}</span>
                <span className="font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] shrink-0">
                  Lv.{up.oldLevel} ➔ Lv.{up.newLevel} ✨
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Words Needing Review (if any) */}
      {quizStats && quizStats.levelDowns.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-base border border-border/80 text-left space-y-2 text-xs">
          <span className="text-text-secondary font-semibold block">
            Từ cần chăm sóc thêm vào ngày mai ({quizStats.levelDowns.length} từ):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quizStats.levelDowns.map((down) => (
              <span
                key={down.cardId}
                className="px-2 py-0.5 rounded-md bg-surface border border-border text-text-secondary text-[11px]"
              >
                {down.word} (Lv.{down.newLevel})
              </span>
            ))}
          </div>
        </div>
      )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {onRestartReview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRestartReview}
              className="w-full text-xs gap-1.5 h-9 text-text-secondary hover:text-brand border-border/80"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ôn lại nhóm từ này</span>
            </Button>
          )}

          <div className="flex items-center gap-3">
            <Link href={ROUTES.APP.DASHBOARD} className="flex-1">
              <Button variant="primary" size="default" className="w-full text-xs gap-1.5 bg-brand hover:bg-brand-hover text-white font-semibold h-10">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về Dashboard</span>
              </Button>
            </Link>
            <Link href={ROUTES.APP.VOCAB} className="flex-1">
              <Button variant="surface" size="default" className="w-full text-xs gap-1.5 h-10">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Xem Kho Từ Vựng</span>
              </Button>
            </Link>
          </div>

          {collectionId && isCustomSession && (
            <Link href={ROUTES.APP.COLLECTION_DETAIL(collectionId)} className="block w-full">
              <Button variant="ghost" size="sm" className="w-full text-xs gap-1 text-text-secondary hover:text-text-primary">
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Về bộ sưu tập</span>
              </Button>
            </Link>
          )}
        </div>
    </motion.div>
  );
}
