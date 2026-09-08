'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useBulkDeleteCardsMutation } from '@/hooks/features/cards/use-card-mutation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface BulkDeleteCardsDialogProps {
  cardIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkDeleteCardsDialog({
  cardIds,
  isOpen,
  onClose,
  onSuccess,
}: BulkDeleteCardsDialogProps) {
  const bulkDeleteMutation = useBulkDeleteCardsMutation();
  const count = cardIds.length;

  if (count === 0) return null;

  const handleDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(cardIds);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Lỗi khi xóa hàng loạt thẻ:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Xác nhận xóa {count} từ vựng</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Bạn có chắc chắn muốn xóa vĩnh viễn{' '}
          <strong className="text-danger font-bold">{count} từ vựng đã chọn</strong>{' '}
          khỏi kho cá nhân không?
        </p>

        <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-xs text-text-secondary leading-relaxed">
          <strong className="text-danger font-semibold">Lưu ý quan trọng:</strong> Hành động này
          sẽ xóa toàn bộ tiến trình học FSRS, độ ổn định (stability), độ khó và lịch sử ôn tập của các thẻ này. Thao tác không thể hoàn tác!
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onClose}
            disabled={bulkDeleteMutation.isPending}
            className="text-xs"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            variant="danger"
            size="default"
            onClick={handleDelete}
            disabled={bulkDeleteMutation.isPending}
            className="gap-1.5 text-xs font-semibold"
          >
            {bulkDeleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xóa {count} từ...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Xóa vĩnh viễn ({count})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
