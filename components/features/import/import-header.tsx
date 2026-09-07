'use client';

import React from 'react';
import { BookOpen, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportHeaderProps {
  activeTab: 'reader' | 'saved';
  onTabChange: (tab: 'reader' | 'saved') => void;
  savedCount?: number;
}

export function ImportHeader({ activeTab, onTabChange, savedCount = 0 }: ImportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand/10 border border-brand/20 text-brand">
            <BookOpen className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Trình Đọc Ngữ Cảnh & Import
          </h1>
        </div>
        <p className="text-sm text-text-secondary mt-1">
          Đọc bài viết tiếng Anh, chạm vào từ để tra nghĩa tức thì và lưu kèm câu ngữ cảnh gốc
        </p>
      </div>

      <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border/60 shrink-0 self-start sm:self-auto">
        <button
          onClick={() => onTabChange('reader')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'reader'
              ? 'bg-brand text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bài đọc</span>
        </button>

        <button
          onClick={() => onTabChange('saved')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
            activeTab === 'saved'
              ? 'bg-brand text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Bookmark className="w-4 h-4" />
          <span>Đã lưu</span>
          {savedCount > 0 && (
            <span
              className={cn(
                'text-[11px] px-1.5 py-0.2 rounded-full font-bold',
                activeTab === 'saved'
                  ? 'bg-white/20 text-white'
                  : 'bg-surface-hover text-text-secondary border border-border'
              )}
            >
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
