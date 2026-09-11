'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Sprout } from 'lucide-react';
import { LottieIcon } from '@/components/common/lottie-icon';
import type { CardWithProgress } from '@/types/card.types';
import { useLevelDistribution } from '@/hooks/features/dashboard/use-level-distribution';
import { cn } from '@/lib/utils';

interface DashboardLevelDistributionProps {
  cards: CardWithProgress[];
}

export function DashboardLevelDistribution({ cards }: DashboardLevelDistributionProps) {
  const {
    levelConfig,
    levelCounts,
    totalCards,
    maxCount,
    ancientCount,
  } = useLevelDistribution(cards);

  return (
    <div className="p-5 rounded-2xl bg-surface/80 border border-border/70 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Khu Vườn Từ Vựng
          </h3>
        </div>
        {ancientCount > 0 ? (
          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {ancientCount} Đại thụ
          </span>
        ) : (
          <span className="text-[11px] text-text-secondary">Cấp độ sinh trưởng</span>
        )}
      </div>

      {/* Level List */}
      <div className="space-y-2.5">
        {levelConfig.levels.map((lvl) => {
          const count = levelCounts[lvl.level] || 0;
          const pct = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
          const barWidthPct = (count / maxCount) * 100;

          return (
            <div key={lvl.level} className="space-y-1 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <LottieIcon
                      animationKey={lvl.lottieKey}
                      size="sm"
                      triggerOnHover={true}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-text-secondary">
                    Lv.{lvl.level}
                  </span>
                  <span className="text-xs font-medium text-text-primary group-hover:text-brand transition-colors">
                    {lvl.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-text-primary">
                    {count}
                  </span>
                  <span className="text-[10px] text-text-secondary font-mono w-9 text-right">
                    ({pct}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-base rounded-full overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidthPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full transition-all',
                    lvl.level === 0 && 'bg-zinc-500',
                    lvl.level === 1 && 'bg-lime-500',
                    lvl.level === 2 && 'bg-emerald-500',
                    lvl.level === 3 && 'bg-green-600',
                    lvl.level === 4 && 'bg-pink-500',
                    lvl.level === 5 && 'bg-gradient-to-r from-amber-400 to-yellow-500'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
