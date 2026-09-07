'use client';

import React from 'react';
import { FileText, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateReadingStats } from '@/utils/text-extractor';
import { AiStoryGenerator } from './ai-story-generator';

interface ImportInputFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  text: string;
  onTextChange: (text: string) => void;
  onStartReading: () => void;
}

export function ImportInputForm({
  title,
  onTitleChange,
  text,
  onTextChange,
  onStartReading,
}: ImportInputFormProps) {
  const stats = calculateReadingStats(text);
  const hasText = text.trim().length > 0;

  const handleStoryGenerated = (story: { title: string; text: string }) => {
    onTitleChange(story.title);
    onTextChange(story.text);
  };

  return (
    <div className="space-y-6">
      {/* AI Story Generator (Thay thế bài đọc mẫu tĩnh) */}
      <AiStoryGenerator onStoryGenerated={handleStoryGenerated} />


      {/* Input Article Area */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border/80 space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Tiêu đề bài viết (Tùy chọn)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Ví dụ: BBC News - The Evolution of Renewable Energy..."
            className="w-full px-4 py-2.5 rounded-xl bg-base border border-border text-text-primary placeholder:text-text-secondary/50 text-sm focus:border-brand transition-colors"
          />
        </div>

        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand" />
              <span>Nội dung bài viết tiếng Anh *</span>
            </label>
            {hasText && (
              <button
                type="button"
                onClick={() => {
                  onTextChange('');
                  onTitleChange('');
                }}
                className="text-[11px] text-text-secondary hover:text-danger transition-colors"
              >
                Xóa văn bản
              </button>
            )}
          </div>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Dán hoặc gõ đoạn văn tiếng Anh vào đây. Bạn có thể dán bài báo, bài thi IELTS Reading, hoặc tài liệu chuyên ngành..."
            className="w-full p-4 rounded-xl bg-base border border-border text-text-primary placeholder:text-text-secondary/50 text-sm leading-relaxed focus:border-brand transition-colors resize-y min-h-[220px]"
          />
        </div>

        {/* Live Reading Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-text-secondary border-t border-border/40">
          <div className="flex items-center gap-4">
            <span>
              <strong className="text-text-primary">{stats.total_words}</strong> từ
            </span>
            <span>
              <strong className="text-text-primary">{stats.unique_words}</strong> từ độc nhất
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-text-secondary" />
              <span>~{stats.reading_time_minutes} phút đọc</span>
            </span>
          </div>
          <span className="text-[11px] text-text-secondary/70">
            {text.length} ký tự
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center">
        <Button
          type="button"
          onClick={onStartReading}
          disabled={!hasText}
          className="w-full sm:w-auto px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-medium shadow-md shadow-brand/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <BookOpen className="w-4 h-4" />
          <span>Bắt đầu đọc tương tác</span>
        </Button>
      </div>
    </div>
  );
}
