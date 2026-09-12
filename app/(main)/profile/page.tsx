'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Zap,
  Flame,
  Trophy,
  Layers,
  Settings,
  LogOut,
  ArrowUpCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { pageVariants } from '@/constants/animations';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import { useReviewStats } from '@/hooks/features/review/use-review-stats';
import { useLeaderboardQuery } from '@/hooks/features/leaderboard/use-leaderboard';
import { useRankCountdown } from '@/hooks/features/leaderboard/use-rank-countdown';
import { useGoogleAuth } from '@/hooks/features/auth/use-google-auth';
import { UserAvatar } from '@/components/common/user-avatar';
import { LeagueBadge } from '@/components/features/leaderboard/league-badge';
import { RankLottieIcon } from '@/components/features/leaderboard/rank-lottie-icon';
import { Button } from '@/components/ui/button';
import { formatXP } from '@/utils/formatters';
import { LEAGUE_TIERS_CONFIG, type LeagueTier } from '@/constants/leagues';
import { ROUTES } from '@/constants/routes';

export default function ProfilePage() {
  const { profile, isAdmin } = useUserProfile();
  const { data: reviewData } = useReviewStats();
  const { data: leaderboardData } = useLeaderboardQuery('weekly');
  const { signOut, isLoading: isSigningOut } = useGoogleAuth();
  const countdown = useRankCountdown();

  const userTier: LeagueTier = profile?.league || 'unranked';
  const tierMeta = LEAGUE_TIERS_CONFIG[userTier] || LEAGUE_TIERS_CONFIG.unranked;

  const totalXp = profile?.xp || reviewData?.stats.total_xp || 0;
  const streakDays = reviewData?.stats.streak_days || 0;
  const dueCount = reviewData?.stats.due_count || 0;
  const weeklyXp = leaderboardData?.userWeeklyXp || 0;

  const promoteXp = leaderboardData?.promoteThreshold ?? tierMeta.defaultPromoteXp;
  const stayXp = leaderboardData?.stayThreshold ?? tierMeta.defaultStayXp;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto space-y-6 pb-24"
    >
      {/* 1. Header Profile Card */}
      <div className="relative p-6 sm:p-7 rounded-3xl bg-surface/90 border border-border/80 shadow-md overflow-hidden">
        {/* Ambient background glow theo màu tier */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: tierMeta.glowColor }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative">
            <UserAvatar
              src={profile?.avatar_url}
              name={profile?.display_name || 'Học viên'}
              size="xl"
              className="ring-2 ring-brand/40 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1">
              <RankLottieIcon tier={userTier} size="sm" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight truncate">
                {profile?.display_name || 'Học viên'}
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand/15 text-brand border border-brand/30">
                  Quản trị viên
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
              <LeagueBadge tier={userTier} size="sm" />
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand" />
                <span>{formatXP(totalXp)} Tổng XP</span>
              </span>
            </div>

            <p className="text-xs text-text-secondary/80 max-w-sm pt-1">
              {tierMeta.description}
            </p>
          </div>

          {/* Quick Settings Shortcut */}
          <Link
            href={ROUTES.APP.SETTINGS}
            className="p-2.5 rounded-xl bg-base border border-border text-text-secondary hover:text-text-primary hover:border-brand/40 transition-colors shadow-2xs self-center sm:self-start"
            title="Cài đặt tài khoản"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. League Rank & Tournament Status */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface border border-border/80 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Bậc Rank & Giải Đấu Tuần
            </h2>
          </div>
          <Link
            href={ROUTES.APP.LEADERBOARD}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            <span>Bảng Xếp Hạng</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
          <div className="shrink-0 p-3 rounded-2xl bg-base/60 border border-border/60 flex items-center justify-center">
            <RankLottieIcon tier={userTier} size="lg" />
          </div>

          <div className="space-y-3 flex-1 w-full">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-text-secondary">Bậc hiện tại:</span>
                <p className="text-base font-bold text-text-primary">
                  {tierMeta.nameVi}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-text-secondary">XP tuần này:</span>
                <p className="text-base font-bold text-brand">
                  {formatXP(weeklyXp)} XP
                </p>
              </div>
            </div>

            {/* Dual Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-base overflow-hidden border border-border/60 flex">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((weeklyXp / Math.max(promoteXp, stayXp, 100)) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-secondary">
                <span>Trụ hạng: {stayXp} XP</span>
                {promoteXp > 0 && <span>Thăng hạng: {promoteXp} XP</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Threshold Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-base/50 border border-border/60 flex items-center gap-2.5">
            <ArrowUpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-text-secondary block">Mốc Thăng hạng:</span>
              <span className="font-bold text-emerald-400">
                {userTier === 'challenger'
                  ? 'Tối thượng (Không thăng hạng)'
                  : `Cần tối thiểu ${promoteXp} XP tuần`}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-base/50 border border-border/60 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-text-secondary block">Mốc Trụ hạng:</span>
              <span className="font-bold text-blue-400">
                {userTier === 'unranked' || userTier === 'iron'
                  ? 'Được bảo vệ (Không rớt hạng)'
                  : `Cần tối thiểu ${stayXp} XP tuần`}
              </span>
            </div>
          </div>
        </div>

        {/* Countdown reset rank */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium">Thời gian giải đấu:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-text-secondary">Còn</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-base border border-amber-500/30 font-mono font-bold text-amber-400 text-xs shadow-2xs">
              {countdown.formatted}
            </span>
            <span className="text-[11px] text-text-secondary">nữa sẽ reset rank</span>
          </div>
        </div>
      </div>

      {/* 3. Learning Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-brand">
            <Zap className="w-4 h-4 fill-brand" />
            <span className="text-xs text-text-secondary">Tổng XP</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-text-primary">
            {formatXP(totalXp)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span className="text-xs text-text-secondary">Chuỗi Streak</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-text-primary">
            {streakDays} ngày
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border/80 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-emerald-400">
            <Layers className="w-4 h-4" />
            <span className="text-xs text-text-secondary">Từ cần ôn</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-text-primary">
            {dueCount} thẻ
          </p>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link
          href={ROUTES.APP.REVIEW}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-semibold shadow-md shadow-brand/20 h-11 px-5 transition-colors"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Vào Ôn Tập Ngay</span>
        </Link>

        <Link
          href={ROUTES.APP.SETTINGS}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-surface hover:bg-base border border-border text-text-primary rounded-xl text-sm font-semibold h-11 px-5 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Cài Đặt</span>
        </Link>

        <Button
          type="button"
          variant="outline"
          onClick={() => signOut()}
          disabled={isSigningOut}
          className="w-full sm:w-auto border-border hover:border-danger/40 hover:text-danger rounded-xl text-xs h-11 px-4 text-text-secondary"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </motion.div>
  );
}
