'use client';

import React, { useState } from 'react';
import { Headphones, Sparkles, ArrowRight, ClipboardCopy, Loader2 } from 'lucide-react';
import type { ListeningDifficulty } from '@/types/listening.types';

interface ListeningHeroBannerProps {
  onLoadUrl: (url: string) => Promise<void>;
  isLoading: boolean;
  selectedDifficulty: ListeningDifficulty;
  onChangeDifficulty: (difficulty: ListeningDifficulty) => void;
}

export function ListeningHeroBanner({
  onLoadUrl,
  isLoading,
  selectedDifficulty,
  onChangeDifficulty,
}: ListeningHeroBannerProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text);
          setErrorMsg('');
        }
      }
    } catch {
      // ignore clipboard error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setErrorMsg('Vui lòng dán đường dẫn video hoặc Podcast YouTube.');
      return;
    }
    setErrorMsg('');
    await onLoadUrl(inputUrl.trim());
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-brand/5 border border-border/70 p-5 sm:p-8 shadow-sm">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl space-y-6">
        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-semibold tracking-wide">
            <Headphones className="w-3.5 h-3.5" />
            <span>Phòng Luyện Nghe Podcast & Chép Chính Tả</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Luyện Nghe Chủ Động Với{' '}
            <span className="bg-gradient-to-r from-brand via-orange-400 to-amber-400 bg-clip-text text-transparent">
              YouTube Podcast
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
            Dán link bất kỳ podcast hoặc video tiếng Anh trên YouTube để tự động tạo bài tập chép chính tả
            thông minh. Lặp câu tự động, bắt nhịp nối âm bản xứ và lưu từ vựng trực tiếp vào kho FSRS.
          </p>
        </div>

        {/* Input Bar & Controls */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Dán link YouTube (vd: https://www.youtube.com/watch?v=... hoặc youtu.be/...)"
                className="w-full h-12 pl-11 pr-24 rounded-2xl bg-base/80 border border-border focus:border-brand focus:ring-1 focus:ring-brand text-sm text-text-primary placeholder:text-text-secondary/50 outline-hidden transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 top-2 bottom-2 px-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Dán từ bộ nhớ tạm"
              >
                <ClipboardCopy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dán</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-6 rounded-2xl bg-brand hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand/20 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải phụ đề...</span>
                </>
              ) : (
                <>
                  <span>Bắt Đầu Luyện Nghe</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {errorMsg && <p className="text-xs text-danger font-medium">{errorMsg}</p>}

          {/* Chọn cấp độ luyện nghe */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Chế độ luyện:</span>
              <div className="inline-flex p-1 rounded-xl bg-base border border-border gap-1">
                <button
                  type="button"
                  onClick={() => onChangeDifficulty('easy')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedDifficulty === 'easy'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  🟢 Dễ (Điền từ)
                </button>

                <button
                  type="button"
                  onClick={() => onChangeDifficulty('medium')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedDifficulty === 'medium'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  🟡 Vừa (Điền cụm từ)
                </button>

                <button
                  type="button"
                  onClick={() => onChangeDifficulty('hard')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedDifficulty === 'hard'
                      ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  🔴 Khó (Chép cả câu)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Phím tắt Pro: Ctrl (Nghe lại), Tab (Chuyển ô), Enter (Kiểm tra)</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
