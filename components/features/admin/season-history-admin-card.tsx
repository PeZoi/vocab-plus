'use client';

import React from 'react';
import { Calendar, Users, Medal, Sparkles, History } from 'lucide-react';
import { useSeasonsQuery } from '@/hooks/features/leaderboard/use-seasons';
import { UserAvatar } from '@/components/common/user-avatar';
import { formatXP } from '@/utils/formatters';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export function SeasonHistoryAdminCard() {
  const { data: seasons = [], isLoading } = useSeasonsQuery();

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-border space-y-5 shadow-xs">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Nhật Ký Lưu Trữ Mùa Giải & Reset Rank
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Toàn bộ snapshot dữ liệu học viên, thứ hạng và điểm tuần qua từng mùa giải đã reset.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-base border border-border text-text-secondary self-start sm:self-auto">
          {seasons.length} mùa đã lưu trữ
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-8 flex justify-center items-center">
          <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
        </div>
      ) : seasons.length === 0 ? (
        <div className="py-8 text-center text-text-secondary text-xs rounded-xl bg-base/40 border border-border/50 p-4">
          Chưa có phiên reset rank nào được lưu trữ. Sau khi Quản trị viên nhấn Reset Rank hoặc đến chu kỳ chốt sổ, dữ liệu mùa giải sẽ tự động xuất hiện tại đây.
        </div>
      ) : (
        <div className="space-y-3">
          {seasons.map((season) => (
            <div
              key={season.id}
              className="p-4 rounded-xl bg-base/60 border border-border/70 hover:border-border transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    Mùa #{season.season_number}
                  </span>
                  <h4 className="text-sm font-bold text-text-primary">{season.title}</h4>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                    {format(new Date(season.reset_at), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    {season.total_participants} học viên
                  </span>
                </div>
              </div>

              {/* Top 3 Podium Preview */}
              {Array.isArray(season.top_podium) && season.top_podium.length > 0 ? (
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-2 sm:gap-4">
                  <span className="text-[11px] font-semibold text-text-secondary/80 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Top Vinh Danh:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {season.top_podium.map((podium) => (
                      <div
                        key={podium.userId || podium.rank}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface/80 border border-border text-xs"
                      >
                        {podium.rank === 1 && <Medal className="w-3.5 h-3.5 text-yellow-400" />}
                        {podium.rank === 2 && <Medal className="w-3.5 h-3.5 text-slate-300" />}
                        {podium.rank === 3 && <Medal className="w-3.5 h-3.5 text-amber-600" />}
                        <UserAvatar
                          src={podium.avatarUrl}
                          name={podium.displayName}
                          className="w-4 h-4 text-[9px]"
                        />
                        <span className="font-bold text-text-primary truncate max-w-[100px]">
                          {podium.displayName}
                        </span>
                        <span className="text-amber-400/90 font-bold">{formatXP(podium.xp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-text-secondary/60 italic">
                  Không có học viên nào đạt điểm trong mùa giải này.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
