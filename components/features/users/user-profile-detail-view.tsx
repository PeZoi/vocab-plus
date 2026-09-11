'use client';

import React from 'react';
import type { AdminUserDetail } from '@/types/admin-user.types';
import { ROUTES } from '@/constants/routes';
import { formatDateTime, formatRelativeTime } from '@/utils/datetime';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Folder,
  Globe,
  Heart,
  GitFork,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface UserProfileDetailViewProps {
  detail: AdminUserDetail;
  isAdminView?: boolean;
  onResetStreakClick?: () => void;
}

export function UserProfileDetailView({
  detail,
  isAdminView = false,
  onResetStreakClick,
}: UserProfileDetailViewProps) {
  const { stats, public_collections } = detail;

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border/80 relative overflow-hidden space-y-5 shadow-lg">
        {/* Glow ambient background */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand via-amber-500 to-emerald-400" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand to-amber-500 p-0.5 shadow-md shadow-brand/20 shrink-0">
              <div className="w-full h-full rounded-2xl bg-base overflow-hidden flex items-center justify-center relative">
                {detail.avatar_url ? (
                  <Image
                    src={detail.avatar_url}
                    alt={detail.display_name || 'User'}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-text-secondary" />
                )}
              </div>
            </div>

            {/* Main Info */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight truncate">
                  {detail.display_name || 'Người dùng chưa đặt tên'}
                </h1>
                {detail.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/30">
                    <ShieldCheck className="w-3 h-3" />
                    Quản trị viên
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25">
                    Học viên
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-text-secondary/80 truncate">
                ID: {detail.id}
              </p>

              <div className="flex items-center gap-3 text-xs text-text-secondary pt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                  Tham gia: {detail.created_at ? formatDateTime(detail.created_at, 'dd/MM/yyyy') : 'Chưa rõ'}
                </span>
                {detail.timezone && (
                  <span className="flex items-center gap-1 hidden sm:flex">
                    <Globe className="w-3.5 h-3.5 text-text-secondary" />
                    {detail.timezone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badges & Admin Actions */}
          <div className="flex flex-col items-end gap-2.5 shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              {/* Streak Badge */}
              <div
                className="px-3 py-1.5 rounded-xl bg-brand/15 border border-brand/30 flex items-center gap-1.5 shadow-xs"
                title={`Chuỗi Streak hiện tại: ${detail.current_streak} ngày. Kỷ lục: ${detail.longest_streak} ngày`}
              >
                <Flame className="w-4 h-4 text-brand animate-pulse" />
                <span className="font-mono text-xs font-extrabold text-brand">
                  {detail.current_streak} ngày
                </span>
              </div>

              {/* XP Badge */}
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 shadow-xs">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-extrabold text-amber-400">
                  {detail.xp.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Admin Action Button */}
            {isAdminView && onResetStreakClick && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onResetStreakClick}
                className="text-xs gap-1.5 text-brand border-brand/30 hover:bg-brand/10 rounded-xl"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Quản lý & Reset Streak</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Thống kê Chỉ số Học tập (Learning Stats Grid) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-1 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          Chỉ số học tập FSRS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Tổng từ vựng */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-border/70 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">Tổng từ vựng</span>
              <BookOpen className="w-4 h-4 text-brand" />
            </div>
            <p className="text-2xl font-black text-text-primary font-mono">
              {stats.total_cards}
            </p>
            <span className="text-[10px] text-text-secondary block">
              {stats.new_cards} từ mới chưa học
            </span>
          </div>

          {/* Đã thành thạo */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-border/70 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">Đã thuộc vững</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {stats.mastered_cards}
            </p>
            <span className="text-[10px] text-text-secondary block">
              Độ bền trí nhớ cao (≥20 ngày)
            </span>
          </div>

          {/* Đang học */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-border/70 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">Đang học FSRS</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-sky-400 font-mono">
              {stats.learning_cards}
            </p>
            <span className="text-[10px] text-text-secondary block">
              Trong chu kỳ ôn cách quãng
            </span>
          </div>

          {/* Kỷ lục Streak */}
          <div className="p-4 rounded-2xl bg-surface/80 border border-border/70 space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">Kỷ lục chuỗi</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 font-mono">
              {detail.longest_streak} <span className="text-xs font-normal">ngày</span>
            </p>
            <span className="text-[10px] text-text-secondary block">
              {stats.total_reviews} lượt ôn tập đã ghi
            </span>
          </div>
        </div>
      </div>

      {/* 3. Danh sách Bộ từ vựng Công khai (Public Collections) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Folder className="w-3.5 h-3.5 text-brand" />
            Bộ sưu tập công khai ({public_collections.length})
          </h3>
          <span className="text-[11px] text-text-secondary">
            Chia sẻ cho cộng đồng
          </span>
        </div>

        {public_collections.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface/40 border border-border/50 text-center space-y-2">
            <Folder className="w-8 h-8 mx-auto text-text-secondary/50" />
            <p className="text-xs font-semibold text-text-primary">
              Chưa có bộ sưu tập công khai nào
            </p>
            <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
              Người dùng này chưa xuất bản bộ từ vựng nào ra chế độ công khai cho cộng đồng học cùng.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {public_collections.map((col) => (
              <div
                key={col.id}
                className="p-4 rounded-2xl bg-surface/80 border border-border/70 hover:border-brand/40 hover:bg-surface transition-all space-y-3 group shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-1">
                      {col.title}
                    </h4>
                    {col.category && (
                      <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-base border border-border/60 text-text-secondary shrink-0">
                        {col.category}
                      </span>
                    )}
                  </div>

                  {col.description && (
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>
                  )}

                  {/* Tags */}
                  {col.tags && col.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {col.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-base border border-border/60 text-text-secondary"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-text-secondary">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Heart className="w-3 h-3 text-rose-400" />
                      {col.likes_count}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <GitFork className="w-3 h-3 text-brand" />
                      {col.fork_count}
                    </span>
                    <span className="text-[10px]">
                      {formatRelativeTime(col.created_at)}
                    </span>
                  </div>

                  <Link href={ROUTES.APP.COLLECTION_DETAIL(col.id)}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs font-semibold text-brand hover:text-brand-hover hover:bg-brand/10 rounded-lg"
                    >
                      Xem bộ từ →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
