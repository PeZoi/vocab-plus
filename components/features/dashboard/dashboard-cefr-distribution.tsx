'use client';

import { CEFRBadge } from '@/components/common/cefr-badge';
import { CEFR_LEVELS_CONFIG, CEFR_LEVELS_LIST } from '@/constants/cefr';
import { BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface DashboardCefrDistributionProps {
  cefrDistribution: Record<string, number>;
  totalCards: number;
}

export function DashboardCefrDistribution({
  cefrDistribution,
  totalCards,
}: DashboardCefrDistributionProps) {
  const maxLvl = Math.max(...Object.values(cefrDistribution), 1);

  return (
    <div className="p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Phân bổ Cấp độ CEFR
          </h3>
        </div>
        <span className="text-[11px] text-text-secondary">Chuẩn quốc tế</span>
      </div>

      <div className="space-y-2 py-1">
        {CEFR_LEVELS_LIST.map((lvl) => {
          const count = cefrDistribution[lvl] || 0;
          const pct = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
          const config = CEFR_LEVELS_CONFIG[lvl];

          return (
            <div key={lvl} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <CEFRBadge level={lvl} size="sm" />
                  <span className="text-[11px] text-text-secondary font-medium">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-text-primary">{count}</span>
                  <span className="text-[10px] text-text-secondary">({pct}%)</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-base rounded-full overflow-hidden border border-border/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxLvl) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${config.barColor}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
