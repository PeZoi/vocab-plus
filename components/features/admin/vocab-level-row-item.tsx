'use client';

import React from 'react';
import { LottieIcon } from '@/components/common/lottie-icon';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  type LevelColorTheme,
  type LevelThresholdConfig,
} from '@/types/system-settings.types';
import { LEVEL_COLOR_MAP } from '@/utils/fsrs-level';

interface VocabLevelRowItemProps {
  level: LevelThresholdConfig;
  index: number;
  onChange: (index: number, field: keyof LevelThresholdConfig, value: string | number) => void;
}

const COLOR_OPTIONS: Array<{ value: LevelColorTheme; label: string }> = [
  { value: 'slate', label: 'Xám đất (Slate)' },
  { value: 'lime', label: 'Xanh mạ (Lime)' },
  { value: 'emerald', label: 'Xanh lá (Emerald)' },
  { value: 'teal', label: 'Xanh ngọc (Teal)' },
  { value: 'rose', label: 'Hồng thắm (Rose)' },
  { value: 'amber', label: 'Vàng kim (Amber)' },
];

export function VocabLevelRowItem({
  level,
  index,
  onChange,
}: VocabLevelRowItemProps) {
  const colorStyles = LEVEL_COLOR_MAP[level.colorTheme] || LEVEL_COLOR_MAP.slate;

  return (
    <div
      className={cn(
        'p-3.5 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3',
        colorStyles.bg,
        colorStyles.border
      )}
    >
      {/* Left: Lottie Preview & Level Badge */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="p-1 rounded-lg bg-surface/90 border border-border/70 shrink-0">
          <LottieIcon animationKey={level.lottieKey} size="md" loop autoplay />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded bg-base/80 border border-border/70">
              Lv.{level.level}
            </span>
            <span className={cn('text-sm font-bold', colorStyles.text)}>
              {level.name}
            </span>
          </div>
          <span className="text-[11px] text-text-secondary block">
            {level.nameEn} • {level.icon}
          </span>
        </div>
      </div>

      {/* Middle: Form Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
        {/* Tên tiếng Việt */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-text-secondary uppercase">
            Tên tiếng Việt
          </label>
          <Input
            value={level.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            className="h-8 text-xs bg-base/80 border-border"
          />
        </div>

        {/* Tên tiếng Anh */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-text-secondary uppercase">
            Tên tiếng Anh
          </label>
          <Input
            value={level.nameEn}
            onChange={(e) => onChange(index, 'nameEn', e.target.value)}
            className="h-8 text-xs bg-base/80 border-border"
          />
        </div>

        {/* Số lần đúng yêu cầu */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-text-secondary uppercase">
            Cần đúng liên tiếp
          </label>
          <Input
            type="number"
            min={0}
            max={50}
            value={level.minConsecutiveCorrect}
            onChange={(e) =>
              onChange(index, 'minConsecutiveCorrect', parseInt(e.target.value) || 0)
            }
            className="h-8 text-xs bg-base/80 border-border font-mono text-center"
          />
        </div>

        {/* Màu chủ đạo */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-text-secondary uppercase">
            Màu sắc
          </label>
          <Select
            value={level.colorTheme}
            onValueChange={(val) =>
              onChange(index, 'colorTheme', val as LevelColorTheme)
            }
          >
            <SelectTrigger className="h-8 text-xs bg-base/80 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
