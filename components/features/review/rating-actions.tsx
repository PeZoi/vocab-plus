'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import type { ReviewRating } from '@/types/review.types';
import { cn } from '@/lib/utils';

interface RatingActionsProps {
  onRate: (rating: ReviewRating) => void;
  disabled?: boolean;
}

export function RatingActions({ onRate, disabled = false }: RatingActionsProps) {
  // Lắng nghe phím tắt bàn phím 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === '1') onRate(1);
      if (e.key === '2') onRate(2);
      if (e.key === '3') onRate(3);
      if (e.key === '4') onRate(4);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRate, disabled]);

  const buttons: {
    rating: ReviewRating;
    label: string;
    sublabel: string;
    shortcut: string;
    colorClass: string;
  }[] = [
    {
      rating: 1,
      label: 'Quên / Lại',
      sublabel: 'Again (< 10m)',
      shortcut: '1',
      colorClass:
        'border-danger/30 text-danger hover:bg-danger hover:text-white active:bg-danger/90',
    },
    {
      rating: 2,
      label: 'Khó',
      sublabel: 'Hard (~1d)',
      shortcut: '2',
      colorClass:
        'border-warning/30 text-warning hover:bg-warning hover:text-[#0B0F17] active:bg-warning/90',
    },
    {
      rating: 3,
      label: 'Nhớ tốt',
      sublabel: 'Good (~3d)',
      shortcut: '3',
      colorClass:
        'border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white active:bg-sky-600',
    },
    {
      rating: 4,
      label: 'Rất dễ',
      sublabel: 'Easy (~7d+)',
      shortcut: '4',
      colorClass:
        'border-success/30 text-success hover:bg-success hover:text-white active:bg-success/90',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl mx-auto">
      {buttons.map((btn) => (
        <motion.button
          key={btn.rating}
          type="button"
          disabled={disabled}
          onClick={() => onRate(btn.rating)}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={cn(
            'flex flex-col items-center justify-center p-2.5 rounded-xl border bg-surface/90 transition-colors disabled:opacity-40 disabled:pointer-events-none group shadow-2xs cursor-pointer',
            btn.colorClass
          )}
        >
          <div className="flex items-center gap-1 font-semibold text-xs sm:text-sm">
            <span>{btn.label}</span>
            <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] rounded bg-base/60 border border-border/80 text-text-secondary group-hover:text-inherit">
              {btn.shortcut}
            </kbd>
          </div>
          <span className="text-[10px] opacity-75 mt-0.5">{btn.sublabel}</span>
        </motion.button>
      ))}
    </div>
  );
}
