'use client';

import { EmptyState } from '@/components/common/empty-state';
import { ROUTES } from '@/constants/routes';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ReviewEmptyStateProps {
  isCustomSession: boolean;
}

export function ReviewEmptyState({ isCustomSession }: ReviewEmptyStateProps) {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto py-12 space-y-4">
      {isCustomSession && (
        <div className="p-3 rounded-xl bg-surface border border-border/80 text-center text-xs text-text-secondary">
          <span>Phiên học tùy chỉnh này hiện chưa có thẻ nào.</span>
        </div>
      )}
      <EmptyState
        icon={CheckCircle}
        title={isCustomSession ? 'Bộ từ hiện chưa có thẻ nào!' : 'Không có thẻ nào cần ôn hôm nay!'}
        description={
          isCustomSession
            ? 'Bộ sưu tập này chưa có thẻ từ vựng hoặc các thẻ chưa được liên kết.'
            : 'Bạn đã hoàn thành xuất sắc toàn bộ lịch học FSRS ngày hôm nay. Hãy tiếp tục duy trì chuỗi học tập nhé!'
        }
        actionText={isCustomSession ? 'Quay lại Bộ sưu tập' : 'Thêm từ vựng mới để học'}
        onAction={() => {
          router.push(isCustomSession ? ROUTES.APP.COLLECTIONS : ROUTES.APP.ADD);
        }}
      />
    </div>
  );
}
