'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { CardWithProgress } from '@/types/card.types';
import {
  AlertTriangle,
  ExternalLink,
  Plus,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DuplicateWordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newWord: string;
  newDefinition?: string;
  newPartOfSpeech?: string | null;
  matchedCard: CardWithProgress | null;
  similarity: number;
  threshold: number;
  onConfirmAdd: () => void;
  onViewExisting?: (existingCardId: string) => void;
  isSubmitting?: boolean;
}

export function DuplicateWordDialog({
  isOpen,
  onClose,
  newWord,
  newDefinition,
  newPartOfSpeech,
  matchedCard,
  similarity,
  threshold,
  onConfirmAdd,
  onViewExisting,
  isSubmitting = false,
}: DuplicateWordDialogProps) {
  if (!matchedCard) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5 text-text-primary">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-semibold">Từ vựng đã có hoặc tương tự</span>
            <div className="text-xs font-normal text-text-secondary">
              Độ tương đồng: <strong className="text-amber-400 font-bold">{similarity}%</strong> (Ngưỡng cảnh báo: ≥ {threshold}%)
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Banner khuyến nghị */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-text-secondary leading-relaxed flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            Hệ thống phát hiện từ bạn đang thêm rất giống với một từ đã có trong kho cá nhân. Để tối ưu thuật toán và tránh loãng từ, bạn có thể xem lại từ cũ hoặc tiếp tục thêm thẻ mới này.
          </div>
        </div>

        {/* Khung so sánh 2 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Cột 1: Từ đang chuẩn bị thêm */}
          <div className="p-3.5 rounded-xl bg-base/60 border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">
                Từ chuẩn bị thêm
              </span>
              <Badge variant="outline" className="text-[10px] text-brand border-brand/30">
                Mới
              </Badge>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base font-bold text-text-primary">{newWord}</span>
                {newPartOfSpeech && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-secondary italic">
                    {newPartOfSpeech}
                  </span>
                )}
              </div>
              {newDefinition && (
                <p className="text-xs text-text-secondary mt-1 line-clamp-3 leading-relaxed">
                  {newDefinition}
                </p>
              )}
            </div>
          </div>

          {/* Cột 2: Từ đã có trong kho */}
          <div className="p-3.5 rounded-xl bg-surface/90 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">
                Đã có trong kho
              </span>
              <Badge
                variant="warning"
                className="text-[10px] font-bold px-1.5 py-0.2 gap-1 bg-amber-500/15 border-amber-500/30 text-amber-400"
              >
                <Zap className="w-2.5 h-2.5" />
                {similarity}%
              </Badge>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base font-bold text-text-primary">{matchedCard.word}</span>
                {matchedCard.part_of_speech && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-base border border-border text-text-secondary italic">
                    {matchedCard.part_of_speech}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-1 line-clamp-3 leading-relaxed">
                {matchedCard.definition}
              </p>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="pt-3 border-t border-border/70 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto text-xs text-text-secondary hover:text-text-primary"
          >
            Hủy bỏ / Đổi từ khác
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onViewExisting && (
              <Button
                type="button"
                variant="surface"
                size="sm"
                onClick={() => onViewExisting(matchedCard.id)}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs gap-1.5 text-text-primary"
              >
                <ExternalLink className="w-3.5 h-3.5 text-brand" />
                <span>Xem từ đã có</span>
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onConfirmAdd}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-xs gap-1.5 font-semibold shadow-xs shadow-brand/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vẫn thêm từ này</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
