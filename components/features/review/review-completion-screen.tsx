'use client';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { ArrowLeft, FolderKanban, Trophy } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface ReviewCompletionScreenProps {
  cardsReviewedCount: number;
  isCustomSession: boolean;
}

export function ReviewCompletionScreen({
  cardsReviewedCount,
  isCustomSession,
}: ReviewCompletionScreenProps) {
  return (
    <div className="max-w-md mx-auto text-center py-12 px-4 space-y-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto success-glow">
        <Trophy className="w-10 h-10 animate-bounce" />
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
          Tuyệt vời! Hoàn thành phiên ôn tập!
        </h2>
        <p className="text-sm text-text-secondary mt-2">
          Bạn đã ôn tập xong <span className="font-bold text-brand">{cardsReviewedCount}</span> thẻ
          {isCustomSession ? ' trong phiên ôn tập tùy chỉnh.' : ' theo lịch FSRS hôm nay.'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-around text-center">
        <div>
          <span className="text-xs text-text-secondary">Thẻ đã ôn</span>
          <p className="text-xl font-bold text-text-primary">{cardsReviewedCount}</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <span className="text-xs text-text-secondary">XP ước tính</span>
          <p className="text-xl font-bold text-brand">+{cardsReviewedCount * 5} XP</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link href={ROUTES.APP.DASHBOARD} className="flex-1">
          <Button variant="surface" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Về Dashboard
          </Button>
        </Link>
        <Link href={ROUTES.APP.COLLECTIONS} className="flex-1">
          <Button variant="primary" className="w-full">
            <FolderKanban className="w-4 h-4 mr-2" />
            Bộ sưu tập
          </Button>
        </Link>
      </div>
    </div>
  );
}
