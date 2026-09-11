'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, BookOpen, GraduationCap, RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewCompletionScreenProps {
  cardsReviewedCount: number;
  cardIds?: string[];
  isCustomSession?: boolean;
  collectionId?: string;
  totalXpEarned?: number;
  onRestartReview?: () => void;
}

export function ReviewCompletionScreen({
  cardsReviewedCount,
  cardIds = [],
  collectionId,
  totalXpEarned = 0,
  onRestartReview,
}: ReviewCompletionScreenProps) {
  // Tạo đường dẫn sang bài kiểm tra tổng hợp cho đúng nhóm từ vừa học
  const practiceHref =
    cardIds.length > 0
      ? `${ROUTES.APP.PRACTICE}?card_ids=${cardIds.join(',')}`
      : collectionId
      ? `${ROUTES.APP.PRACTICE}?collection_id=${collectionId}`
      : `${ROUTES.APP.PRACTICE}?mode=due`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-lg mx-auto text-center py-6 px-3 space-y-6"
    >
      {/* Heading */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-success">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hoàn thành xem thẻ Flashcard!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
          Tuyệt vời! Kiến thức đã được nạp 🌱
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-md mx-auto">
          Bạn đã hoàn thành lướt xem <span className="font-bold text-brand">{cardsReviewedCount}</span> thẻ từ vựng. 
          Hãy bước vào bài kiểm tra tổng hợp ngay để khắc sâu phản xạ và kích hoạt thăng cấp Level!
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface border border-border text-center shadow-xs max-w-sm mx-auto">
        <div>
          <span className="text-[11px] text-text-secondary font-medium">Thẻ vừa xem</span>
          <p className="text-xl sm:text-2xl font-bold text-text-primary mt-0.5">{cardsReviewedCount}</p>
        </div>
        <div className="border-l border-border">
          <span className="text-[11px] text-text-secondary font-medium">Thưởng xem bài</span>
          <p className="text-xl sm:text-2xl font-bold text-brand mt-0.5">
            +{totalXpEarned} XP
          </p>
        </div>
      </div>

      {/* Main Call to Action: BẮT ĐẦU BÀI KIỂM TRA NGAY */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-brand/15 to-transparent border border-brand/30 space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-brand font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>BƯỚC TIẾP THEO: KIỂM TRA TỔNG HỢP</span>
        </div>
        <p className="text-xs text-text-secondary">
          Từ vựng chỉ được tính lên Level và ghi nhận Streak khi bạn vượt qua bài kiểm tra phản xạ.
        </p>
        <Link href={practiceHref} className="block w-full">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-brand to-amber-500 hover:from-brand-hover hover:to-amber-600 text-white font-bold h-12 shadow-md shadow-brand/20 text-sm"
          >
            <GraduationCap className="w-5 h-5" />
            <span>LÀM BÀI KIỂM TRA NGAY ({cardsReviewedCount} TỪ)</span>
          </Button>
        </Link>
      </div>

      {/* Secondary Actions */}
      <div className="space-y-2 pt-1">
        {onRestartReview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRestartReview}
            className="w-full text-xs gap-1.5 h-9 text-text-secondary hover:text-brand border-border/80"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Lướt xem lại nhóm thẻ này</span>
          </Button>
        )}

        <div className="flex items-center gap-3">
          <Link href={ROUTES.APP.DASHBOARD} className="flex-1">
            <Button variant="surface" size="default" className="w-full text-xs gap-1.5 h-10 border border-border/80">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Dashboard</span>
            </Button>
          </Link>
          <Link href={ROUTES.APP.VOCAB} className="flex-1">
            <Button variant="surface" size="default" className="w-full text-xs gap-1.5 h-10 border border-border/80">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Xem Kho Từ Vựng</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
