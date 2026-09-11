'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CornerDownLeft,
  Play,
  Settings2,
  Shuffle,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CEFRBadge } from '@/components/common/cefr-badge';
import type { ReviewCardItem } from '@/types/review.types';

interface ReviewWarmupScreenProps {
  totalCards: number;
  dueCards: ReviewCardItem[];
  isCustomSession?: boolean;
  collectionTitle?: string;
  expectedXp: number;
  onStartSession: (config: {
    cardLimit: number;
    shuffleCards: boolean;
    autoPronounce: boolean;
  }) => void;
}

export function ReviewWarmupScreen({
  totalCards,
  dueCards,
  isCustomSession = false,
  collectionTitle,
  expectedXp,
  onStartSession,
}: ReviewWarmupScreenProps) {
  // Cấu hình quy mô phiên học: 5, 10, 15 hoặc Tất cả
  const availableLimits = [5, 10, 15, 20].filter((l) => l < totalCards);
  const [selectedLimit, setSelectedLimit] = useState<number>(totalCards);
  const [shuffleCards, setShuffleCards] = useState<boolean>(false);
  const [autoPronounce, setAutoPronounce] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('review_auto_pronounce') === 'true';
    }
    return false;
  });

  // Đếm các cấp độ CEFR có trong phiên học
  const cefrLevels = Array.from(
    new Set(dueCards.map((c) => c.card.cefr_level).filter(Boolean))
  ) as string[];

  const handleStart = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('review_auto_pronounce', String(autoPronounce));
    }
    onStartSession({
      cardLimit: selectedLimit,
      shuffleCards,
      autoPronounce,
    });
  };

  // Hỗ trợ phím tắt Enter hoặc Space để bắt đầu tức thì
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        // Bỏ qua nếu đang gõ trong input
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

        e.preventDefault();
        handleStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const effectiveCardCount = Math.min(selectedLimit, totalCards);
  const calculatedXp = Math.round((expectedXp * effectiveCardCount) / Math.max(1, totalCards));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-xl mx-auto py-6 sm:py-10 px-3 space-y-6 text-center"
    >
      {/* Visual Header */}
      <div className="relative space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-brand/25 via-amber-500/20 to-brand/10 border border-brand/35 flex items-center justify-center shadow-xl shadow-brand/15 relative group">
          <div className="absolute inset-0 bg-brand/10 rounded-3xl blur-xl animate-pulse" />
          <Brain className="w-10 h-10 text-brand relative z-10 animate-bounce" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sẵn Sàng Nạp Từ Vựng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-heading">
            Khởi Động Phiên Flashcard 🚀
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            {collectionTitle
              ? `Bộ từ: "${collectionTitle}"`
              : isCustomSession
              ? 'Phiên ôn tập từ vựng tùy chỉnh'
              : 'Hãy lướt qua nhóm từ vựng hôm nay để kích hoạt lại trí nhớ trước bài kiểm tra phản xạ.'}
          </p>
        </div>
      </div>

      {/* Thông số nhanh của phiên học */}
      <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-surface/90 border border-border/80 shadow-md">
        <div className="space-y-0.5">
          <span className="text-[11px] text-text-secondary font-medium">Số lượng thẻ</span>
          <p className="text-xl sm:text-2xl font-extrabold text-text-primary">
            {effectiveCardCount} <span className="text-xs font-normal text-text-secondary">từ</span>
          </p>
        </div>

        <div className="space-y-0.5 border-x border-border/70">
          <span className="text-[11px] text-text-secondary font-medium">Thưởng xem bài</span>
          <p className="text-xl sm:text-2xl font-extrabold text-brand">
            +{calculatedXp} <span className="text-xs font-normal text-text-secondary">XP</span>
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] text-text-secondary font-medium">Cấp độ CEFR</span>
          <div className="flex items-center justify-center gap-1 pt-1 flex-wrap">
            {cefrLevels.length > 0 ? (
              cefrLevels.slice(0, 2).map((lvl) => <CEFRBadge key={lvl} level={lvl} size="sm" />)
            ) : (
              <span className="text-xs font-semibold text-text-secondary">Đa dạng</span>
            )}
          </div>
        </div>
      </div>

      {/* Cấu hình phiên học (Quick Config) */}
      <div className="p-4 rounded-2xl bg-surface/60 border border-border/70 space-y-3.5 text-left">
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
          <Settings2 className="w-3.5 h-3.5 text-brand" />
          <span>Tùy chỉnh phiên học</span>
        </div>

        {/* Tùy chọn 1: Giới hạn số từ nếu danh sách nhiều hơn 5 */}
        {totalCards > 5 && (
          <div className="space-y-1.5">
            <span className="text-[11px] text-text-secondary block">
              Chọn số lượng từ muốn xem trong phiên này:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {availableLimits.map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => setSelectedLimit(limit)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedLimit === limit
                      ? 'bg-brand text-white border-brand shadow-sm shadow-brand/30'
                      : 'bg-base/70 text-text-secondary border-border/70 hover:text-text-primary hover:border-brand/40'
                  }`}
                >
                  {limit} từ
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedLimit(totalCards)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedLimit === totalCards
                    ? 'bg-brand text-white border-brand shadow-sm shadow-brand/30'
                    : 'bg-base/70 text-text-secondary border-border/70 hover:text-text-primary hover:border-brand/40'
                }`}
              >
                Tất cả ({totalCards} từ)
              </button>
            </div>
          </div>
        )}

        {/* Tùy chọn 2: Tự động phát âm & Xáo trộn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50">
          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-base/50 border border-border/50 cursor-pointer hover:border-brand/40 transition-colors select-none">
            <input
              type="checkbox"
              checked={autoPronounce}
              onChange={(e) => setAutoPronounce(e.target.checked)}
              className="rounded border-border text-brand focus:ring-brand/40 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-semibold text-text-primary flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-brand" />
                Tự động phát âm
              </span>
              <span className="text-[10px] text-text-secondary block">Phát âm khi lật thẻ</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-2 rounded-xl bg-base/50 border border-border/50 cursor-pointer hover:border-brand/40 transition-colors select-none">
            <input
              type="checkbox"
              checked={shuffleCards}
              onChange={(e) => setShuffleCards(e.target.checked)}
              className="rounded border-border text-brand focus:ring-brand/40 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-semibold text-text-primary flex items-center gap-1">
                <Shuffle className="w-3 h-3 text-brand" />
                Xáo trộn thẻ
              </span>
              <span className="text-[10px] text-text-secondary block">Thứ tự ngẫu nhiên</span>
            </div>
          </label>
        </div>
      </div>

      {/* Main Call To Action: Bắt đầu học ngay */}
      <div className="space-y-3 pt-1">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleStart}
          className="w-full h-13 gap-2 bg-gradient-to-r from-brand via-orange-500 to-amber-500 hover:from-brand-hover hover:to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-brand/25 rounded-xl group"
        >
          <Play className="w-5 h-5 fill-white transition-transform group-hover:scale-110" />
          <span>BẮT ĐẦU HỌC NGAY ({effectiveCardCount} TỪ)</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-white/20 text-white font-mono flex items-center gap-0.5 ml-1 font-normal">
            <CornerDownLeft className="w-3 h-3" />
            Enter
          </span>
        </Button>

        <div className="flex items-center justify-between gap-3 text-xs">
          <Link href={ROUTES.APP.DASHBOARD} className="flex-1">
            <Button
              type="button"
              variant="surface"
              size="sm"
              className="w-full h-9 border border-border text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Về Dashboard</span>
            </Button>
          </Link>

          <Link href={ROUTES.APP.VOCAB} className="flex-1">
            <Button
              type="button"
              variant="surface"
              size="sm"
              className="w-full h-9 border border-border text-text-secondary hover:text-text-primary"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              <span>Kho Từ Vựng</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
