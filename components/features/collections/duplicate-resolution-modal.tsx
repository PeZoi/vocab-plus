'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { AnalyzeForkResult } from '@/types/collection.types';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  GitFork,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface DuplicateResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionTitle: string;
  analysis: AnalyzeForkResult | null;
  onConfirm: (selectedCardIds: string[]) => void;
  isSubmitting?: boolean;
}

export function DuplicateResolutionModal({
  isOpen,
  onClose,
  collectionTitle,
  analysis,
  onConfirm,
  isSubmitting = false,
}: DuplicateResolutionModalProps) {
  // Quản lý danh sách ID các thẻ trùng lặp mà người dùng vẫn muốn thêm
  const [checkedDuplicateIds, setCheckedDuplicateIds] = useState<Set<string>>(new Set());

  if (!analysis) return null;

  const {
    threshold,
    total_cards,
    new_cards_count,
    duplicates_count,
    duplicate_items,
    new_card_ids,
  } = analysis;

  const toggleDuplicateItem = (sourceCardId: string) => {
    setCheckedDuplicateIds((prev) => {
      const next = new Set(prev);
      if (next.has(sourceCardId)) {
        next.delete(sourceCardId);
      } else {
        next.add(sourceCardId);
      }
      return next;
    });
  };

  const handleToggleSelectAllDuplicates = () => {
    if (checkedDuplicateIds.size === duplicate_items.length) {
      setCheckedDuplicateIds(new Set());
    } else {
      setCheckedDuplicateIds(new Set(duplicate_items.map((d) => d.source_card_id)));
    }
  };

  // Hành động 1: Chỉ thêm từ mới hoàn toàn (1-click, bỏ qua tất cả từ trùng)
  const handleAddOnlyNew = () => {
    onConfirm(new_card_ids);
  };

  // Hành động 2: Thêm tất cả (cả từ mới lẫn từ trùng lặp)
  const handleAddAll = () => {
    const allIds = [
      ...new_card_ids,
      ...duplicate_items.map((d) => d.source_card_id),
    ];
    onConfirm(allIds);
  };

  // Hành động 3: Thêm theo lựa chọn (từ mới + các từ trùng được tick)
  const handleAddSelected = () => {
    const selectedIds = [
      ...new_card_ids,
      ...Array.from(checkedDuplicateIds),
    ];
    onConfirm(selectedIds);
  };

  const totalSelectedCount = new_cards_count + checkedDuplicateIds.size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2 text-text-primary">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-semibold">Phát hiện từ vựng tương đồng</span>
            <div className="text-xs font-normal text-text-secondary">
              Bộ sưu tập: <strong className="text-text-primary">{collectionTitle}</strong>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner thông tin ngưỡng % */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-text-secondary leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            Hệ thống phát hiện{' '}
            <strong className="text-amber-400 font-semibold">
              {duplicates_count} / {total_cards} từ
            </strong>{' '}
            trong bộ sưu tập có độ tương đồng{' '}
            <strong className="text-amber-400 font-semibold">≥ {threshold}%</strong> so với kho từ vựng cá nhân của bạn.
            Hãy chọn cách bạn muốn xử lý bên dưới.
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-base/60 border border-border/80 text-center">
            <div className="text-[11px] text-text-secondary flex items-center justify-center gap-1">
              <Layers className="w-3 h-3 text-text-secondary" />
              Tổng số từ
            </div>
            <div className="text-lg font-bold text-text-primary mt-0.5">{total_cards}</div>
          </div>

          <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-center">
            <div className="text-[11px] text-success font-medium flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Từ mới hoàn toàn
            </div>
            <div className="text-lg font-bold text-success mt-0.5">{new_cards_count}</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <div className="text-[11px] text-amber-500 font-medium flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Từ tương đồng
            </div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{duplicates_count}</div>
          </div>
        </div>

        {/* Danh sách các từ trùng lặp */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-text-primary">
              Danh sách từ tương đồng ({duplicates_count})
            </span>
            <button
              type="button"
              onClick={handleToggleSelectAllDuplicates}
              className="text-[11px] text-brand hover:underline font-medium"
            >
              {checkedDuplicateIds.size === duplicate_items.length
                ? 'Bỏ chọn tất cả'
                : 'Chọn thêm tất cả'}
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto custom-scrollbar border border-border/70 rounded-xl divide-y divide-border/60 bg-base/30">
            {duplicate_items.map((item) => {
              const isChecked = checkedDuplicateIds.has(item.source_card_id);

              return (
                <div
                  key={item.source_card_id}
                  onClick={() => toggleDuplicateItem(item.source_card_id)}
                  className={`p-3 text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors hover:bg-surface/70 ${
                    isChecked ? 'bg-brand/5' : ''
                  }`}
                >
                  {/* Cột trái: Từ trong collection nguồn */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-text-primary text-sm">
                        {item.source_word}
                      </span>
                      {item.source_pos && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-secondary italic">
                          {item.source_pos}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      {item.source_definition}
                    </p>
                  </div>

                  {/* Cột giữa: Badge độ tương đồng */}
                  <div className="shrink-0 flex flex-col items-center">
                    <Badge
                      variant="warning"
                      className="text-[10px] font-bold px-1.5 py-0.2 gap-1 bg-amber-500/15 border-amber-500/30 text-amber-400"
                    >
                      <Zap className="w-2.5 h-2.5 text-amber-400" />
                      {item.similarity}%
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-text-secondary/50 mt-1" />
                  </div>

                  {/* Cột phải: Từ đã có trong kho cá nhân */}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <span className="font-semibold text-text-primary text-sm">
                        {item.matched_word}
                      </span>
                      {item.matched_pos && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-secondary italic">
                          {item.matched_pos}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      {item.matched_definition}
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div className="shrink-0 pl-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Đã handle ở div container
                      className="w-4 h-4 rounded border-border text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="pt-2 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddAll}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs text-text-secondary hover:text-text-primary"
          >
            Thêm tất cả ({total_cards} từ)
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {checkedDuplicateIds.size > 0 && (
              <Button
                type="button"
                variant="surface"
                size="sm"
                onClick={handleAddSelected}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs"
              >
                Thêm đã chọn ({totalSelectedCount} từ)
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddOnlyNew}
              disabled={isSubmitting || new_cards_count === 0}
              className="w-full sm:w-auto text-xs gap-1.5 font-semibold shadow-lg shadow-brand/20"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Chỉ thêm từ mới ({new_cards_count} từ)</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
