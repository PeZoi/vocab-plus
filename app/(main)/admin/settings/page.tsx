'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pageVariants, alertVariants } from '@/constants/animations';
import { ROUTES } from '@/constants/routes';
import {
  useSystemSettingsQuery,
  useUpdateSystemSettingMutation,
} from '@/hooks/features/admin/use-system-settings';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import { calculateWordSimilarity } from '@/utils/text-similarity';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  GitFork,
  HelpCircle,
  Save,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
  Gamepad2,
  Target,
  Sprout,
  RotateCcw,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { QuestSettingsCard } from '@/components/features/admin/quest-settings-card';
import { XpSettingsCard } from '@/components/features/admin/xp-settings-card';
import { VocabLevelSettingsCard } from '@/components/features/admin/vocab-level-settings-card';
import type { QuestTemplate } from '@/types/quest.types';
import {
  type ReviewXpRates,
  type PracticeXpRates,
  type VocabLevelSettings,
  DEFAULT_REVIEW_XP_RATES,
  DEFAULT_PRACTICE_XP_RATES,
  DEFAULT_VOCAB_LEVEL_SETTINGS,
} from '@/types/system-settings.types';

type AdminSettingsTab = 'fork' | 'gamification' | 'quests' | 'levels';

export default function AdminSettingsPage() {
  const { isAdmin, isLoading: profileLoading } = useUserProfile();

  const { data: settings = [], isLoading: settingsLoading } = useSystemSettingsQuery(!!isAdmin);
  const updateMutation = useUpdateSystemSettingMutation();

  // Tab state (đồng bộ URL search param nếu có)
  const [activeTab, setActiveTab] = useState<AdminSettingsTab>(() => {
    if (typeof window !== 'undefined') {
      const param = new URLSearchParams(window.location.search).get('tab');
      if (param && ['fork', 'gamification', 'quests', 'levels'].includes(param)) {
        return param as AdminSettingsTab;
      }
    }
    return 'fork';
  });

  const handleTabChange = (tab: AdminSettingsTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Giá trị ngưỡng Smart Fork từ DB
  const dbThreshold = useMemo(() => {
    if (settings.length > 0) {
      const forkSetting = settings.find((s) => s.key === 'fork_similarity_threshold');
      if (forkSetting?.value && typeof forkSetting.value === 'object') {
        const valObj = forkSetting.value as Record<string, unknown>;
        if (typeof valObj.threshold === 'number') {
          return valObj.threshold;
        }
      }
    }
    return 80;
  }, [settings]);

  // Gamification Settings
  const dbXpCap = useMemo(() => {
    const setting = settings.find((s) => s.key === 'daily_xp_cap');
    if (setting?.value !== undefined) {
      if (typeof setting.value === 'object' && setting.value !== null && 'value' in setting.value) {
        return Number((setting.value as Record<string, unknown>).value) || 500;
      }
      return Number(setting.value) || 500;
    }
    return 500;
  }, [settings]);

  const dbLeagueThreshold = useMemo(() => {
    const setting = settings.find((s) => s.key === 'league_min_threshold');
    if (setting?.value !== undefined) {
      if (typeof setting.value === 'object' && setting.value !== null && 'value' in setting.value) {
        return Number((setting.value as Record<string, unknown>).value) || 200;
      }
      return Number(setting.value) || 200;
    }
    return 200;
  }, [settings]);

  const [customThreshold, setCustomThreshold] = useState<number | null>(null);
  const [customXpCap, setCustomXpCap] = useState<number | null>(null);
  const [customLeagueThreshold, setCustomLeagueThreshold] = useState<number | null>(null);

  const forkThreshold = customThreshold !== null ? customThreshold : dbThreshold;
  const xpCap = customXpCap !== null ? customXpCap : dbXpCap;
  const leagueThreshold = customLeagueThreshold !== null ? customLeagueThreshold : dbLeagueThreshold;

  const isDirty = customThreshold !== null && customThreshold !== dbThreshold;
  const isGamificationDirty =
    (customXpCap !== null && customXpCap !== dbXpCap) ||
    (customLeagueThreshold !== null && customLeagueThreshold !== dbLeagueThreshold);

  // Notification feedback
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Live Tester Sandbox
  const [testWord1, setTestWord1] = useState('look at');
  const [testWord2, setTestWord2] = useState('looked at');

  // Tính toán sandbox
  const liveSimilarity = calculateWordSimilarity(testWord1, testWord2);
  const isMatchAccordingToThreshold = liveSimilarity >= forkThreshold;

  const handleThresholdChange = (val: number) => {
    const clamped = Math.max(50, Math.min(100, val));
    setCustomThreshold(clamped);
  };

  const handleResetDefault = () => {
    setCustomThreshold(80);
  };

  const handleResetGamification = () => {
    setCustomXpCap(500);
    setCustomLeagueThreshold(200);
  };

  const handleSave = async () => {
    try {
      setNotification(null);
      await updateMutation.mutateAsync({
        key: 'fork_similarity_threshold',
        value: { threshold: forkThreshold },
      });
      setCustomThreshold(null);
      setNotification({
        type: 'success',
        message: `Đã lưu thành công! Ngưỡng phát hiện trùng lặp khi Fork hiện là ${forkThreshold}%.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu cấu hình';
      setNotification({
        type: 'error',
        message: msg,
      });
    }
  };

  const handleSaveGamification = async () => {
    try {
      setNotification(null);
      await Promise.all([
        updateMutation.mutateAsync({ key: 'daily_xp_cap', value: xpCap }),
        updateMutation.mutateAsync({ key: 'league_min_threshold', value: leagueThreshold }),
      ]);
      setCustomXpCap(null);
      setCustomLeagueThreshold(null);
      setNotification({
        type: 'success',
        message: 'Đã lưu cài đặt Gamification thành công!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu cấu hình';
      setNotification({
        type: 'error',
        message: msg,
      });
    }
  };

  const dbQuestTemplates = useMemo<QuestTemplate[]>(() => {
    const setting = settings.find((s) => s.key === 'daily_quest_templates');
    if (setting?.value && Array.isArray(setting.value)) {
      return setting.value as QuestTemplate[];
    }
    return [];
  }, [settings]);

  const handleSaveQuests = async (templates: QuestTemplate[]) => {
    try {
      setNotification(null);
      await updateMutation.mutateAsync({
        key: 'daily_quest_templates',
        value: templates,
      });
      setNotification({
        type: 'success',
        message: 'Đã lưu cấu hình Nhiệm vụ hàng ngày thành công!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu cấu hình nhiệm vụ';
      setNotification({
        type: 'error',
        message: msg,
      });
    }
  };

  const dbReviewXpRates = useMemo<ReviewXpRates>(() => {
    const setting = settings.find((s) => s.key === 'review_xp_rates');
    if (setting?.value && typeof setting.value === 'object') {
      return { ...DEFAULT_REVIEW_XP_RATES, ...(setting.value as Partial<ReviewXpRates>) };
    }
    return DEFAULT_REVIEW_XP_RATES;
  }, [settings]);

  const dbPracticeXpRates = useMemo<PracticeXpRates>(() => {
    const setting = settings.find((s) => s.key === 'practice_xp_rates');
    if (setting?.value && typeof setting.value === 'object') {
      return { ...DEFAULT_PRACTICE_XP_RATES, ...(setting.value as Partial<PracticeXpRates>) };
    }
    return DEFAULT_PRACTICE_XP_RATES;
  }, [settings]);

  const dbVocabLevelConfig = useMemo<VocabLevelSettings>(() => {
    const setting = settings.find((s) => s.key === 'vocab_level_config');
    if (setting?.value && typeof setting.value === 'object') {
      const val = setting.value as Partial<VocabLevelSettings>;
      if (Array.isArray(val.levels) && val.levels.length > 0) {
        return {
          penaltyRule: val.penaltyRule || DEFAULT_VOCAB_LEVEL_SETTINGS.penaltyRule,
          allowLevelUpInCasualMode: !!val.allowLevelUpInCasualMode,
          levels: val.levels,
        };
      }
    }
    return DEFAULT_VOCAB_LEVEL_SETTINGS;
  }, [settings]);

  const handleSaveVocabLevels = async (newConfig: VocabLevelSettings) => {
    try {
      setNotification(null);
      await updateMutation.mutateAsync({
        key: 'vocab_level_config',
        value: newConfig,
      });
      setNotification({
        type: 'success',
        message: 'Đã lưu cấu hình Cấp độ Cây Sinh Trưởng thành công!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật cấu hình cấp độ';
      setNotification({
        type: 'error',
        message: msg,
      });
    }
  };

  const handleSaveXpRates = async (
    reviewRates: ReviewXpRates,
    practiceRates: PracticeXpRates
  ) => {
    try {
      setNotification(null);
      await Promise.all([
        updateMutation.mutateAsync({
          key: 'review_xp_rates',
          value: reviewRates,
        }),
        updateMutation.mutateAsync({
          key: 'practice_xp_rates',
          value: practiceRates,
        }),
      ]);
      setNotification({
        type: 'success',
        message: 'Đã lưu cấu hình Điểm Thưởng XP (Ôn tập & Kiểm tra) thành công!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu cấu hình điểm';
      setNotification({
        type: 'error',
        message: msg,
      });
    }
  };

  if (profileLoading || (isAdmin && settingsLoading)) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-text-secondary">Đang tải cài đặt hệ thống...</p>
      </div>
    );
  }

  // Chặn người dùng không phải Admin
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-danger/15 text-danger border border-danger/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Truy cập bị từ chối</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Trang này chỉ dành riêng cho <strong>Quản trị viên (Admin)</strong> để cấu hình các tham số
          toàn hệ thống.
        </p>
        <div className="pt-2">
          <Link href={ROUTES.APP.DASHBOARD}>
            <Button variant="surface" size="default" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang chính</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const TABS = [
    {
      id: 'fork' as const,
      label: 'Smart Fork',
      icon: GitFork,
      badge: `${forkThreshold}%`,
      isDirty: isDirty,
      color: 'text-brand bg-brand/15 border-brand/30',
    },
    {
      id: 'gamification' as const,
      label: 'Gamification & XP',
      icon: Gamepad2,
      badge: `${xpCap} XP`,
      isDirty: isGamificationDirty,
      color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    },
    {
      id: 'quests' as const,
      label: 'Nhiệm Vụ Ngày',
      icon: Target,
      badge: `${dbQuestTemplates.length} nv`,
      isDirty: false,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
    {
      id: 'levels' as const,
      label: 'Cây Sinh Trưởng',
      icon: Sprout,
      badge: 'Lv.0 - 5',
      isDirty: false,
      color: 'text-lime-400 bg-lime-500/15 border-lime-500/30',
    },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-5xl mx-auto space-y-6 pb-20 w-full overflow-x-hidden"
    >
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" className="gap-1.5 py-1 px-3">
            <Sliders className="w-3.5 h-3.5" />
            Admin Control Panel
          </Badge>
          <Badge variant="secondary" className="gap-1 text-[11px]">
            Cài đặt chung hệ thống
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Cấu Hình Tham Số Hệ Thống
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Quản lý tập trung các quy tắc nghiệp vụ: Thuật toán kiểm tra trùng lặp từ vựng, hạn mức XP & bảng xếp hạng, nhiệm vụ hàng ngày và hệ thống cây sinh trưởng.
        </p>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface/80 border border-border/80 backdrop-blur-xs min-w-max sm:min-w-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'relative flex items-center justify-center sm:justify-between gap-2.5 py-2.5 px-3 sm:px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none',
                  'min-w-[140px] sm:min-w-0 sm:flex-1',
                  isActive
                    ? 'text-text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsTabPill"
                    className="absolute inset-0 bg-base/90 border border-border/90 rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="flex items-center gap-2 relative z-10 min-w-0">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors border',
                      isActive
                        ? tab.color
                        : 'bg-surface text-text-secondary border-border/60'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold whitespace-nowrap">{tab.label}</span>
                  {tab.isDirty && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse"
                      title="Có thay đổi chưa lưu"
                    />
                  )}
                </div>

                {tab.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-mono font-medium px-2 py-0.5 rounded-md relative z-10 shrink-0 border whitespace-nowrap',
                      isActive
                        ? 'bg-brand/10 text-brand border-brand/20'
                        : 'bg-surface text-text-secondary border-border/60'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all ${
              notification.type === 'success'
                ? 'bg-success/15 border-success/30 text-text-primary'
                : 'bg-danger/15 border-danger/30 text-danger'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            )}
            <p className="text-xs leading-relaxed">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Panels with AnimatePresence */}
      <AnimatePresence mode="wait">
        {activeTab === 'fork' && (
          <motion.div
            key="tab-fork"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Card: Smart Fork & Trùng lặp từ vựng */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-border/80 space-y-6 shadow-xs">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">
                      Smart Fork — Ngưỡng Phát Hiện Trùng Lặp Từ Vựng
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Xác định độ tương đồng (%) tối thiểu giữa từ trong bộ sưu tập và kho từ của user để kích hoạt cảnh báo trùng lặp.
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 text-brand border-brand/30 shrink-0">
                  {forkThreshold}%
                </Badge>
              </div>

              {/* Range Slider & Input Controller */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                    <span>Độ tương đồng kích hoạt (Similarity Threshold)</span>
                    <span className="text-[11px] text-text-secondary">(Từ 50% đến 100%)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={50}
                      max={100}
                      value={forkThreshold}
                      onChange={(e) => handleThresholdChange(Number(e.target.value))}
                      className="w-20 h-8 text-center text-xs font-bold bg-base border-border"
                    />
                    <span className="text-xs text-text-secondary font-medium">%</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-1 pt-1">
                  <input
                    type="range"
                    min={50}
                    max={100}
                    step={1}
                    value={forkThreshold}
                    onChange={(e) => handleThresholdChange(Number(e.target.value))}
                    className="w-full h-2 bg-base rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary px-0.5">
                    <span>50% (Rất lỏng)</span>
                    <span className="text-text-primary font-medium">80% (Khuyến nghị chuẩn)</span>
                    <span>100% (Trùng khớp tuyệt đối)</span>
                  </div>
                </div>

                {/* Hướng dẫn ý nghĩa các mức */}
                <div className="p-3.5 rounded-xl bg-base/50 border border-border/70 text-xs space-y-2 text-text-secondary">
                  <div className="flex items-center gap-1.5 text-text-primary font-medium">
                    <HelpCircle className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span>Gợi ý thiết lập ngưỡng tối ưu:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed pl-1">
                    <li>
                      <strong className="text-text-primary">80% (Khuyến nghị chuẩn)</strong>: Bắt chính xác các biến thể ngữ pháp như thì quá khứ (<em>look at</em> vs <em>looked at</em>: ~94%), danh từ số nhiều (<em>cat</em> vs <em>cats</em>: ~92%), hiện tại tiếp diễn (<em>run</em> vs <em>running</em>: ~85%).
                    </li>
                    <li>
                      <strong className="text-text-primary">100% (Khắt khe)</strong>: Chỉ cảnh báo nếu từ vựng hoàn toàn trùng khớp 100% (chính xác từng chữ cái).
                    </li>
                    <li>
                      <strong className="text-text-primary">60% - 70% (Nhạy cảm cao)</strong>: Bắt cả những từ có chung tiền tố hoặc gốc từ tương đồng nhưng nghĩa có thể khác nhau.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Live Similarity Tester Sandbox */}
              <div className="p-4 rounded-xl bg-base/80 border border-border/80 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                    <Sparkles className="w-3.5 h-3.5 text-brand shrink-0" />
                    <span>Bộ Thử Nghiệm Tương Đồng Trực Tiếp (Live Tester)</span>
                  </div>
                  <span className="text-[10px] text-text-secondary">Thử gõ 2 từ để kiểm tra thuật toán so khớp</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-text-secondary mb-1 block">Từ mẫu 1 (Bộ sưu tập)</label>
                    <Input
                      value={testWord1}
                      onChange={(e) => setTestWord1(e.target.value)}
                      placeholder="Ví dụ: look at"
                      className="h-8 text-xs bg-surface border-border"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary mb-1 block">Từ mẫu 2 (Kho cá nhân)</label>
                    <Input
                      value={testWord2}
                      onChange={(e) => setTestWord2(e.target.value)}
                      placeholder="Ví dụ: looked at"
                      className="h-8 text-xs bg-surface border-border"
                    />
                  </div>
                </div>

                {/* Kết quả thử nghiệm */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-text-secondary">Độ tương đồng tính toán:</span>
                    <Badge
                      variant="outline"
                      className="text-xs font-bold px-2 py-0.5 gap-1 bg-surface border-border text-brand"
                    >
                      <Zap className="w-3 h-3" />
                      {liveSimilarity}%
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-text-secondary">Với ngưỡng {forkThreshold}%:</span>
                    {isMatchAccordingToThreshold ? (
                      <Badge variant="warning" className="gap-1 text-[11px] bg-amber-500/15 border-amber-500/30 text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        Cảnh báo Trùng lặp
                      </Badge>
                    ) : (
                      <Badge variant="success" className="gap-1 text-[11px] bg-success/15 border-success/30 text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Hợp lệ (Từ mới)
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDefault}
                  disabled={forkThreshold === 80}
                  className="text-xs text-text-secondary hover:text-text-primary gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại 80% (Mặc định)</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || !isDirty}
                  className="gap-2 text-xs font-semibold bg-brand hover:bg-brand-hover text-white shadow-xs shadow-brand/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? 'Đang lưu...' : 'Lưu Cấu Hình'}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'gamification' && (
          <motion.div
            key="tab-gamification"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Card: Gamification Settings (Cap & League) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-border/80 space-y-6 shadow-xs">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">
                      Cài đặt Gamification (XP & Bảng xếp hạng)
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Cấu hình giới hạn XP tối đa mỗi ngày và điểm xét duyệt thăng hạng League tuần.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 p-4 rounded-xl bg-base/50 border border-border/70">
                  <label className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                    <span>Giới hạn XP mỗi ngày (Daily XP Cap)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={100}
                      max={10000}
                      value={xpCap}
                      onChange={(e) => setCustomXpCap(Number(e.target.value))}
                      className="text-sm font-bold bg-surface border-border"
                    />
                    <span className="text-xs text-text-secondary font-medium">XP</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed pt-1">
                    Ngăn chặn việc cày XP vô hạn trong 1 ngày làm hỏng cân bằng cạnh tranh (Mặc định: 500 XP).
                  </p>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-base/50 border border-border/70">
                  <label className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                    <span>Ngưỡng lên hạng (League Min Threshold)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={50}
                      max={5000}
                      value={leagueThreshold}
                      onChange={(e) => setCustomLeagueThreshold(Number(e.target.value))}
                      className="text-sm font-bold bg-surface border-border"
                    />
                    <span className="text-xs text-text-secondary font-medium">XP</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed pt-1">
                    Mức XP TỐI THIỂU trong tuần người dùng cần đạt để được vào danh sách xét thăng hạng Top 20% (Mặc định: 200 XP).
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetGamification}
                  disabled={xpCap === 500 && leagueThreshold === 200}
                  className="text-xs text-text-secondary hover:text-text-primary gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt lại (Mặc định)</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  onClick={handleSaveGamification}
                  disabled={updateMutation.isPending || !isGamificationDirty}
                  className="gap-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs shadow-indigo-500/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? 'Đang lưu...' : 'Lưu Gamification'}</span>
                </Button>
              </div>
            </div>

            {/* Card: XP Settings (Review & Practice) */}
            <XpSettingsCard
              initialReviewRates={dbReviewXpRates}
              initialPracticeRates={dbPracticeXpRates}
              onSave={handleSaveXpRates}
              isSaving={updateMutation.isPending}
            />
          </motion.div>
        )}

        {activeTab === 'quests' && (
          <motion.div
            key="tab-quests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Card: Daily Quests Configuration */}
            <QuestSettingsCard
              initialTemplates={dbQuestTemplates}
              onSave={handleSaveQuests}
              isSaving={updateMutation.isPending}
            />
          </motion.div>
        )}

        {activeTab === 'levels' && (
          <motion.div
            key="tab-levels"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Card: Vocab Tree-Growth Level Configuration */}
            <VocabLevelSettingsCard
              initialConfig={dbVocabLevelConfig}
              onSave={handleSaveVocabLevels}
              isSaving={updateMutation.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
