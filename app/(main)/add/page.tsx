'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardFormManual } from '@/components/features/cards/card-form-manual';
import { CardFormAiPreview } from '@/components/features/cards/card-form-ai-preview';
import { Edit3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pageVariants, tabVariants } from '@/constants/animations';

export default function AddWordPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai');

  const tabs = [
    { id: 'ai' as const, label: 'AI Phân tích tự động', icon: Sparkles },
    { id: 'manual' as const, label: 'Nhập thủ công', icon: Edit3 },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto space-y-5"
    >
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
          Thêm từ vựng mới
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Chọn phương thức thêm từ: Phân tích tự động bằng AI hoặc điền thủ công
        </p>
      </div>

      {/* Segmented Control with sliding layoutId pill */}
      <div className="flex p-1 rounded-lg bg-surface/80 border border-border/70 max-w-md relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer z-10',
                isActive
                  ? 'text-white font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-brand rounded-md shadow-2xs z-[-1]"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content with AnimatePresence */}
      <div className="pt-1">
        <AnimatePresence mode="wait">
          {activeTab === 'ai' ? (
            <motion.div
              key="ai"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CardFormAiPreview />
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-5 rounded-xl bg-surface/80 border border-border/70 shadow-xs"
            >
              <CardFormManual />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
