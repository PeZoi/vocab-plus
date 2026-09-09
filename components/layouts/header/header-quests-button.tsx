'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Check } from 'lucide-react';
import { useDailyQuestsQuery } from '@/hooks/features/gamification/use-daily-quests';
import { useClickOutside } from '@/hooks/common/use-click-outside';
import { DailyQuests } from '@/components/features/gamification/daily-quests';

export function HeaderQuestsButton() {
  const { data: questsData } = useDailyQuestsQuery();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const completedQuests = questsData?.completedCount ?? 0;
  const totalQuests = questsData?.totalCount ?? 3;
  const allQuestsDone = questsData?.allCompleted ?? false;

  return (
    <div ref={containerRef} className="relative flex items-center">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${
          allQuestsDone 
            ? 'text-emerald-400 hover:bg-emerald-500/10' 
            : 'text-brand hover:bg-brand/10'
        }`}
        title="Nhiệm vụ hàng ngày"
      >
        <Target className="w-5 h-5" />
        <span 
          className={`absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold border border-surface shadow-xs transition-colors ${
            allQuestsDone 
              ? 'bg-emerald-500 text-white' 
              : 'bg-brand text-white shadow-brand/20'
          }`}
        >
          {allQuestsDone ? (
            <Check className="w-2.5 h-2.5" />
          ) : (
            `${completedQuests}/${totalQuests}`
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 shadow-2xl rounded-2xl"
          >
            <DailyQuests />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
