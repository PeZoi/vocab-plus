import React from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { FileText } from 'lucide-react';

export default function ImportPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <EmptyState
        icon={FileText}
        title="Tính năng Import văn bản (Phase 2)"
        description="Tính năng paste đoạn văn bản tiếng Anh để AI tự động phát hiện từ mới và phân tích hàng loạt đang được chuẩn bị triển khai ở Phase 2."
      />
    </div>
  );
}
