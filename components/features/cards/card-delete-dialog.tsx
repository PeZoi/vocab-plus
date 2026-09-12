'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useDeleteCardMutation } from '@/hooks/features/cards/use-card-mutation';
import type { CardWithProgress } from '@/types/card.types';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface CardDeleteDialogProps {
  card: CardWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CardDeleteDialog({
  card,
  isOpen,
  onClose,
  onSuccess,
}: CardDeleteDialogProps) {
  const deleteMutation = useDeleteCardMutation();

  if (!card) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(card.id);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Lỗi khi xóa thẻ:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle className="w-5 h-5" />
          <span>Xác nhận xóa từ vựng</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <p className="text-sm text-text-secondary leading-relaxed">
          Bạn có chắc chắn muốn xóa từ vựng{' '}
          <strong className="text-text-primary font-semibold font-mono">
            &ldquo;{card.word}&rdquo;
          </strong>{' '}
          khỏi kho thẻ? Thao tác này cũng sẽ xóa toàn bộ tiến trình học và lịch sử ôn tập của thẻ này.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            variant="danger"
            size="default"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-1.5"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
