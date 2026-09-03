import React from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <EmptyState
        icon={Trophy}
        title="Bảng xếp hạng (Phase 10)"
        description="Tính năng so tài điểm kinh nghiệm (XP) và thách đấu từ vựng (Duel 1v1) sẽ được hoàn thiện ở Phase 10."
      />
    </div>
  );
}
