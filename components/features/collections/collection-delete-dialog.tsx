'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useDeleteCollectionMutation } from '@/hooks/features/collections/use-collections';
import type { Collection } from '@/types/collection.types';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface CollectionDeleteDialogProps {
  collection: Collection | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CollectionDeleteDialog({
  collection,
  isOpen,
  onClose,
  onSuccess,
}: CollectionDeleteDialogProps) {
  const deleteMutation = useDeleteCollectionMutation();

  if (!collection) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(collection.id);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Lỗi khi xóa bộ sưu tập:', err);
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
          <span>Xác nhận xóa bộ sưu tập</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        <p className="text-sm text-text-secondary leading-relaxed">
          Bạn có chắc chắn muốn xóa vĩnh viễn bộ sưu tập{' '}
          <strong className="text-text-primary font-semibold">
            &ldquo;{collection.title}&rdquo;
          </strong>
          ?
        </p>

        <div className="text-xs text-text-secondary/80 bg-base/60 p-3 rounded-xl border border-border/60 space-y-1">
          <span className="font-semibold text-text-primary block">Lưu ý:</span>
          <span>
            Thao tác này sẽ xóa bộ sưu tập khỏi danh sách. Các thẻ từ vựng trong bộ này vẫn được lưu giữ an toàn trong kho từ vựng cá nhân của bạn.
          </span>
        </div>

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
