'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, User, UserCheck } from 'lucide-react';
import { pageVariants } from '@/constants/animations';
import { useUserProfile, useOtherUserProfileQuery } from '@/hooks/features/user/use-user-profile';
import { UserProfileDetailView, UserProfileDetailSkeleton } from '@/components/features/users/user-profile-detail-view';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';

export default function OtherUserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id || '';

  const { profile: currentUser, isAdmin } = useUserProfile();
  const { data: detail, isLoading, error, refetch, isRefetching } = useOtherUserProfileQuery(userId);

  const isSelf = Boolean(currentUser?.id && currentUser.id === userId);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-4xl mx-auto pb-16"
    >
      {/* Top Nav & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(ROUTES.APP.LEADERBOARD);
            }
          }}
          className="gap-1.5 text-xs text-text-secondary hover:text-text-primary -ml-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Button>

        <div className="flex items-center gap-2">
          {isSelf && (
            <Link href={ROUTES.APP.PROFILE}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs gap-1.5 rounded-xl border-brand/30 text-brand hover:bg-brand/10"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Trang cá nhân của bạn</span>
              </Button>
            </Link>
          )}

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
      </div>

      {/* Main Content */}
      {isLoading ? (
        <UserProfileDetailSkeleton />
      ) : error || !detail ? (
        <div className="p-12 text-center text-text-secondary text-xs rounded-3xl bg-surface/50 border border-border/70 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <p className="font-semibold text-rose-400 text-sm">Không tìm thấy thông tin người dùng</p>
          <p className="text-[11px] max-w-sm mx-auto">
            Người dùng này không tồn tại hoặc đã bị gỡ khỏi hệ thống.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(ROUTES.APP.LEADERBOARD)}
            className="text-xs rounded-xl"
          >
            Xem Bảng xếp hạng
          </Button>
        </div>
      ) : (
        <UserProfileDetailView
          detail={detail}
          isAdminView={isAdmin}
        />
      )}
    </motion.div>
  );
}
