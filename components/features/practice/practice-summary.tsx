'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { WordLevelBadge } from '@/components/common/word-level-badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { CardWithProgress } from '@/types/card.types';
import type { PracticeMode } from '@/types/practice.types';
import type { LevelUpItem } from './mixed-practice-runner';
import {
  GraduationCap,
  RotateCcw,
  Sparkles,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

interface PracticeSummaryProps {
  mode: PracticeMode;
  totalQuestions: number;
  correctCount: number;
  wrongCards: CardWithProgress[];
  xpEarned?: number;
  collectionTitle?: string;
  levelUps?: LevelUpItem[];
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
  onRestart,
}: PracticeSummaryProps) {
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;
  const xpEarned =
    passedXp !== undefined
      ? passedXp
      : correctCount * (mode === 'sentence_writing' ? 20 : mode === 'cloze' ? 15 : 10);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Celebration Header Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-surface via-surface to-base border border-border/80 shadow-lg text-center relative overflow-hidden space-y-5"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand via-purple-500 to-emerald-400" />
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shadow-lg shadow-brand/20">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/30">
            {getModeLabel(mode)}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Hoàn Thành Bài Luyện Tập!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            {accuracy >= 80
              ? 'Phong độ xuất sắc! Bạn đã ghi nhớ rất tốt các từ vựng này.'
              : accuracy >= 50
              ? 'Khá tốt! Hãy ôn lại các từ chưa nhớ để củng cố thêm trí nhớ dài hạn.'
              : 'Đừng nản lòng! Luyện tập đều đặn sẽ giúp phản xạ của bạn tăng lên nhanh chóng.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60">
          <div className="p-3 rounded-xl bg-base/60 border border-border/70 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary block mb-1">
              Độ chính xác
            </span>
            <span
              className={cn(
                'text-xl sm:text-2xl font-black',
                accuracy >= 80 ? 'text-success' : accuracy >= 50 ? 'text-amber-400' : 'text-danger'
              )}
            >
              {accuracy}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-base/60 border border-border/70 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary block mb-1">
              Số câu đúng
            </span>
            <span className="text-xl sm:text-2xl font-black text-text-primary">
              {correctCount}
              <span className="text-xs text-text-secondary font-normal">/{totalQuestions}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-base/60 border border-border/70 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand block mb-1">
              Điểm thưởng XP
            </span>
            <span className="text-xl sm:text-2xl font-black text-brand flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              +{xpEarned}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cây Sinh Trưởng Thăng Cấp (Level Ups) */}
      {levelUps && levelUps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-emerald-500/10 via-surface to-surface border border-emerald-500/30 shadow-lg shadow-emerald-500/5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <h3 className="text-sm sm:text-base font-extrabold text-emerald-400 tracking-tight">
                Cây Sinh Trưởng Thăng Cấp! ({levelUps.length} từ vựng)
              </h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active Recall FSRS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {levelUps.map(({ card, oldLevel, newLevel }) => (
              <div
                key={card.id}
                className="p-3 rounded-xl bg-base/70 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-primary truncate">
                      {card.word}
                    </span>
                    {card.cefr_level && <CEFRBadge level={card.cefr_level} size="sm" />}
                  </div>
                  <p className="text-xs text-text-secondary truncate">{card.definition}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <WordLevelBadge level={oldLevel.level} mode="minimal" />
                  <span className="text-text-secondary text-xs">→</span>
                  <WordLevelBadge level={newLevel.level} mode="compact" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Words Needing Review (Wrong Cards) */}
      {wrongCards.length > 0 && (
        <div className="rounded-2xl p-5 sm:p-6 bg-surface/80 border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Từ vựng cần ôn lại ({wrongCards.length} từ):</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {wrongCards.map((card) => (
              <div
                key={card.id}
                className="p-3 rounded-xl bg-base/60 border border-border/70 flex items-center justify-between gap-2"
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
                <AudioButton text={card.word} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onRestart}
          className="flex-1 h-11 text-xs sm:text-sm font-bold gap-2"
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
