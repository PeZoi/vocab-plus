'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Trophy, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

interface ListeningSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalSegments: number;
  completedCount: number;
  podcastTitle: string;
  onRestart: () => void;
}

export function ListeningSummaryModal({
  isOpen,
  onClose,
  totalSegments,
  completedCount,
  podcastTitle,
  onRestart,
}: ListeningSummaryModalProps) {
  const xpEarned = completedCount * 15;
  const completionRate = totalSegments > 0 ? Math.round((completedCount / totalSegments) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Hoàn Thành Phiên Luyện Nghe!</span>
        </div>
      }
      description={`Bạn vừa hoàn thành các phân đoạn trong "${podcastTitle}".`}
      maxWidth="sm"
    >
      <div className="space-y-5 text-center pt-2">
        {/* Trophy icon */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-surface flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-base border border-border/80 text-center">
            <span className="text-[11px] font-semibold text-text-secondary">Đã chép</span>
            <p className="text-base font-extrabold text-text-primary mt-0.5">
              {completedCount} / {totalSegments}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-base border border-border/80 text-center">
            <span className="text-[11px] font-semibold text-text-secondary">Tỷ lệ</span>
            <p className="text-base font-extrabold text-emerald-500 mt-0.5">
              {completionRate}%
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-base border border-border/80 text-center">
            <span className="text-[11px] font-semibold text-text-secondary">Thưởng XP</span>
            <p className="text-base font-extrabold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>+{xpEarned}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRestart();
            }}
            className="w-full h-11 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-brand/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện Tập Lại Video Này</span>
          </button>

          <Link
            href={ROUTES.APP.VOCAB}
            className="w-full h-11 rounded-2xl bg-base hover:bg-surface-hover border border-border text-text-primary text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Vào Kho Từ Vựng Ôn Tập</span>
            <ArrowRight className="w-4 h-4 text-text-secondary" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
