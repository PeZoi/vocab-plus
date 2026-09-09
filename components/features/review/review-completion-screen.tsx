'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, FolderKanban, Trophy, GraduationCap, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewCompletionScreenProps {
  cardsReviewedCount: number;
  isCustomSession: boolean;
  collectionId?: string;
  totalXpEarned?: number;
}

export function ReviewCompletionScreen({
  cardsReviewedCount,
  isCustomSession,
  collectionId,
  totalXpEarned,
}: ReviewCompletionScreenProps) {
  const practiceUrl = collectionId
    ? `${ROUTES.APP.PRACTICE}?collection_id=${collectionId}`
    : ROUTES.APP.PRACTICE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-md mx-auto text-center py-10 px-4 space-y-6"
    >
      {/* Icon Trophy */}
      <div className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto success-glow">
        <Trophy className="w-10 h-10 animate-bounce" />
      </div>

      {/* Heading */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-success">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Đã hoàn thành xuất sắc</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
          Hoàn thành phiên ôn tập!
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Bạn đã ôn tập xong <span className="font-bold text-brand">{cardsReviewedCount}</span> thẻ
          {isCustomSession ? ' trong phiên ôn tập tùy chỉnh.' : ' theo lịch FSRS hôm nay.'}
        </p>
      </div>

      {/* Stats Card */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-around text-center shadow-sm">
        <div>
          <span className="text-xs text-text-secondary font-medium">Thẻ đã ôn</span>
          <p className="text-xl font-bold text-text-primary mt-0.5">{cardsReviewedCount}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <span className="text-xs text-text-secondary font-medium">XP nhận được</span>
          <p className="text-xl font-bold text-brand mt-0.5">
            +{totalXpEarned !== undefined ? totalXpEarned : cardsReviewedCount * 5} XP
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {/* Nút hành động chính: Chuyển sang Ôn tập kiểm tra */}
        <Link href={practiceUrl} className="block w-full">
          <Button
            variant="primary"
            size="lg"
            className="w-full gap-2 text-sm font-semibold bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/25 h-11"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Chuyển sang Ôn tập kiểm tra</span>
          </Button>
        </Link>

        {/* Nút phụ: Dashboard & Bộ sưu tập */}
        <div className="flex items-center gap-3">
          <Link href={ROUTES.APP.DASHBOARD} className="flex-1">
            <Button variant="surface" size="default" className="w-full text-xs gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Dashboard</span>
            </Button>
          </Link>
          <Link href={ROUTES.APP.COLLECTIONS} className="flex-1">
            <Button variant="surface" size="default" className="w-full text-xs gap-1.5">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Bộ sưu tập</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
