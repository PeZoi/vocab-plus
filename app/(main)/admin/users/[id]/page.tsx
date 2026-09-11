'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminUserDetailQuery } from '@/hooks/features/admin/use-admin-users';
import { UserProfileDetailView } from '@/components/features/users/user-profile-detail-view';
import { ResetStreakDialog } from '@/components/features/admin/reset-streak-dialog';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { pageVariants } from '@/constants/animations';
import Link from 'next/link';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || '';

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const { data: detail, isLoading, error, refetch, isRefetching } = useAdminUserDetailQuery(userId);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Top Nav & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link href={ROUTES.ADMIN.USERS}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-text-secondary hover:text-text-primary -ml-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Quản lý người dùng</span>
          </Button>
        </Link>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-xs gap-1.5 rounded-xl border-border shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-16 text-center text-text-secondary text-xs rounded-3xl bg-surface/50 border border-border/70 animate-pulse space-y-2">
          <p className="font-semibold text-text-primary">Đang tải thông tin người dùng...</p>
        </div>
      ) : error || !detail ? (
        <div className="p-12 text-center text-text-secondary text-xs rounded-3xl bg-surface/50 border border-border/70 space-y-3">
          <p className="font-semibold text-rose-400">Không tìm thấy thông tin người dùng</p>
          <p className="text-[11px]">Người dùng này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(ROUTES.ADMIN.USERS)}
            className="text-xs"
          >
            Trở về danh sách
          </Button>
        </div>
      ) : (
        <>
          <UserProfileDetailView
            detail={detail}
            isAdminView={true}
            onResetStreakClick={() => setIsResetDialogOpen(true)}
          />

          {/* Reset Streak Dialog */}
          <ResetStreakDialog
            isOpen={isResetDialogOpen}
            onClose={() => setIsResetDialogOpen(false)}
            user={{
              id: detail.id,
              display_name: detail.display_name,
              current_streak: detail.current_streak,
            }}
          />
        </>
      )}
    </motion.div>
  );
}
