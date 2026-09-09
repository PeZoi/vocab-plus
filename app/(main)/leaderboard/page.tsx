'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Zap } from 'lucide-react';
import { pageVariants } from '@/constants/animations';
import { useLeaderboardQuery } from '@/hooks/features/leaderboard/use-leaderboard';
import { formatXP } from '@/utils/formatters';
import { UserAvatar } from '@/components/common/user-avatar';

type Timeframe = 'daily' | 'weekly' | 'all_time';

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const { data, isLoading } = useLeaderboardQuery(timeframe);

  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold text-text-secondary w-5 text-center">{rank}</span>;
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto space-y-6 pb-24"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-2 mt-4">
        <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand mb-2 shadow-sm shadow-brand/20">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Bảng Xếp Hạng</h1>
        <p className="text-sm text-text-secondary max-w-sm">
          Thi đua học tập cùng cộng đồng. Những nỗ lực của bạn sẽ được vinh danh tại đây!
        </p>
      </div>

      <div className="flex items-center justify-center bg-surface/50 p-1.5 rounded-2xl border border-border/80 w-fit mx-auto">
        {(['daily', 'weekly', 'all_time'] as Timeframe[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
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

      {/* Weekly League Info Card */}
      {timeframe === 'weekly' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand/10 to-purple-500/10 border border-amber-500/20 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-text-primary">
                  Quy tắc Giải đấu Tuần (Thứ Hai – Chủ Nhật)
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Đạt tối thiểu <strong className="text-amber-400">{data?.minThreshold || 200} XP</strong> trong tuần để đủ điều kiện xét duyệt thăng hạng (Top 20%).
                </p>
              </div>
            </div>

            {data?.userWeeklyXp !== undefined && (
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                  data.userWeeklyXp >= (data.minThreshold || 200)
                    ? 'bg-success/15 border-success/30 text-success'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}
              >
                {data.userWeeklyXp >= (data.minThreshold || 200)
                  ? '✓ Đủ điều kiện thăng hạng'
                  : `Cần thêm ${(data.minThreshold || 200) - data.userWeeklyXp} XP`}
              </span>
            )}
          </div>

          {/* User Progress Bar */}
          {data?.userWeeklyXp !== undefined && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-secondary">Tiến độ tuần của bạn:</span>
                <span className="font-bold text-text-primary">
                  <strong className="text-brand">{data.userWeeklyXp}</strong> / {data.minThreshold || 200} XP
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-base/80 overflow-hidden border border-border/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-amber-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((data.userWeeklyXp / (data.minThreshold || 200)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-surface border border-border/80 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          </div>
        ) : data?.leaderboard && data.leaderboard.length > 0 ? (
          <div className="flex flex-col">
            {data.leaderboard.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-base/30 transition-colors ${
                  data.currentUser?.id === user.id ? 'bg-brand/5 border-l-4 border-l-brand' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-6">
                    {renderRankBadge(user.rank)}
                  </div>
                  <UserAvatar
                    src={user.avatar_url}
                    name={user.display_name}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${data.currentUser?.id === user.id ? 'text-brand' : 'text-text-primary'}`}>
                        {user.display_name || 'Học viên ẩn danh'}
                      </p>
                      {timeframe === 'weekly' && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            user.is_qualified
                              ? 'bg-success/15 border-success/30 text-success'
                              : 'bg-surface border-border text-text-secondary'
                          }`}
                        >
                          {user.is_qualified ? 'Đủ điều kiện' : 'Đang phấn đấu'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-brand bg-brand/10 px-3 py-1 rounded-lg">
                  <Zap className="w-3.5 h-3.5 fill-brand" />
                  {formatXP(user.xp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-text-secondary text-sm">
            Chưa có dữ liệu bảng xếp hạng. Hãy là người đầu tiên ghi điểm!
          </div>
        )}
      </div>
    </motion.div>
  );
}
