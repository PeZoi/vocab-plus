'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { WordLevelBadge } from '@/components/common/word-level-badge';
import { Button } from '@/components/ui/button';
import { staggerContainer, staggerItem } from '@/constants/animations';
import { ROUTES } from '@/constants/routes';
import type { CardWithProgress } from '@/types/card.types';
import { formatRelativeTime } from '@/utils/datetime';
import { ArrowRight, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

interface DashboardRecentCardsProps {
  cards: CardWithProgress[];
}

export function DashboardRecentCards({ cards }: DashboardRecentCardsProps) {
  return (
    <div className="p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Bộ từ vựng gần đây ({cards.length})
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">
            Danh sách các từ vựng bạn đã lưu vào hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.APP.VOCAB}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-brand hover:text-brand-hover">
              <span>Xem tất cả ({cards.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
          <Link href={ROUTES.APP.ADD}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ</span>
            </Button>
          </Link>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="py-8 text-center text-text-secondary text-xs">
          Bạn chưa có từ vựng nào trong bộ thẻ.{' '}
          <Link href={ROUTES.APP.ADD} className="text-brand font-medium hover:underline">
            Bấm vào đây để thêm từ đầu tiên!
          </Link>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="divide-y divide-border/50"
        >
          {cards.slice(0, 10).map((item) => (
            <motion.div
              key={item.id}
              variants={staggerItem}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
              className="py-2.5 flex items-center justify-between gap-3 hover:bg-surface-hover/30 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AudioButton text={item.word} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={ROUTES.APP.VOCAB_DETAIL(item.id)}
                      className="font-semibold text-sm text-text-primary hover:text-brand transition-colors truncate"
                    >
                      {item.word}
                    </Link>
                    {item.ipa && (
                      <span className="font-mono text-[11px] text-text-secondary hidden sm:inline">
                        {item.ipa}
                      </span>
                    )}
                    {item.cefr_level && (
                      <CEFRBadge level={item.cefr_level} size="sm" />
                    )}
                    <WordLevelBadge userCard={item.user_card} mode="compact" />
                    
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {item.definition}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-text-secondary block">
                  {formatRelativeTime(item.created_at || new Date())}
                </span>
                <span className="text-[9px] font-mono text-brand font-medium">
                  {item.source_type === 'ai_generated' ? 'AI' : 'Thủ công'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
