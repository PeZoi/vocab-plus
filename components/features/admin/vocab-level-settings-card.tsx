'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save, ShieldAlert, Sprout } from 'lucide-react';
import type { VocabLevelSettings } from '@/types/system-settings.types';
import { useVocabLevelSettingsForm } from '@/hooks/features/admin/use-vocab-level-settings-form';
import { VocabLevelRowItem } from './vocab-level-row-item';

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
    <div className="p-5 rounded-2xl bg-surface/90 border border-border space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text-primary">
                Cấu Hình Cấp Độ Cây Sinh Trưởng (Level 0 ➔ 5)
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-lime-500/15 text-lime-400 border border-lime-500/30">
                Lottie 60fps
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Tùy chỉnh tên gọi, biểu tượng, số lần test đúng yêu cầu và quy tắc phạt khi làm sai.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="text-xs text-text-secondary hover:text-text-primary gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="text-xs gap-1.5 bg-brand hover:bg-brand-hover text-white"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}</span>
          </Button>
        </div>
      </div>

      {/* Penalty Rule Selection */}
      <div className="p-3.5 rounded-xl bg-base/60 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-brand" />
            Quy tắc xử lý khi người học làm SAI câu hỏi (Penalty Rule)
          </span>
          <p className="text-[11px] text-text-secondary">
            Xác định mức độ trừ cấp khi làm sai bài kiểm tra Ranked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={config.penaltyRule === 'drop_one' ? 'primary' : 'outline'}
            onClick={() => handlePenaltyRuleChange('drop_one')}
            className="text-xs h-8"
          >
            Giảm 1 cấp (Khuyên dùng)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={config.penaltyRule === 'drop_to_zero' ? 'primary' : 'outline'}
            onClick={() => handlePenaltyRuleChange('drop_to_zero')}
            className="text-xs h-8"
          >
            Về Level 0 (Khắt khe)
          </Button>
        </div>
      </div>

      {/* 6 Levels Table / Grid */}
      <div className="space-y-3">
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
