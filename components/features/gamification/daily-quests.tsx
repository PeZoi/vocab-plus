'use client';

import React from 'react';
import { Target, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDailyQuestsQuery } from '@/hooks/features/gamification/use-daily-quests';
import { motion } from 'motion/react';
import type { DailyQuest } from '@/types/quest.types';

interface QuestItemProps {
  quest: DailyQuest;
}

function QuestItem({ quest }: QuestItemProps) {
  const isDone = quest.is_completed || quest.progress >= quest.target;
  const percent = Math.min(100, Math.round(((quest.progress || 0) / quest.target) * 100));

  return (
    <div
      className={`p-2.5 rounded-xl border transition-all ${
        isDone
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-base/50 border-border/60 hover:border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2 text-xs mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {isDone ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
          )}
          <span
            className={`truncate font-medium ${
              isDone
                ? 'line-through text-text-secondary text-[11px]'
                : 'text-text-primary text-xs'
            }`}
            title={quest.title || 'Nhiệm vụ'}
          >
            {quest.title || 'Nhiệm vụ'}
          </span>
        </div>

        <span
          className={`shrink-0 text-[11px] font-bold ${
            isDone ? 'text-emerald-400' : 'text-brand'
          }`}
        >
          {isDone ? 'Đã nhận ' : '+'}{quest.reward_xp} XP
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-base rounded-full overflow-hidden border border-border/40">
          <motion.div
            className={`h-full rounded-full transition-all ${
              isDone ? 'bg-emerald-500' : 'bg-brand'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[10px] font-semibold text-text-secondary whitespace-nowrap min-w-7 text-right">
          {quest.progress}/{quest.target}
        </span>
      </div>
    </div>
  );
}

function QuestSkeletonLoading() {
  return (
    <div className="space-y-3 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function DailyQuests() {
  const { data, isLoading } = useDailyQuestsQuery();

  const quests = data?.quests || [];
  const completedCount = data?.completedCount || 0;
  const totalCount = data?.totalCount || quests.length;
  const allCompleted = data?.allCompleted || false;

  return (
    <div 
      className="bg-surface/95 backdrop-blur-xl border border-border/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-text-primary flex items-center gap-1.5">
              Nhiệm vụ hôm nay
              {allCompleted && <span className="text-emerald-400 text-xs">🎉</span>}
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-text-secondary">
              <Clock className="w-3 h-3" />
              <span>Làm mới mỗi ngày lúc 00:00</span>
            </div>
          </div>
        </div>

        <Badge
          variant={allCompleted ? 'success' : 'outline'}
          className={`text-[10px] font-bold px-2 py-0.5 ${
            allCompleted 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
              : 'border-brand/30 text-brand bg-brand/10'
          }`}
        >
          {completedCount}/{totalCount} Xong
        </Badge>
      </div>

      {/* Body: Skeleton, Empty or List */}
      {isLoading ? (
        <QuestSkeletonLoading />
      ) : quests.length === 0 ? (
        <div className="py-6 text-center text-xs text-text-secondary">
          Không có nhiệm vụ nào cho hôm nay
        </div>
      ) : (
        <div className="space-y-2.5">
          {quests.map((q) => (
            <QuestItem key={q.id} quest={q} />
          ))}
        </div>
      )}

      {/* Footer Encouragement */}
      {allCompleted && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Tuyệt vời! Bạn đã hoàn thành toàn bộ nhiệm vụ hôm nay.</span>
        </div>
      )}
    </div>
  );
}
