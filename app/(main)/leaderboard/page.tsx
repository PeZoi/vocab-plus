'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Trophy,
  Medal,
  Zap,
  ArrowUpCircle,
  ShieldCheck,
  ArrowDownCircle,
  ChevronDown,
  Info,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { pageVariants } from '@/constants/animations';
import { useLeaderboardQuery } from '@/hooks/features/leaderboard/use-leaderboard';
import { useRankCountdown } from '@/hooks/features/leaderboard/use-rank-countdown';
import { formatXP } from '@/utils/formatters';
import { UserAvatar } from '@/components/common/user-avatar';
import { LeaderboardPodium } from '@/components/features/leaderboard/leaderboard-podium';
import { LeagueBadge } from '@/components/features/leaderboard/league-badge';
import { RankLottieIcon } from '@/components/features/leaderboard/rank-lottie-icon';
import { Button } from '@/components/ui/button';
import type { LeagueTier, ZoneType } from '@/constants/leagues';
import { LEAGUE_TIERS_CONFIG, LEAGUE_TIER_ORDER } from '@/constants/leagues';

type Timeframe = 'daily' | 'weekly' | 'all_time';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const [selectedTier, setSelectedTier] = useState<LeagueTier | undefined>(undefined);
  const [isTierDropdownOpen, setIsTierDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useLeaderboardQuery(timeframe, selectedTier);
  const countdown = useRankCountdown();

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTierDropdownOpen(false);
      }
    };
    if (isTierDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTierDropdownOpen]);

  const activeTier: LeagueTier = selectedTier || data?.currentTier || 'unranked';
  const tierMeta = LEAGUE_TIERS_CONFIG[activeTier] || LEAGUE_TIERS_CONFIG.unranked;

  const promoteXp = data?.promoteThreshold ?? tierMeta.defaultPromoteXp;
  const stayXp = data?.stayThreshold ?? tierMeta.defaultStayXp;
  const userXp = data?.userWeeklyXp ?? 0;

  const renderRankBadge = (rank: number, xp: number = 0) => {
    // Nếu chưa ghi được điểm nào (0 XP) thì chưa xếp hạng
    if (xp === 0) {
      return <span className="text-sm font-bold text-text-secondary/40 w-5 text-center">-</span>;
    }
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-text-secondary w-5 text-center">{rank}</span>;
  };

  const renderZoneBadge = (zone?: ZoneType, xp: number = 0) => {
    // Nếu ở bậc Chưa có rank (unranked): chỉ có Thăng hạng (đủ điểm) hoặc Chưa có rank
    if (activeTier === 'unranked') {
      if (xp >= promoteXp) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ArrowUpCircle className="w-3 h-3" />
            <span>Thăng hạng (Lên Sắt)</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-500/15 border border-slate-500/30 text-slate-400">
          <span>Chưa có rank</span>
        </span>
      );
    }

    // Với các bậc từ Sắt trở lên:
    if (xp === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <ArrowDownCircle className="w-3 h-3" />
          <span>Chưa có điểm</span>
        </span>
      );
    }

    if (zone === 'promotion') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <ArrowUpCircle className="w-3 h-3" />
          <span>Thăng hạng</span>
        </span>
      );
    }
    if (zone === 'demotion') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <ArrowDownCircle className="w-3 h-3" />
          <span>Nguy cơ rớt</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-400">
        <ShieldCheck className="w-3 h-3" />
        <span>Trụ hạng</span>
      </span>
    );
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto space-y-6 pb-24"
    >
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-2 mt-4">
        <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand mb-2 shadow-sm shadow-brand/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Bảng Xếp Hạng</h1>
        <p className="text-sm text-text-secondary max-w-sm">
          Thi đua học tập cùng cộng đồng. Những nỗ lực của bạn sẽ được vinh danh tại đây!
        </p>
      </div>

      {/* Timeframe Filter Tabs */}
      <div className="flex items-center justify-center bg-surface/50 p-1.5 rounded-2xl border border-border/80 w-fit mx-auto">
        {(['daily', 'weekly', 'all_time'] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => {
              setTimeframe(tf);
              if (tf !== 'weekly') setSelectedTier(undefined);
            }}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${
              timeframe === tf
                ? 'bg-brand text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-base/50'
            }`}
          >
            {tf === 'daily' && 'Hôm nay'}
            {tf === 'weekly' && 'Giải đấu Tuần'}
            {tf === 'all_time' && 'Mọi lúc'}
          </button>
        ))}
      </div>

      {/* Weekly League Tier Selection & Status Banner */}
      {timeframe === 'weekly' && (
        <div className="space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface/90 border border-border/80 space-y-4 shadow-sm relative z-20">
            {/* Ambient tier glow confined in an overflow-hidden child */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div
                className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: tierMeta.glowColor }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap relative z-10">
              <div className="flex items-center gap-3">
                <RankLottieIcon tier={activeTier} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-medium">Đang xem:</span>
                    <LeagueBadge tier={activeTier} size="sm" showLottie={false} />
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1 max-w-xs sm:max-w-sm">
                    {tierMeta.description}
                  </p>
                </div>
              </div>

              {/* Tier Switcher Dropdown */}
              <div ref={dropdownRef} className="relative shrink-0 ml-auto sm:ml-0 z-30">
                <button
                  type="button"
                  onClick={() => setIsTierDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-md ${
                    isTierDropdownOpen
                      ? 'bg-brand/15 border-brand text-brand'
                      : 'bg-base border-border text-text-primary hover:border-brand/40'
                  }`}
                >
                  <span>Đổi Bậc Rank</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${
                      isTierDropdownOpen ? 'rotate-180 text-brand' : ''
                    }`}
                  />
                </button>

                {isTierDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 p-2 rounded-2xl bg-surface/95 border border-border/90 shadow-2xl shadow-black/80 z-50 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-border/50 text-[10px] uppercase font-bold text-text-secondary">
                      <span>10 Bậc Rank</span>
                      <span className="text-brand font-semibold">Chọn để lọc</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-1 pt-1">
                      {LEAGUE_TIER_ORDER.map((tierKey) => {
                        const meta = LEAGUE_TIERS_CONFIG[tierKey];
                        const isSelected = activeTier === tierKey;
                        const isMyTier = data?.currentTier === tierKey;
                        return (
                          <button
                            key={tierKey}
                            type="button"
                            onClick={() => {
                              setSelectedTier(tierKey);
                              setIsTierDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-brand/15 text-brand border border-brand/40 shadow-xs'
                                : 'text-text-secondary hover:text-text-primary hover:bg-base/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <RankLottieIcon tier={tierKey} size="xs" />
                              <span>{meta.nameVi}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isMyTier && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand/20 border border-brand/40 text-brand font-bold">
                                  Bậc của bạn
                                </span>
                              )}
                              {isSelected && !isMyTier && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-base border border-border text-text-secondary">
                                  Đang xem
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Threshold Rules Bar */}
            <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-base/50 border border-border/60 flex items-center gap-2.5">
                <ArrowUpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-text-secondary block">Mốc Thăng hạng:</span>
                  <span className="font-bold text-emerald-400">
                    {activeTier === 'challenger'
                      ? 'Tối thượng (Không thăng hạng)'
                      : `Kiếm tối thiểu ${promoteXp} XP tuần này`}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-base/50 border border-border/60 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="text-[11px] text-text-secondary block">Mốc Trụ hạng:</span>
                  <span className="font-bold text-blue-400">
                    {activeTier === 'unranked' || activeTier === 'iron'
                      ? 'Được bảo vệ (Không rớt hạng)'
                      : `Kiếm tối thiểu ${stayXp} XP tuần này`}
                  </span>
                </div>
              </div>
            </div>

            {/* Dual Progress Bar for current user */}
            {data?.currentUser && activeTier === data?.currentTier && (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-text-secondary">XP kiếm được tuần này:</span>
                  <span className="font-bold text-text-primary">
                    <strong className="text-brand text-xs">{userXp}</strong> XP
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-base overflow-hidden border border-border/60 flex">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((userXp / Math.max(promoteXp, stayXp, 100)) * 100))}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-text-secondary">
                  <span>Trụ hạng: {stayXp} XP</span>
                  {promoteXp > 0 && <span>Thăng hạng: {promoteXp} XP</span>}
                </div>
              </div>
            )}

            {/* Countdown reset rank */}
            <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-xs flex-wrap gap-2">
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
        </div>
      )}

      {/* 3D Podium Component */}
      {!isLoading && data?.leaderboard && data.leaderboard.length > 0 && (
        <LeaderboardPodium
          topUsers={data.leaderboard.slice(0, 3)}
          currentUserId={data.currentUser?.id}
          activeTier={activeTier}
        />
      )}

      {/* Main Leaderboard List */}
      <div className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          </div>
        ) : data?.leaderboard && data.leaderboard.length > 0 ? (
          <div className="flex flex-col">
            {data.leaderboard.map((user) => {
              const isCurrentUser = data.currentUser?.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-base/30 transition-colors ${
                    isCurrentUser ? 'bg-brand/10 border-l-4 border-l-brand' : ''
                  } ${
                    user.zone === 'promotion'
                      ? 'bg-emerald-500/5'
                      : user.zone === 'demotion'
                      ? 'bg-rose-500/5'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="flex items-center justify-center w-6 shrink-0">
                      {renderRankBadge(user.rank, user.xp)}
                    </div>

                    <UserAvatar src={user.avatar_url} name={user.display_name} size="md" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`font-semibold text-sm truncate max-w-[120px] sm:max-w-[180px] ${
                            isCurrentUser ? 'text-brand' : 'text-text-primary'
                          }`}
                        >
                          {user.display_name || 'Học viên ẩn danh'}
                        </p>

                        {timeframe === 'weekly' && renderZoneBadge(user.zone, user.xp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1.5 font-bold text-brand bg-brand/10 px-3 py-1 rounded-lg">
                      <Zap className="w-3.5 h-3.5 fill-brand" />
                      <span>{formatXP(user.xp)}</span>
                    </div>
                    {timeframe === 'weekly' && (
                      <span className="text-[10px] text-text-secondary font-medium mt-0.5">
                        XP tuần này
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative p-8 sm:p-12 text-center overflow-hidden">
            {/* Ambient tier glow in empty state */}
            {timeframe === 'weekly' && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15"
                style={{ backgroundColor: tierMeta.glowColor }}
              />
            )}

            <div className="relative z-10 flex flex-col items-center max-w-md mx-auto space-y-4">
              {timeframe === 'weekly' ? (
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <RankLottieIcon tier={activeTier} size="xl" />
                  </motion.div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-base border border-border flex items-center justify-center text-text-secondary">
                  <Info className="w-8 h-8 opacity-60" />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs text-text-secondary font-medium">Bậc Xếp Hạng:</span>
                  <LeagueBadge tier={activeTier} size="sm" showLottie={false} />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  {timeframe === 'weekly'
                    ? `Chưa có chiến binh nào ở Bậc ${tierMeta.nameVi}`
                    : 'Chưa có dữ liệu xếp hạng'}
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary max-w-sm leading-relaxed">
                  {timeframe === 'weekly'
                    ? activeTier === 'challenger'
                      ? 'Bậc Thách Đấu tối thượng hiện vẫn đang bỏ trống. Hãy trở thành người đầu tiên chinh phục đỉnh cao này!'
                      : `Hiện tại chưa có học viên nào ở bậc này tuần này. Tích lũy tối thiểu ${promoteXp} XP để thăng hạng và vinh danh trên bục Quán quân!`
                    : 'Chưa ghi nhận hoạt động học tập nào trong khoảng thời gian này. Hãy ôn bài để bắt đầu đua top!'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
                <Link
                  href="/review"
                  className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-semibold shadow-md shadow-brand/20 h-9 px-4 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Ôn tập tích luỹ XP</span>
                </Link>

                {timeframe === 'weekly' && data?.currentTier && activeTier !== data?.currentTier && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedTier(data.currentTier)}
                    className="border-border rounded-xl text-xs font-semibold hover:border-brand/40 h-9 px-3.5 bg-base/50"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-text-secondary" />
                    <span>Về bậc của bạn ({LEAGUE_TIERS_CONFIG[data.currentTier]?.nameVi || 'Chưa có rank'})</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
