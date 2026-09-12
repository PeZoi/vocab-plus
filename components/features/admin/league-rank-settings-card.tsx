'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  RotateCcw,
  Save,
  Trophy,
  ArrowUpCircle,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import type { LeagueTier } from '@/constants/leagues';
import { LEAGUE_TIERS_CONFIG, LEAGUE_TIER_ORDER } from '@/constants/leagues';
import { RankLottieIcon } from '@/components/features/leaderboard/rank-lottie-icon';
import type { TierConfigItem } from '@/services/leaderboard.service';

interface LeagueRankSettingsCardProps {
  initialConfigs?: Record<LeagueTier, TierConfigItem>;
  onSave: (configs: Record<LeagueTier, TierConfigItem>) => Promise<void>;
  isSaving: boolean;
  onResetRank?: () => Promise<void>;
}

const DEFAULT_TIER_CONFIGS: Record<LeagueTier, TierConfigItem> = {
  unranked: { promoteXp: 50, stayXp: 0 },
  iron: { promoteXp: 120, stayXp: 30 },
  bronze: { promoteXp: 180, stayXp: 50 },
  silver: { promoteXp: 250, stayXp: 80 },
  platinum: { promoteXp: 350, stayXp: 120 },
  emerald: { promoteXp: 480, stayXp: 180 },
  diamond: { promoteXp: 650, stayXp: 260 },
  master: { promoteXp: 850, stayXp: 380 },
  grandmaster: { promoteXp: 1100, stayXp: 550 },
  challenger: { promoteXp: 0, stayXp: 750 },
};

export function LeagueRankSettingsCard({
  initialConfigs,
  onSave,
  isSaving,
  onResetRank,
}: LeagueRankSettingsCardProps) {
  const [configs, setConfigs] = useState<Record<LeagueTier, TierConfigItem>>(
    initialConfigs || DEFAULT_TIER_CONFIGS
  );
  const [prevInitialConfigs, setPrevInitialConfigs] = useState(initialConfigs);
  const [isDirty, setIsDirty] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (initialConfigs !== prevInitialConfigs) {
    setPrevInitialConfigs(initialConfigs);
    if (initialConfigs) {
      setConfigs(initialConfigs);
      setIsDirty(false);
    }
  }

  const handleChange = (tier: LeagueTier, field: 'promoteXp' | 'stayXp', val: number) => {
    const num = Math.max(0, val);
    setConfigs((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: num,
      },
    }));
    setIsDirty(true);
  };

  const handleReset = () => {
    setConfigs(DEFAULT_TIER_CONFIGS);
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    await onSave(configs);
    setIsDirty(false);
  };

  const handleConfirmResetRank = async () => {
    if (!onResetRank) return;
    try {
      setIsResetting(true);
      await onResetRank();
      setIsResetModalOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-border space-y-6 shadow-xs">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Cấu Hình 10 Bậc Rank Giải Đấu
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Tùy chỉnh số XP cần kiếm được trong tuần để Thăng hạng và Trụ hạng riêng biệt cho từng bậc rank.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          {onResetRank && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              disabled={isSaving || isResetting}
              className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Rank</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isSaving || isResetting}
            className="text-xs text-text-secondary hover:text-text-primary gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSaving || !isDirty || isResetting}
            className="gap-2 text-xs font-semibold bg-brand hover:bg-brand-hover text-white shadow-xs shadow-brand/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Bậc Rank'}</span>
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3 rounded-xl bg-base/60 border border-border/80 text-xs text-text-secondary flex items-start gap-2.5">
        <Trophy className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Quy tắc xét duyệt tuần:</strong> Vào thời điểm chốt sổ tuần (23:59 Chủ Nhật), học viên chỉ cần kiếm đủ số <strong>XP trong tuần đó</strong> đạt hoặc vượt ngưỡng Thăng hạng sẽ được thăng hạng; nếu không đạt ngưỡng Trụ hạng sẽ bị giáng hạng. Hệ thống hoàn toàn không dùng Tổng XP tích lũy toàn thời gian.
        </p>
      </div>

      {/* 10 Tiers Configuration Grid/List */}
      <div className="space-y-3">
        {LEAGUE_TIER_ORDER.map((tierKey, index) => {
          const meta = LEAGUE_TIERS_CONFIG[tierKey];
          const item = configs[tierKey] || DEFAULT_TIER_CONFIGS[tierKey];

          const isChallenger = tierKey === 'challenger';
          const isProtectedFromDemotion = tierKey === 'unranked' || tierKey === 'iron';

          return (
            <div
              key={tierKey}
              className="p-3.5 sm:p-4 rounded-xl bg-base/40 border border-border/70 hover:border-border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Tier identity */}
              <div className="flex items-center gap-3 min-w-[220px]">
                <RankLottieIcon tier={tierKey} size="sm" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">{meta.nameVi}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary">
                      {meta.nameEn}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-secondary mt-0.5 block">
                    Bậc {index} / 9
                  </span>
                </div>
              </div>

              {/* Right: Promotion & Demotion Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-lg">
                {/* Promotion Threshold */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                    <ArrowUpCircle className="w-3 h-3 text-emerald-400" />
                    <span>XP Tuần Thăng Hạng:</span>
                  </label>
                  {isChallenger ? (
                    <div className="h-9 px-3 rounded-lg bg-surface/50 border border-border/60 text-xs font-semibold text-amber-300 flex items-center">
                      👑 Tối thượng (Top 1-3)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={5000}
                        step={10}
                        value={item.promoteXp}
                        onChange={(e) =>
                          handleChange(tierKey, 'promoteXp', Number(e.target.value))
                        }
                        className="h-9 text-xs font-bold bg-surface border-border"
                      />
                      <span className="text-xs text-text-secondary font-medium">XP</span>
                    </div>
                  )}
                </div>

                {/* Demotion / Stay Threshold */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span>XP Tuần Trụ Hạng:</span>
                  </label>
                  {isProtectedFromDemotion ? (
                    <div className="h-9 px-3 rounded-lg bg-surface/50 border border-border/60 text-xs font-semibold text-blue-300 flex items-center">
                      🛡️ Được bảo vệ (Không rớt)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={3000}
                        step={10}
                        value={item.stayXp}
                        onChange={(e) =>
                          handleChange(tierKey, 'stayXp', Number(e.target.value))
                        }
                        className="h-9 text-xs font-bold bg-surface border-border"
                      />
                      <span className="text-xs text-text-secondary font-medium">XP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal: Reset Toàn Bộ Rank */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => !isResetting && setIsResetModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Xác Nhận Reset Toàn Bộ Rank</span>
          </div>
        }
        description="Đưa toàn bộ người dùng về bậc khởi đầu để bắt đầu mùa giải mới."
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300">
                Toàn bộ học viên sẽ quay về Chưa có rank (Unranked)!
              </p>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                Bậc rank của tất cả tài khoản sẽ được đưa về <strong>Chưa có rank</strong> và điểm thi đua tuần này sẽ được làm mới về <strong>0 XP</strong> để bắt đầu mùa thi đua mới.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-300">
                Tuyệt đối bảo toàn 100% Tổng XP tích lũy
              </p>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                Hành động này <strong>KHÔNG làm mất Tổng XP</strong> (điểm kinh nghiệm trọn đời) của học viên. Cấp độ tài khoản, danh hiệu và thành tựu đã đạt được vẫn được giữ nguyên vẹn 100%.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
              disabled={isResetting}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmResetRank}
              disabled={isResetting}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-semibold shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Đang reset rank...' : 'Xác nhận Reset Rank'}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
