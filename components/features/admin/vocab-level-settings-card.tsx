'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save, ShieldAlert, Sprout, Check } from 'lucide-react';
import type { VocabLevelSettings } from '@/types/system-settings.types';
import { useVocabLevelSettingsForm } from '@/hooks/features/admin/use-vocab-level-settings-form';
import { VocabLevelRowItem } from './vocab-level-row-item';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

interface VocabLevelSettingsCardProps {
  initialConfig?: VocabLevelSettings;
  onSave: (config: VocabLevelSettings) => Promise<void>;
  isSaving: boolean;
}

export function VocabLevelSettingsCard({
  initialConfig,
  onSave,
  isSaving,
}: VocabLevelSettingsCardProps) {
  const {
    config,
    isDirty,
    handleLevelChange,
    handlePenaltyRuleChange,
    handleReset,
    handleSave,
  } = useVocabLevelSettingsForm({
    initialConfig,
    onSave,
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-border space-y-6 shadow-xs">
      {/* Header (Đã loại bỏ badge Lottie 60fps thừa thãi) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-lime-500/10 border border-lime-500/25 flex items-center justify-center text-lime-400 shrink-0 shadow-inner">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Cấu Hình Cấp Độ Cây Sinh Trưởng (Level 0 ➔ 5)
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Tùy chỉnh biểu tượng, tên gọi hai ngôn ngữ, điều kiện thăng cấp và quy tắc phạt khi làm sai.
            </p>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Tooltip content="Khôi phục về cài đặt gốc">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="text-xs text-text-secondary hover:text-text-primary gap-1.5 h-9 px-3 rounded-xl border border-transparent hover:border-border"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="text-xs gap-1.5 bg-brand hover:bg-brand-hover text-white h-9 px-4 rounded-xl shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </Button>
        </div>
      </div>

      {/* Penalty Rule Selection */}
      <div className="p-4 sm:p-4.5 rounded-2xl bg-base/60 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand shrink-0" />
            Quy tắc xử lý khi người học làm SAI câu hỏi
          </span>
          <p className="text-xs text-text-secondary">
            Xác định mức độ trừ cấp độ khi người học trả lời sai câu hỏi trong bài kiểm tra Ranked Quiz.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handlePenaltyRuleChange('drop_one')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border',
              config.penaltyRule === 'drop_one'
                ? 'bg-brand text-white border-brand shadow-xs'
                : 'bg-surface/80 text-text-secondary border-border hover:text-text-primary hover:bg-surface'
            )}
          >
            {config.penaltyRule === 'drop_one' && <Check className="w-3.5 h-3.5" />}
            <span>Giảm 1 cấp (Khuyên dùng)</span>
          </button>

          <button
            type="button"
            onClick={() => handlePenaltyRuleChange('drop_to_zero')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border',
              config.penaltyRule === 'drop_to_zero'
                ? 'bg-brand text-white border-brand shadow-xs'
                : 'bg-surface/80 text-text-secondary border-border hover:text-text-primary hover:bg-surface'
            )}
          >
            {config.penaltyRule === 'drop_to_zero' && <Check className="w-3.5 h-3.5" />}
            <span>Về Level 0 (Khắt khe)</span>
          </button>
        </div>
      </div>

      {/* 6 Levels List (Mỗi Level là 1 Card rộng rãi, cân xứng, chuẩn responsive) */}
      <div className="space-y-3.5">
        {config.levels.map((lvl, index) => (
          <VocabLevelRowItem
            key={lvl.level}
            level={lvl}
            index={index}
            onChange={handleLevelChange}
          />
        ))}
      </div>
    </div>
  );
}
