'use client';

import React from 'react';
import { BookOpen, Trash2, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useImportedTextsQuery } from '@/hooks/features/import/use-imported-texts-query';
import { useDeleteImportedTextMutation } from '@/hooks/features/import/use-import-mutations';
import { calculateReadingStats } from '@/utils/text-extractor';
import type { ImportedText } from '@/types/imported-text.types';

interface SavedArticlesListProps {
  onSelectArticle: (article: ImportedText) => void;
}

export function SavedArticlesList({ onSelectArticle }: SavedArticlesListProps) {
  const { data: articles = [], isLoading } = useImportedTextsQuery();
  const { mutateAsync: deleteArticle } = useDeleteImportedTextMutation();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa bài đọc này?')) {
      try {
        await deleteArticle(id);
      } catch (err) {
        console.error('Lỗi khi xóa bài đọc:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={FileText}
          title="Chưa có bài đọc nào được lưu"
          description="Khi đọc một bài viết trong tab Bài đọc, bạn có thể bấm nút 'Lưu bài' để lưu trữ và luyện đọc lại bất cứ lúc nào."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {articles.map((article) => {
        const stats = calculateReadingStats(article.raw_text);
        const formattedDate = article.created_at
          ? new Date(article.created_at).toLocaleDateString('vi-VN')
          : '';

        return (
          <div
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="p-5 rounded-2xl bg-surface hover:bg-surface-hover border border-border/80 hover:border-brand/40 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1">
                  {article.title || 'Bài đọc không tên'}
                </h3>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, article.id)}
                  className="p-1.5 rounded-lg text-text-secondary/50 hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                  title="Xóa bài đọc"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-text-secondary line-clamp-3 mt-2 leading-relaxed">
                {article.raw_text}
              </p>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{stats.total_words} từ</span>
                </span>
                {formattedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-brand hover:text-brand-hover p-0 h-auto font-medium gap-1"
              >
                <span>Mở đọc</span>
                <BookOpen className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
