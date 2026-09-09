'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { formatXP } from '@/utils/formatters';

interface HeaderXpWidgetProps {
  totalXp: number;
  todayXp: number;
  xpCap: number;
}

export function HeaderXpWidget({ totalXp, todayXp, xpCap }: HeaderXpWidgetProps) {
  const isCapReached = todayXp >= xpCap;
  const xpProgress = Math.min(100, Math.round((todayXp / xpCap) * 100));

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface/80 border border-border/70 cursor-default group"
      title={`Tổng tích lũy: ${formatXP(totalXp)} • Hôm nay: ${todayXp} / ${xpCap} XP (Giới hạn ngày)`}
    >
      {/* Total XP Display */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Zap
          className={`w-3.5 h-3.5 shrink-0 ${
            isCapReached ? 'text-amber-400 fill-amber-400' : 'text-brand fill-brand/80'
          }`}
        />
        <span className="text-xs font-bold text-text-primary">
          {formatXP(totalXp)}
        </span>
      </div>

      {/* Daily XP Mini Progress Bar (Desktop) */}
      <div className="hidden sm:flex items-center pl-2.5 border-l border-border/70">
        <div className="flex flex-col justify-center gap-1 w-16">
          <div className="flex items-center justify-between text-[10px] font-semibold leading-none whitespace-nowrap">
            <span className={todayXp > 0 ? 'text-brand font-bold' : 'text-text-secondary'}>
              {formatXP(todayXp)}
            </span>
            <span className="text-text-secondary text-[9px] font-normal">
              /{xpCap}
            </span>
          </div>
          <div className="h-1.5 w-full bg-base rounded-full overflow-hidden border border-border/50 shadow-inner">
            <motion.div
              className={`h-full rounded-full ${isCapReached ? 'bg-amber-400' : 'bg-brand'}`}
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
