'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Medal,
  Calendar,
  Users,
  Award,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useSeasonsQuery, useSeasonDetailQuery } from '@/hooks/features/leaderboard/use-seasons';
import { LeaderboardPodium } from '@/components/features/leaderboard/leaderboard-podium';
import { LeagueBadge } from '@/components/features/leaderboard/league-badge';
import { UserAvatar } from '@/components/common/user-avatar';
import { formatXP } from '@/utils/formatters';
import type { LeaderboardUser } from '@/services/leaderboard.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function SeasonHistoryTab() {
  const { data: seasons = [], isLoading: isLoadingSeasons } = useSeasonsQuery();
  const [userSelectedSeasonId, setUserSelectedSeasonId] = useState<string | null>(null);

  // Tính toán mùa giải đang xem theo dạng state dẫn xuất (không cần useEffect setState)
  const activeSeasonId = userSelectedSeasonId || (seasons.length > 0 ? seasons[0].id : null);

  const { data: seasonDetail, isLoading: isLoadingDetail } = useSeasonDetailQuery(activeSeasonId);

  if (isLoadingSeasons) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
        <p className="text-text-secondary text-sm font-medium">Đang tải lịch sử các mùa giải...</p>
      </div>
    );
  }

  // Trường hợp chưa có mùa giải nào được lưu
  if (!seasons || seasons.length === 0) {
    return (
      <div className="rounded-3xl bg-surface/40 border border-border/60 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto text-brand">
          <Trophy className="w-8 h-8 opacity-80" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-text-primary">Chưa Có Mùa Giải Nào Được Lưu Trữ</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Hệ thống sẽ tự động lưu lại toàn bộ bảng vàng xếp hạng, điểm số và bậc rank của tất cả học viên sau mỗi lần chốt sổ giải đấu tuần. Hãy tích cực học tập để ghi danh vào bảng vàng mùa giải đầu tiên nhé!
          </p>
        </div>
      </div>
    );
  }

  const currentSeason = seasonDetail?.season || seasons.find((s) => s.id === activeSeasonId) || seasons[0];
  const participants = seasonDetail?.leaderboard || [];
  const currentUser = seasonDetail?.currentUser || null;

  // Chuyển đổi danh sách top 3 sang format tương thích với LeaderboardPodium
  const topUsersForPodium: LeaderboardUser[] = participants.slice(0, 3).map((u) => ({
    id: u.user_id,
    display_name: u.display_name,
    avatar_url: u.avatar_url,
    xp: u.weekly_xp,
    rank: u.rank_position,
    league: u.league_tier,
    is_qualified: true,
  }));

  const renderRankMedal = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-text-secondary w-5 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Thanh lựa chọn Mùa giải & Thông tin tổng quan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/60 border border-border/80 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <label htmlFor="season-select" className="text-xs text-text-secondary font-medium block">
              Chọn mùa giải để xem vinh danh:
            </label>
            <div className="relative inline-block mt-0.5">
              <select
                id="season-select"
                value={activeSeasonId || ''}
                onChange={(e) => setUserSelectedSeasonId(e.target.value)}
                className="appearance-none bg-base/80 border border-border hover:border-border-hover focus:border-brand text-text-primary text-sm font-bold py-1.5 pl-3 pr-8 rounded-xl outline-hidden cursor-pointer transition-colors"
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id} className="bg-surface text-text-primary">
                    Mùa #{s.season_number}: {s.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Thông tin metadata mùa giải */}
        {currentSeason && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-text-secondary font-medium">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-base/60 border border-border/50">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>
                Chốt sổ: {format(new Date(currentSeason.reset_at), 'HH:mm - dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-base/60 border border-border/50">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentSeason.total_participants} học viên tham gia</span>
            </div>
          </div>
        )}
      </div>

      {/* Banner Thành tích của Tôi trong Mùa này */}
      {currentUser ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand/20 via-surface to-brand/10 border border-brand/40 p-4 sm:p-5 shadow-lg shadow-brand/5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center text-brand shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider block">
                  Thành tích mùa #{currentSeason?.season_number} của bạn
                </span>
                <h4 className="text-base sm:text-lg font-black text-text-primary mt-0.5">
                  Bạn đã xuất sắc cán đích ở{' '}
                  <span className="text-amber-400">Hạng #{currentUser.rank_position}</span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <LeagueBadge tier={currentUser.league_tier} size="md" />
              <div className="px-3.5 py-1.5 rounded-xl bg-base/80 border border-border text-center">
                <span className="text-xs text-text-secondary block">Điểm chung cuộc</span>
                <span className="text-sm font-black text-amber-400">{formatXP(currentUser.weekly_xp)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-xl bg-surface/30 border border-border/50 px-4 py-3 text-xs text-text-secondary flex items-center gap-2">
          <Info className="w-4 h-4 text-text-secondary/70 shrink-0" />
          <span>Bạn chưa có bản ghi tích lũy điểm ở mùa giải #{currentSeason?.season_number}.</span>
        </div>
      )}

      {/* Bục Vinh Quang Top 3 */}
      {topUsersForPodium.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Bảng Vàng Danh Dự</span>
            </h4>
            <span className="text-xs text-text-secondary">Top 3 Quán Quân & Á Quân</span>
          </div>
          <LeaderboardPodium topUsers={topUsersForPodium} currentUserId={currentUser?.user_id} />
        </div>
      )}

      {/* Danh sách Bảng Xếp Hạng Đầy Đủ */}
      <div className="rounded-3xl bg-surface/40 border border-border/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border/70 flex items-center justify-between">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand" />
            <span>Bảng Xếp Hạng Tổng Kết Mùa Giải</span>
          </h4>
          <span className="text-xs text-text-secondary">
            {participants.length} học viên được ghi nhận
          </span>
        </div>

        {isLoadingDetail ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
          </div>
        ) : participants.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">
            Không có dữ liệu học viên trong mùa giải này.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {participants.map((user) => {
              const isMe = user.is_current_user;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors ${
                    isMe
                      ? 'bg-brand/10 hover:bg-brand/15 border-l-4 border-l-brand'
                      : 'hover:bg-surface-hover/50'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Rank Indicator */}
                    <div className="w-7 flex justify-center shrink-0">
                      {renderRankMedal(user.rank_position)}
                    </div>

                    {/* Avatar */}
                    <UserAvatar
                      src={user.avatar_url}
                      name={user.display_name}
                      className="w-10 h-10 border border-border shrink-0"
                    />

                    {/* Name & Tier */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold truncate block ${
                            isMe ? 'text-brand font-black' : 'text-text-primary'
                          }`}
                        >
                          {user.display_name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-brand text-white">
                            Tôi
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5">
                        <LeagueBadge tier={user.league_tier} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Final XP */}
                  <div className="text-right shrink-0 pl-3">
                    <span className="text-sm sm:text-base font-black text-amber-400">
                      {formatXP(user.weekly_xp)}
                    </span>
                    <span className="text-[10px] text-text-secondary/70 block uppercase font-bold tracking-wider">
                      XP đạt được
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
