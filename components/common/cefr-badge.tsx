import { cn } from '@/lib/utils';
import type { CEFRLevel } from '@/types/card.types';

interface CEFRBadgeProps {
  level?: CEFRLevel | string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const CEFR_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  A1: {
    label: 'A1',
    bg: 'bg-emerald-50 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-500/30',
    desc: 'Sơ cấp (Beginner)',
  },
  A2: {
    label: 'A2',
    bg: 'bg-teal-50 dark:bg-teal-500/15',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-300 dark:border-teal-500/30',
    desc: 'Tiền trung cấp (Elementary)',
  },
  B1: {
    label: 'B1',
    bg: 'bg-sky-50 dark:bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-300 dark:border-sky-500/30',
    desc: 'Trung cấp (Intermediate)',
  },
  B2: {
    label: 'B2',
    bg: 'bg-blue-50 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-500/30',
    desc: 'Trung cao cấp (Upper-Intermediate)',
  },
  C1: {
    label: 'C1',
    bg: 'bg-purple-50 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-500/30',
    desc: 'Cao cấp (Advanced)',
  },
  C2: {
    label: 'C2',
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/15',
    text: 'text-fuchsia-700 dark:text-fuchsia-400',
    border: 'border-fuchsia-300 dark:border-fuchsia-500/30',
    desc: 'Thành thạo (Mastery)',
  },
};

export function CEFRBadge({
  level,
  className,
  size = 'sm',
  showLabel = false,
}: CEFRBadgeProps) {
  if (!level) return null;

  const normalized = level.toUpperCase();
  const config = CEFR_CONFIG[normalized] || {
    label: normalized,
    bg: 'bg-surface',
    text: 'text-text-secondary',
    border: 'border-border',
    desc: 'Cấp độ ' + normalized,
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 font-bold tracking-wide rounded',
    md: 'text-xs px-2 py-0.5 font-bold tracking-wider rounded-md',
    lg: 'text-sm px-2.5 py-1 font-bold tracking-wider rounded-md',
  };

  return (
    <span
      title={`Cấp độ CEFR: ${config.label} - ${config.desc}`}
      className={cn(
        'inline-flex items-center gap-1 border select-none transition-colors font-mono',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      <span>{config.label}</span>
      {showLabel && (
        <span className="font-sans font-normal opacity-85 text-[9px]">
          {config.desc.split(' ')[0]}
        </span>
      )}
    </span>
  );
}
