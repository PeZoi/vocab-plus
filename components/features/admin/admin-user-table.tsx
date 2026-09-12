'use client';

import React, { useState } from 'react';
import type { AdminUserListItem } from '@/types/admin-user.types';
import { ROUTES } from '@/constants/routes';
import { formatDateTime, formatRelativeTime } from '@/utils/datetime';
import {
  ExternalLink,
  Flame,
  RotateCcw,
  ShieldCheck,
  Zap,
  Users,
  Calendar,
  BookOpen,
  FolderGit2,
  GraduationCap,
  Copy,
  Check,
  SearchX,
  SlidersHorizontal,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/user-avatar';
import Link from 'next/link';

interface AdminUserTableProps {
  users: AdminUserListItem[];
  isLoading: boolean;
  onResetStreakClick: (user: AdminUserListItem) => void;
  onClearFilters?: () => void;
}

/**
 * Skeleton Loader cao cấp cho bảng quản lý người dùng
 */
export function AdminUserTableSkeleton() {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/90 overflow-hidden shadow-xl shadow-black/20 backdrop-blur-md">
      {/* Banner thông báo trạng thái đang tải */}
      <div className="px-5 py-3.5 bg-brand/10 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand/20 border border-brand/30 flex items-center justify-center text-brand animate-spin">
            <Loader2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <span>Đang tải danh sách học viên & chỉ số SRS...</span>
              <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
            </p>
            <p className="text-[11px] text-text-secondary">
              Đang đồng bộ dữ liệu người dùng từ cơ sở dữ liệu Supabase
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand font-medium animate-pulse">
          <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
          <span>Đang đồng bộ...</span>
        </div>
      </div>

      {/* Skeleton Rows */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[860px]">
          <thead>
            <tr className="border-b border-border/80 bg-base/60 text-text-secondary uppercase text-[10px] tracking-wider font-bold">
              <th className="py-3.5 px-4">Người dùng</th>
              <th className="py-3.5 px-3">Vai trò</th>
              <th className="py-3.5 px-3">Streak</th>
              <th className="py-3.5 px-3">XP Tích lũy</th>
              <th className="py-3.5 px-3">Từ vựng / Bộ thẻ</th>
              <th className="py-3.5 px-3">Ngày tham gia</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-base/80 border border-border/60 shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="h-3.5 bg-base/80 rounded w-28" />
                      <div className="h-2.5 bg-base/50 rounded w-36" />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="h-6 w-16 bg-base/80 rounded-full" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="space-y-1.5">
                    <div className="h-4 w-14 bg-base/80 rounded" />
                    <div className="h-2.5 w-20 bg-base/50 rounded" />
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="h-5 w-16 bg-base/80 rounded-lg" />
                </td>
                <td className="py-3.5 px-3">
                  <div className="space-y-1.5">
                    <div className="h-4 w-12 bg-base/80 rounded" />
                    <div className="h-2.5 w-16 bg-base/50 rounded" />
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <div className="h-3.5 w-20 bg-base/80 rounded" />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-8 w-24 bg-base/80 rounded-xl" />
                    <div className="h-8 w-16 bg-base/80 rounded-xl" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminUserTable({
  users,
  isLoading,
  onResetStreakClick,
  onClearFilters,
}: AdminUserTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (isLoading) {
    return <AdminUserTableSkeleton />;
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-surface/80 border border-border/80 shadow-md space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-base border border-border flex items-center justify-center mx-auto text-text-secondary">
          <SearchX className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <p className="font-bold text-sm text-text-primary">Không tìm thấy người dùng phù hợp</p>
          <p className="text-xs text-text-secondary">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc vai trò hiện tại.
          </p>
        </div>
        {onClearFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs rounded-xl border-border hover:border-brand/50 hover:text-brand"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-surface/95 overflow-hidden shadow-xl shadow-black/20 backdrop-blur-md">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs min-w-[760px]">
          <thead>
            <tr className="border-b border-border/80 bg-base/70 text-text-secondary uppercase text-[10px] tracking-wider font-bold">
              <th className="py-3 px-3.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Người dùng</span>
                </div>
              </th>
              <th className="py-3 px-2.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Vai trò</span>
                </div>
              </th>
              <th className="py-3 px-2.5">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Chuỗi Streak</span>
                </div>
              </th>
              <th className="py-3 px-2.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>XP Tích lũy</span>
                </div>
              </th>
              <th className="py-3 px-2.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Kho từ / Bộ thẻ</span>
                </div>
              </th>
              <th className="py-3 px-2.5">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Ngày tham gia</span>
                </div>
              </th>
              <th className="py-3 px-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-text-secondary" />
                  <span>Thao tác</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {users.map((u) => {
              const isAdmin = u.role === 'admin';
              const hasStreak = u.current_streak > 0;

              return (
                <tr
                  key={u.id}
                  className="hover:bg-surface-hover/60 transition-colors duration-150 group"
                >
                  {/* Cột Thông tin Người dùng */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={u.avatar_url}
                          name={u.display_name}
                          size="md"
                          className={isAdmin ? 'ring-2 ring-brand/50 ring-offset-2 ring-offset-base' : ''}
                        />
                        {isAdmin && (
                          <div
                            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center shadow-xs border border-base"
                            title="Quản trị viên"
                          >
                            <ShieldCheck className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={ROUTES.ADMIN.USER_DETAIL(u.id)}
                          className="font-bold text-text-primary group-hover:text-brand transition-colors truncate block text-sm"
                        >
                          {u.display_name || 'Chưa đặt tên'}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-text-secondary/70 truncate block max-w-[120px] sm:max-w-[160px]">
                            {u.id}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(u.id, e)}
                            className="text-text-secondary/50 hover:text-brand transition-colors p-0.5 rounded"
                            title="Sao chép User ID"
                          >
                            {copiedId === u.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cột Vai trò */}
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand/15 text-brand border border-brand/30 shadow-xs shadow-brand/10">
                        <ShieldCheck className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400">
                        <GraduationCap className="w-3 h-3" />
                        Học viên
                      </span>
                    )}
                  </td>

                  {/* Cột Chuỗi Streak */}
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {hasStreak ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono font-bold text-xs w-fit">
                          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                          <span>{u.current_streak} ngày</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-base/80 border border-border/70 text-text-secondary/70 font-mono font-medium text-xs w-fit">
                          <Flame className="w-3.5 h-3.5 text-text-secondary/50" />
                          <span>0 ngày</span>
                        </span>
                      )}
                      <span className="text-[10px] text-text-secondary">
                        {u.last_active_date
                          ? `Học: ${formatRelativeTime(u.last_active_date)}`
                          : 'Chưa học hôm nay'}
                      </span>
                    </div>
                  </td>

                  {/* Cột XP Tích lũy */}
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs">
                      <Zap className="w-3.5 h-3.5 fill-amber-400/30 text-amber-400" />
                      {u.xp.toLocaleString()} XP
                    </span>
                  </td>

                  {/* Cột Từ vựng / Bộ thẻ */}
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-primary bg-base/90 px-2 py-0.5 rounded-md border border-border/70">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                        <span>{u.total_cards} từ</span>
                      </div>
                      <div className="text-[10px] text-text-secondary flex items-center gap-1">
                        <FolderGit2 className="w-2.5 h-2.5 text-text-secondary/70" />
                        <span>{u.public_collections_count} bộ công khai</span>
                      </div>
                    </div>
                  </td>

                  {/* Cột Ngày tham gia */}
                  <td className="py-3 px-2.5 text-text-secondary whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-text-secondary/70" />
                      <span>{u.created_at ? formatDateTime(u.created_at, 'dd/MM/yyyy') : '—'}</span>
                    </div>
                  </td>

                  {/* Cột Thao tác */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* Nút Reset / Giả lập Streak */}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => onResetStreakClick(u)}
                        className="h-8 px-2.5 text-xs font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/15 border border-orange-500/20 hover:border-orange-500/40 rounded-xl gap-1.5 transition-all shadow-xs"
                        title="Reset hoặc giả lập Streak cho học viên này"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset Streak</span>
                      </Button>

                      {/* Nút Xem chi tiết hồ sơ */}
                      <Link href={ROUTES.ADMIN.USER_DETAIL(u.id)}>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 text-xs font-semibold rounded-xl gap-1.5 border-border hover:border-text-primary/40 hover:bg-base text-text-primary transition-all shadow-xs"
                          title="Xem chi tiết học tập và các bộ thẻ của học viên"
                        >
                          <span>Chi tiết</span>
                          <ExternalLink className="w-3 h-3 text-text-secondary" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer bảng thống kê */}
      <div className="px-4 py-3 bg-base/50 border-t border-border/70 flex items-center justify-between text-[11px] text-text-secondary flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>
            Hiển thị <strong className="text-text-primary">{users.length}</strong> học viên
          </span>
        </div>
      </div>
    </div>
  );
}
