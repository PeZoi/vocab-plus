'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import { CronJobsManager } from '@/components/features/admin/cron-jobs/cron-jobs-manager';
import AdminCronJobsLoading from './loading';

export default function AdminCronJobsPage() {
  const { isAdmin, isLoading: profileLoading } = useUserProfile();

  if (profileLoading) {
    return <AdminCronJobsLoading />;
  }

  // Chặn người dùng không có quyền Admin
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-danger/15 text-danger border border-danger/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Truy cập bị từ chối</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Trang này chỉ dành riêng cho <strong>Quản trị viên (Admin)</strong> để quản lý các tác vụ
          lập lịch tự động (Cron Jobs) của hệ thống.
        </p>
        <div className="pt-2">
          <Link href={ROUTES.APP.DASHBOARD}>
            <Button variant="surface" size="default" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang chính</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4">
      <CronJobsManager />
    </div>
  );
}
