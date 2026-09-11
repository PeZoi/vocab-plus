'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { WordLevelBadge } from '@/components/common/word-level-badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/constants/animations';
import { ROUTES } from '@/constants/routes';
import type { CardWithProgress } from '@/types/card.types';
import { formatRelativeTime } from '@/utils/datetime';
import { CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

interface DashboardRecentCardsProps {
  cards: CardWithProgress[];
}

export function DashboardRecentCards({ cards }: DashboardRecentCardsProps) {
  const [mountedTime, setMountedTime] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedTime(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Chỉ lấy các từ vựng "Trong trạng thái cần ôn tập ngay" (due_at <= now)
  const urgentCards = useMemo(() => {
    if (!mountedTime) return [];

    const list = cards.filter((item) => {
      const uc = item.user_card;
      if (!uc?.due_at) return false;
      return new Date(uc.due_at).getTime() <= mountedTime;
    });

    // Sắp xếp: Thẻ quá hạn lâu nhất lên trước (due_at ASC)
    return list.sort((a, b) => {
      const tA = new Date(a.user_card!.due_at!).getTime();
      const tB = new Date(b.user_card!.due_at!).getTime();
      return tA - tB;
    });
  }, [cards, mountedTime]);

  return (
    <div className="p-5 rounded-xl bg-surface/80 border border-border/70 flex flex-col justify-start gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
            <h3 className="text-sm font-bold text-text-primary">
              Từ vựng cần ôn tập ngay
            </h3>
            {urgentCards.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                {urgentCards.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-secondary mt-1">
            {urgentCards.length > 0
              ? 'Các từ vựng đã đến hạn chu kỳ FSRS cần được ôn tập ngay'
              : 'Tuyệt vời! Hiện không có từ vựng nào đến hạn ôn tập'}
          </p>
        </div>

        {urgentCards.length > 0 && (
          <Link href={ROUTES.APP.REVIEW} className="shrink-0">
            <Button size="sm" className="gap-1.5 text-xs font-semibold bg-brand hover:bg-brand-hover text-white shadow-sm shadow-brand/25 rounded-xl px-3.5 py-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ôn tập ngay ({urgentCards.length})</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Body: Danh sách thẻ hoặc Empty State */}
      {cards.length === 0 ? (
        <div className="py-10 text-center text-text-secondary text-xs space-y-2 my-auto">
          <p>Bạn chưa có từ vựng nào trong kho lưu trữ.</p>
          <Link href={ROUTES.APP.ADD} className="inline-block text-brand font-medium hover:underline">
            Bấm vào đây để thêm từ đầu tiên!
          </Link>
        </div>
      ) : urgentCards.length === 0 ? (
        <div className="py-8 px-4 rounded-xl bg-base/50 border border-border/50 text-center space-y-3 my-auto">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text-primary">
              Tuyệt vời! Không có từ nào cần ôn tập ngay
            </p>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Bạn đã ôn tập xong toàn bộ các từ đến hạn FSRS hôm nay. Hãy tiếp tục duy trì phong độ nhé!
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Link href={ROUTES.APP.PRACTICE}>
              <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Luyện tập tự do
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Vùng danh sách thẻ có cuộn mượt mà (Scrollable container) */
        <div className="max-h-[330px] overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-2.5"
          >
            {urgentCards.map((item) => (
              <motion.div
                key={item.id}
                variants={staggerItem}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className="p-3 rounded-xl bg-base/60 border border-border/70 hover:border-brand/40 hover:bg-surface-hover/40 transition-all flex items-center justify-between gap-3 group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AudioButton text={item.word} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={ROUTES.APP.VOCAB_DETAIL(item.id)}
                        className="font-bold text-sm text-text-primary group-hover:text-brand transition-colors truncate"
                      >
                        {item.word}
                      </Link>
                      {item.ipa && (
                        <span className="font-mono text-xs text-text-secondary hidden sm:inline">
                          {item.ipa}
                        </span>
                      )}
                      {item.cefr_level && (
                        <CEFRBadge level={item.cefr_level} size="sm" />
                      )}
                      <WordLevelBadge userCard={item.user_card} mode="compact" />
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-1 leading-snug">
                      {item.definition}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30 shadow-xs">
                    <Flame className="w-2.5 h-2.5 text-red-400" />
                    Đến hạn
                  </span>
                  <span className="text-[10px] text-text-secondary/80 font-medium block">
                    {item.user_card?.due_at
                      ? formatRelativeTime(item.user_card.due_at)
                      : formatRelativeTime(item.created_at || new Date())}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Export alias để tương thích và linh hoạt
export { DashboardRecentCards as DashboardUrgentCards };
