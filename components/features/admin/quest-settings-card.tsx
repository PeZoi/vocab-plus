'use client';

import React from 'react';
import { Target, Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuestSettings } from '@/hooks/features/admin/use-quest-settings';
import type { QuestTemplate, QuestType } from '@/types/quest.types';

interface QuestTemplateItemProps {
  quest: QuestTemplate;
  index: number;
  onUpdate: (id: string, updates: Partial<QuestTemplate>) => void;
  onRemove: (id: string) => void;
}

function QuestTemplateItem({ quest, index, onUpdate, onRemove }: QuestTemplateItemProps) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all space-y-3 ${
        quest.is_active
          ? 'bg-base/60 border-border/80'
          : 'bg-base/30 border-border/40 opacity-70'
      }`}
    >
      {/* Top row: Index, Title & Active toggle / Delete */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-bold text-text-secondary shrink-0">
            {index + 1}
          </span>
          <Input
            value={quest.title}
            onChange={(e) => onUpdate(quest.id, { title: e.target.value })}
            placeholder="Tiêu đề nhiệm vụ (VD: Hoàn thành 30 thẻ ôn tập)"
            className="h-8 text-xs font-semibold bg-surface border-border flex-1 min-w-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdate(quest.id, { is_active: !quest.is_active })}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
              quest.is_active
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-surface border-border text-text-secondary'
            }`}
            title={quest.is_active ? 'Đang kích hoạt' : 'Đang tạm tắt'}
          >
            {quest.is_active ? 'Đang bật' : 'Đã tắt'}
          </button>

          <button
            type="button"
            onClick={() => onRemove(quest.id)}
            className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            title="Xóa nhiệm vụ này"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom row: Quest Type, Target, Reward XP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50 text-xs">
        <div className="space-y-1">
          <label className="text-[11px] text-text-secondary font-medium">
            Hành vi / Loại nhiệm vụ
          </label>
          <Select
            value={quest.quest_type}
            onValueChange={(val: QuestType) => onUpdate(quest.id, { quest_type: val })}
          >
            <SelectTrigger className="h-8 text-xs bg-surface border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="review_cards">Ôn tập thẻ từ</SelectItem>
              <SelectItem value="learn_new">Học từ vựng mới</SelectItem>
              <SelectItem value="earn_xp">Tích lũy XP</SelectItem>
              <SelectItem value="accuracy">Độ chính xác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-text-secondary font-medium">
            Mục tiêu số lần (Target)
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={1000}
              value={quest.target}
              onChange={(e) =>
                onUpdate(quest.id, { target: Math.max(1, Number(e.target.value) || 1) })
              }
              className="h-8 text-xs font-bold bg-surface border-border"
            />
            <span className="text-[11px] text-text-secondary whitespace-nowrap">
              {quest.quest_type === 'accuracy' ? '%' : 'lần'}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-text-secondary font-medium">
            Điểm thưởng nhận được
          </label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={1}
              max={500}
              value={quest.reward_xp}
              onChange={(e) =>
                onUpdate(quest.id, { reward_xp: Math.max(1, Number(e.target.value) || 1) })
              }
              className="h-8 text-xs font-bold text-brand bg-surface border-border"
            />
            <span className="text-[11px] font-semibold text-brand whitespace-nowrap">XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestSettingsCardProps {
  initialTemplates?: QuestTemplate[];
  onSave: (templates: QuestTemplate[]) => Promise<void>;
  isSaving: boolean;
}

export function QuestSettingsCard({
  initialTemplates,
  onSave,
  isSaving,
}: QuestSettingsCardProps) {
  const {
    templates,
    isDirty,
    handleAddQuest,
    handleRemoveQuest,
    handleUpdateQuest,
    handleReset,
    handleSaveClick,
  } = useQuestSettings({ initialTemplates, onSave });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-border/80 space-y-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Cấu Hình Nhiệm Vụ Hàng Ngày (Daily Quests)
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Thiết lập danh sách nhiệm vụ, số lần mục tiêu (target) và điểm thưởng XP gán cho người dùng mỗi ngày.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddQuest}
          className="gap-1.5 text-xs text-brand border-brand/30 hover:bg-brand/10 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm nhiệm vụ</span>
        </Button>
      </div>

      <div className="space-y-3.5">
        {templates.map((quest, index) => (
          <QuestTemplateItem
            key={quest.id}
            quest={quest}
            index={index}
            onUpdate={handleUpdateQuest}
            onRemove={handleRemoveQuest}
          />
        ))}
      </div>

      <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-text-secondary hover:text-text-primary gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục mặc định</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={handleSaveClick}
          disabled={isSaving || !isDirty}
          className="gap-2 text-xs font-semibold bg-brand hover:bg-brand-hover text-white shadow-xs shadow-brand/30"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Nhiệm Vụ'}</span>
        </Button>
      </div>
    </div>
  );
}
