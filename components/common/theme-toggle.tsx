'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const emptySubscribe = () => () => {};

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ className, showLabels = false }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-xl bg-surface/60 border border-border/70 flex items-center justify-center text-text-secondary',
          className
        )}
      >
        <span className="w-4 h-4 rounded-full bg-border/80 animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (showLabels) {
    return (
      <div className={cn('flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border', className)}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            theme === 'light'
              ? 'bg-brand text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          )}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Sáng</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            theme === 'dark'
              ? 'bg-brand text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          )}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Tối</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            theme === 'system'
              ? 'bg-brand text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          )}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Hệ thống</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative w-9 h-9 rounded-xl bg-surface/70 hover:bg-surface border border-border/80 hover:border-brand/40 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200 shadow-2xs group outline-none',
        className
      )}
      title={isDark ? 'Chuyển sang chế độ Sáng (Light Mode)' : 'Chuyển sang chế độ Tối (Dark Mode)'}
      aria-label="Đổi giao diện Sáng / Tối"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center text-amber-300 group-hover:text-amber-200"
          >
            <Moon className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center text-brand group-hover:text-brand-hover"
          >
            <Sun className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
