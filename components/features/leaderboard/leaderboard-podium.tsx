'use client';

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Crown, Sparkles, Zap } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar';
import { formatXP } from '@/utils/formatters';
import type { LeaderboardUser } from '@/services/leaderboard.service';
import type { LeagueTier } from '@/constants/leagues';

interface LeaderboardPodiumProps {
  topUsers: LeaderboardUser[];
  currentUserId?: string;
  activeTier?: LeagueTier;
}

export function LeaderboardPodium({
  topUsers,
  currentUserId,
}: LeaderboardPodiumProps) {
  if (!topUsers || topUsers.length === 0) return null;

  // Kiểm tra xem có bất kỳ học viên nào đã ghi điểm (> 0 XP) tuần này hay chưa
  const hasAnyScore = topUsers.some((u) => (u.xp || 0) > 0);

  // TRƯỜNG HỢP 1: CHƯA CÓ AI CÓ ĐIỂM (Tất cả đều 0 XP)
  // Không trao vương miện ảo cho người 0 XP, thay vào đó hiển thị Ngai vàng chờ đón Quán quân
  if (!hasAnyScore) {
    return (
      <div className="relative pt-8 pb-8 px-4 sm:px-6 overflow-hidden rounded-3xl bg-gradient-to-b from-surface/90 via-surface/60 to-base/80 border border-border/70 shadow-xl text-center">
        {/* Background ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md mx-auto space-y-4">
          {/* Floating Empty Crown Trophy */}
          <div className="relative">
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 backdrop-blur-xs">
                <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 filter drop-shadow-[0_0_14px_rgba(251,191,36,0.6)]" />
              </div>
            </motion.div>
            {/* Glowing ring animation */}
            <div
              className="absolute inset-0 rounded-3xl bg-amber-500/15 animate-ping pointer-events-none"
              style={{ animationDuration: '3.5s' }}
            />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/15 border border-slate-500/30 text-slate-300 text-xs font-semibold">
              <span>🔘</span>
              <span>Tuần thi đấu mới chưa có điểm</span>
            </span>
            <h3 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 tracking-tight">
              Ngai Vàng Đang Chờ Đón Quán Quân!
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
              Chưa có học viên nào ghi danh tuần này. Hãy là người đầu tiên bứt phá để vinh danh trên bục Quán quân số 1!
            </p>
          </div>

          <Link
            href="/review"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-brand/25 hover:scale-105 transition-all mt-1"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Ôn tập để lên Rank ngay</span>
          </Link>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: ĐÃ CÓ NGƯỜI CÓ ĐIỂM
  // Chỉ những học viên có > 0 XP mới được vinh danh lên bục
  const first = topUsers[0] && (topUsers[0].xp || 0) > 0 ? topUsers[0] : null;
  const second = topUsers.length > 1 && (topUsers[1].xp || 0) > 0 ? topUsers[1] : null;
  const third = topUsers.length > 2 && (topUsers[2].xp || 0) > 0 ? topUsers[2] : null;

  return (
    <div className="relative pt-14 sm:pt-16 pb-3 px-2 sm:px-4 overflow-hidden rounded-3xl bg-gradient-to-b from-surface/90 via-surface/60 to-base/80 border border-border/70 shadow-xl">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />

      {/* 3 Pillars Container */}
      <div className="flex items-end justify-center gap-2 sm:gap-5 max-w-lg mx-auto">
        {/* 2nd Place (Silver - Left) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.15 }}
          className="flex-1 flex flex-col items-center"
        >
          {second ? (
            <div className="relative mb-2 flex flex-col items-center">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-slate-400 via-zinc-200 to-slate-400 shadow-md shadow-slate-400/20">
                <UserAvatar src={second.avatar_url} name={second.display_name} size="md" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-black flex items-center justify-center border border-white shadow-xs">
                  2
                </span>
              </div>
              <p
                className={`text-xs font-bold mt-1.5 truncate max-w-[90px] sm:max-w-[110px] text-center ${
                  currentUserId === second.id ? 'text-brand' : 'text-text-primary'
                }`}
              >
                {second.display_name || 'Học viên'}
              </p>
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-0.5 mt-0.5">
                <Zap className="w-3 h-3 text-slate-400 fill-slate-400" />
                {formatXP(second.xp)}
              </span>
            </div>
          ) : (
            <div className="relative mb-2 flex flex-col items-center opacity-60">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-500/40 flex items-center justify-center text-slate-400 font-extrabold text-sm">
                ?
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5 italic">Đang chờ...</p>
              <span className="text-[10px] text-text-secondary/70">-- XP</span>
            </div>
          )}

          {/* Silver Pillar */}
          <div className="w-full h-28 sm:h-32 rounded-t-2xl bg-gradient-to-b from-slate-300/25 via-slate-400/15 to-slate-600/10 border-t-2 border-x border-slate-300/40 relative flex flex-col items-center justify-start pt-3 shadow-lg backdrop-blur-xs">
            <div className="w-8 h-8 rounded-full bg-slate-300/20 border border-slate-300/40 flex items-center justify-center text-slate-200 font-extrabold text-sm shadow-inner">
              🥈
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-2">
              HẠNG 2
            </span>
          </div>
        </motion.div>

        {/* 1st Place (Gold - Center - Highest) */}
        {first && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className="flex-1 flex flex-col items-center z-10"
          >
            <div className="relative mb-2.5 flex flex-col items-center">
              {/* Floating animated Crown */}
              <motion.div
                animate={{ y: [0, -5, 0], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-7 text-amber-400 drop-shadow-md z-20 flex items-center justify-center pointer-events-none"
              >
                <Crown className="w-8 h-8 fill-amber-400 text-yellow-300 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]" />
              </motion.div>

              {/* Avatar with Golden Aura */}
              <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 shadow-lg shadow-amber-500/40 animate-pulse">
                <UserAvatar src={first.avatar_url} name={first.display_name} size="lg" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 text-xs font-black flex items-center justify-center border-2 border-white shadow-md">
                  1
                </span>
              </div>

              <div className="flex items-center gap-1 mt-2">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <p
                  className={`text-sm font-extrabold truncate max-w-[100px] sm:max-w-[130px] text-center ${
                    currentUserId === first.id ? 'text-brand' : 'text-text-primary'
                  }`}
                >
                  {first.display_name || 'Học viên'}
                </p>
              </div>

              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1 mt-0.5 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {formatXP(first.xp)}
              </span>
            </div>

            {/* Gold Pillar */}
            <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-gradient-to-b from-amber-400/35 via-yellow-500/20 to-amber-700/10 border-t-2 border-x border-amber-400/60 relative flex flex-col items-center justify-start pt-3 shadow-xl backdrop-blur-xs">
              <div className="w-10 h-10 rounded-full bg-amber-400/25 border border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-lg shadow-lg">
                🥇
              </div>
              <span className="text-[11px] uppercase font-black tracking-widest text-amber-300 mt-2 drop-shadow-xs">
                QUÁN QUÂN
              </span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place (Bronze - Right) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.25 }}
          className="flex-1 flex flex-col items-center"
        >
          {third ? (
            <div className="relative mb-2 flex flex-col items-center">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-700 via-orange-400 to-amber-800 shadow-md shadow-amber-800/20">
                <UserAvatar src={third.avatar_url} name={third.display_name} size="md" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-amber-100 text-[11px] font-black flex items-center justify-center border border-white shadow-xs">
                  3
                </span>
              </div>
              <p
                className={`text-xs font-bold mt-1.5 truncate max-w-[90px] sm:max-w-[110px] text-center ${
                  currentUserId === third.id ? 'text-brand' : 'text-text-primary'
                }`}
              >
                {third.display_name || 'Học viên'}
              </p>
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-0.5 mt-0.5">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-600" />
                {formatXP(third.xp)}
              </span>
            </div>
          ) : (
            <div className="relative mb-2 flex flex-col items-center opacity-60">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-700/40 flex items-center justify-center text-amber-600 font-extrabold text-sm">
                ?
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5 italic">Đang chờ...</p>
              <span className="text-[10px] text-text-secondary/70">-- XP</span>
            </div>
          )}

          {/* Bronze Pillar */}
          <div className="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-b from-amber-700/25 via-orange-700/15 to-amber-900/10 border-t-2 border-x border-amber-700/40 relative flex flex-col items-center justify-start pt-2 shadow-lg backdrop-blur-xs">
            <div className="w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-amber-400 font-extrabold text-xs shadow-inner">
              🥉
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 mt-1.5">
              HẠNG 3
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
