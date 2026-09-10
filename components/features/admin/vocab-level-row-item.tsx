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
import { Hash, Palette, Type } from 'lucide-react';

interface VocabLevelRowItemProps {
  level: LevelThresholdConfig;
  index: number;
  onChange: (index: number, field: keyof LevelThresholdConfig, value: string | number) => void;
}

const COLOR_OPTIONS: Array<{
  value: LevelColorTheme;
  label: string;
  dotColor: string;
}> = [
  { value: 'slate', label: 'Xám đất (Slate)', dotColor: 'bg-slate-400' },
  { value: 'lime', label: 'Xanh mạ (Lime)', dotColor: 'bg-lime-400' },
  { value: 'emerald', label: 'Xanh lá (Emerald)', dotColor: 'bg-emerald-400' },
  { value: 'teal', label: 'Xanh ngọc (Teal)', dotColor: 'bg-teal-400' },
  { value: 'rose', label: 'Hồng thắm (Rose)', dotColor: 'bg-rose-400' },
  { value: 'amber', label: 'Vàng kim (Amber)', dotColor: 'bg-amber-400' },
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
        'p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col gap-4 shadow-xs',
        colorStyles.bg,
        colorStyles.border
      )}
    >
      {/* Top Bar: Level Identity & Visual Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Visual Icon Box: To, rõ, rực rỡ, không bị đen sì */}
          <div
            className={cn(
              'w-13 h-13 rounded-2xl border flex items-center justify-center relative shrink-0 shadow-inner overflow-hidden',
              colorStyles.border,
              'bg-surface/90 backdrop-blur-xs'
            )}
          >
            {/* Lottie Animation or Vector Fallback */}
            <LottieIcon
              animationKey={level.lottieKey}
              size="lg"
              loop
              autoplay
              fallbackIcon={<span className="text-2xl select-none">{level.icon}</span>}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-base/90 border border-border/80 text-text-primary">
                Lv.{level.level}
              </span>
              <h4 className={cn('text-base font-bold tracking-tight', colorStyles.text)}>
                {level.name}
              </h4>
              <span className="text-xs text-text-secondary font-medium hidden sm:inline">
                ({level.nameEn})
              </span>
            </div>

            <p className="text-xs text-text-secondary mt-1 line-clamp-1">
              {level.description || 'Cấp độ phát triển cây sinh trưởng trong chu kỳ học'}
            </p>
          </div>
        </div>

        {/* Right Tag: Visual level indicator */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <div
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border',
              colorStyles.border,
              'bg-base/70'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                COLOR_OPTIONS.find((c) => c.value === level.colorTheme)?.dotColor || 'bg-slate-400'
              )}
            />
            <span className={cn('text-[11px]', colorStyles.text)}>
              {level.icon} {level.name}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Form Fields Layout (Rộng rãi, không bị ép, không vỡ layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3.5 border-t border-border/60">
        {/* Tên tiếng Việt */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-text-secondary" />
            <span>Tên tiếng Việt</span>
          </label>
          <Input
            value={level.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder="vd: Hạt mầm"
            className="h-9 text-xs bg-base/80 border-border rounded-xl focus:border-brand"
          />
        </div>

        {/* Tên tiếng Anh */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
            <Type className="w-3.5 h-3.5 text-text-secondary" />
            <span>Tên tiếng Anh</span>
          </label>
          <Input
            value={level.nameEn}
            onChange={(e) => onChange(index, 'nameEn', e.target.value)}
            placeholder="vd: Seed"
            className="h-9 text-xs bg-base/80 border-border rounded-xl focus:border-brand"
          />
        </div>

        {/* Cần đúng liên tiếp */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-text-secondary" />
            <span>Cần đúng liên tiếp</span>
          </label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              max={50}
              value={level.minConsecutiveCorrect}
              onChange={(e) =>
                onChange(index, 'minConsecutiveCorrect', parseInt(e.target.value) || 0)
              }
              className="h-9 text-xs bg-base/80 border-border rounded-xl font-mono pr-12 focus:border-brand"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-secondary select-none">
              lần
            </span>
          </div>
        </div>

        {/* Màu sắc chủ đạo */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-text-secondary" />
            <span>Màu sắc giao diện</span>
          </label>
          <Select
            value={level.colorTheme}
            onValueChange={(val) =>
              onChange(index, 'colorTheme', val as LevelColorTheme)
            }
          >
            <SelectTrigger className="h-9 text-xs bg-base/80 border-border rounded-xl focus:border-brand">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-surface">
              {COLOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', opt.dotColor)} />
                    <span>{opt.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
