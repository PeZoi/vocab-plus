'use client';

import React, { useState, useMemo } from 'react';
import { useAdminUsersQuery } from '@/hooks/features/admin/use-admin-users';
import { AdminUserTable } from '@/components/features/admin/admin-user-table';
import { ResetStreakDialog } from '@/components/features/admin/reset-streak-dialog';
import { StreakActivatedPopup } from '@/components/features/practice/streak-activated-popup';
import type { AdminUserListItem } from '@/types/admin-user.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, RotateCcw, ShieldCheck, Flame, Zap, X } from 'lucide-react';
import { motion } from 'motion/react';
import { pageVariants } from '@/constants/animations';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [selectedUserForStreak, setSelectedUserForStreak] = useState<AdminUserListItem | null>(null);
  const [previewStreakCount, setPreviewStreakCount] = useState<number | null>(null);

  const { data, isLoading, refetch, isRefetching } = useAdminUsersQuery({
    search: search.trim() || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
  });

  const users = useMemo(() => data?.users || [], [data?.users]);
  const total = data?.total || 0;

  // Tính toán nhanh số liệu thống kê cho hàng thẻ tổng quan
  const stats = useMemo(() => {
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const userCount = users.filter((u) => u.role !== 'admin').length;
    const activeStreakCount = users.filter((u) => u.current_streak > 0).length;
    const totalXp = users.reduce((acc, u) => acc + (u.xp || 0), 0);

    return {
      adminCount,
      userCount,
      activeStreakCount,
      totalXp,
    };
  }, [users]);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('all');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                  Quản Lý Người Dùng
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-base border border-border/80 text-text-secondary">
                  {total} tài khoản
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Xem danh sách học viên, quản lý quyền hạn và điều chỉnh trạng thái chuỗi Streak kiểm thử.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching || isLoading}
          className="text-xs gap-1.5 rounded-xl border-border hover:border-brand/40 hover:text-brand shrink-0 h-9"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-brand' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </Button>
      </div>

      {/* Thẻ thống kê tổng quan (Stat Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tổng người dùng */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-text-secondary font-medium">Tổng tài khoản</p>
            <p className="text-lg font-mono font-bold text-text-primary mt-0.5">
              {isLoading ? '...' : total}
            </p>
          </div>
        </div>

        {/* Card 2: Quản trị viên */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-text-secondary font-medium">Quản trị viên</p>
            <p className="text-lg font-mono font-bold text-brand mt-0.5">
              {isLoading ? '...' : stats.adminCount}
            </p>
          </div>
        </div>

        {/* Card 3: Có chuỗi Streak */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-text-secondary font-medium">Đang giữ Streak</p>
            <p className="text-lg font-mono font-bold text-orange-400 mt-0.5">
              {isLoading ? '...' : stats.activeStreakCount}
            </p>
          </div>
        </div>

        {/* Card 4: Tổng XP */}
        <div className="p-4 rounded-2xl bg-surface/90 border border-border/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-text-secondary font-medium">Tổng XP tích lũy</p>
            <p className="text-lg font-mono font-bold text-amber-400 mt-0.5">
              {isLoading ? '...' : stats.totalXp.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-surface/90 border border-border/80 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shadow-xs">
        {/* Ô tìm kiếm với nút xóa nhanh */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo tên học viên hoặc mã User ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 text-xs h-9 bg-base/80 border-border/80 rounded-xl focus-visible:ring-1 focus-visible:ring-brand"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded-md"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-base border border-border/80 shrink-0">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              roleFilter === 'all'
                ? 'bg-brand text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Tất cả</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              roleFilter === 'all' ? 'bg-white/20 text-white' : 'bg-surface text-text-secondary'
            }`}>
              {total}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              roleFilter === 'admin'
                ? 'bg-brand text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Quản trị viên</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              roleFilter === 'admin' ? 'bg-white/20 text-white' : 'bg-surface text-text-secondary'
            }`}>
              {stats.adminCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('user')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              roleFilter === 'user'
                ? 'bg-brand text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Học viên</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              roleFilter === 'user' ? 'bg-white/20 text-white' : 'bg-surface text-text-secondary'
            }`}>
              {stats.userCount}
            </span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <AdminUserTable
        users={users}
        isLoading={isLoading}
        onResetStreakClick={(user) => setSelectedUserForStreak(user)}
        onClearFilters={handleClearFilters}
      />

      {/* Reset Streak Dialog */}
      <ResetStreakDialog
        isOpen={Boolean(selectedUserForStreak)}
        onClose={() => setSelectedUserForStreak(null)}
        user={selectedUserForStreak}
        onPreviewStreak={(count) => {
          setSelectedUserForStreak(null);
          setPreviewStreakCount(count);
        }}
      />

      {/* Popup hoạt họa ngọn lửa Duolingo (Xem trước & Kiểm thử) */}
      <StreakActivatedPopup
        isOpen={previewStreakCount !== null}
        streakCount={previewStreakCount || 1}
        onClose={() => setPreviewStreakCount(null)}
      />
    </motion.div>
  );
}
