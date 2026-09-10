'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { UserCard } from '@/types/card.types';
import { formatDateTime, formatRelativeTime } from '@/utils/datetime';
import {
  AlertTriangle,
  BrainCircuit,
  Clock,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface VocabDetailFsrsCardProps {
  cardId?: string;
  userCard?: UserCard | null;
  onRefetch?: () => void;
}

export function VocabDetailFsrsCard({ cardId, userCard, onRefetch }: VocabDetailFsrsCardProps) {
  const router = useRouter();
  const [isMarking, setIsMarking] = React.useState(false);
  const isDue = userCard?.due_at ? new Date(userCard.due_at) <= new Date() : false;

  const handleMarkKnown = async () => {
    if (!cardId) return;
    try {
      setIsMarking(true);
      const { cardsService } = await import('@/services/cards.service');
      const { toast } = await import('sonner');
      await cardsService.markKnown(cardId);
      toast.success('Đã đánh dấu thuộc từ này! Từ được thăng cấp lên Nảy mầm 🌱');
      onRefetch?.();
    } catch {
      const { toast } = await import('sonner');
      toast.error('Có lỗi khi cập nhật');
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="rounded-2xl p-5 sm:p-6 bg-surface/90 border border-border/70 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-brand" />
          <span className="text-sm font-bold text-white">Trí nhớ FSRS</span>
        </div>
        <div className="flex items-center gap-1.5">
          {userCard?.is_leech && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Leech
            </span>
          )}
          <Badge variant={isDue ? 'danger' : 'default'} className="text-[10px] font-medium">
            {!userCard
              ? 'Chưa học'
              : userCard.state === 'review'
              ? isDue
                ? 'Đến hạn ôn'
                : 'Đang ôn tập'
              : userCard.state === 'learning'
              ? 'Đang học'
              : userCard.state === 'relearning'
              ? 'Cần học lại'
              : 'Thẻ mới'}
          </Badge>
        </div>
      </div>

      {userCard ? (
        <div className="space-y-4">
          {/* 4 Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Độ ổn định
              </span>
              <span className="text-[16px] sm:text-lg font-bold text-brand block">
                {userCard.stability ? `${userCard.stability.toFixed(1)} ngày` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Độ khó (1-10)
              </span>
              <span className="text-[16px] sm:text-lg font-bold text-white block">
                {userCard.difficulty ? userCard.difficulty.toFixed(1) : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Số lần ôn
              </span>
              <span className="text-[16px] sm:text-lg font-bold text-white block">
                {userCard.review_count ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Số lần quên
              </span>
              <span className={`text-[16px] sm:text-lg font-bold block ${userCard.lapse_count ? 'text-amber-400' : 'text-white'}`}>
                {userCard.lapse_count ?? 0}
              </span>
            </div>
          </div>

          {/* Due Date Indicator */}
          <div className="p-3.5 rounded-xl bg-base/40 border border-border/60 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Lần ôn kế tiếp:
              </span>
              <span className="font-semibold text-white">
                {userCard.due_at ? formatRelativeTime(userCard.due_at) : 'Chưa xếp lịch'}
              </span>
            </div>
            {userCard.due_at && (
              <div className="text-[11px] text-slate-400 text-right">
                {formatDateTime(userCard.due_at)}
              </div>
            )}
          </div>

          {/* Review Action Button */}
          <div className="space-y-2 pt-1">
            {cardId && (!userCard || userCard.state !== 'review' || (Number(userCard.stability) || 0) < 14) && (
              <Button
                type="button"
                onClick={handleMarkKnown}
                disabled={isMarking}
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 border border-amber-400/20 font-medium h-8"
                title="Bỏ qua giai đoạn Hạt mầm nếu bạn đã thuộc từ này từ trước"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span className='text-xs'>Tôi đã thuộc từ này</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Thẻ này chưa được đưa vào chu trình ghi nhớ Spaced Repetition.
          </p>
          <div className="space-y-2">
            <Button
              onClick={() => router.push(ROUTES.APP.REVIEW)}
              variant="primary"
              className="w-full gap-2 text-xs text-white"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Bắt đầu phiên học</span>
            </Button>

            {cardId && (
              <Button
                type="button"
                onClick={handleMarkKnown}
                disabled={isMarking}
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs text-amber-400 hover:text-amber-300 border-amber-400/30"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>Tôi đã thuộc từ này</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
