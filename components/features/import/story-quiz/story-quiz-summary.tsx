'use client';

import React from 'react';
import { Trophy, RotateCcw, Sparkles, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoryQuizSummaryProps {
  stats: {
    totalQuestions: number;
    mcqTotal: number;
    mcqCorrect: number;
    mcqAnswered: number;
    essayTotal: number;
    essayGradedCount: number;
    essayAverageScore: number;
    isCompleted: boolean;
  };
  onRetry: () => void;
  onNewQuiz: () => void;
  onReviewQuestions?: () => void;
}

export function StoryQuizSummary({
  stats,
  onRetry,
  onNewQuiz,
  onReviewQuestions,
}: StoryQuizSummaryProps) {
  const {
    totalQuestions,
    mcqTotal,
    mcqCorrect,
    essayTotal,
    essayAverageScore,
  } = stats;

  const mcqPercentage = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : null;

  // Đánh giá hiệu suất
  let performanceTitle = 'Làm tốt lắm!';
  let performanceDesc = 'Đã nắm bắt được nội dung cơ bản';
  let performanceBadge = '👏';

  if (mcqPercentage !== null) {
    if (mcqPercentage >= 80) {
      performanceTitle = 'Xuất sắc!';
      performanceDesc = 'Nắm rất vững nội dung và chi tiết bài đọc';
      performanceBadge = '🌟';
    } else if (mcqPercentage < 60) {
      performanceTitle = 'Cần cố gắng!';
      performanceDesc = 'Hãy đọc lại câu chuyện để nắm rõ chi tiết hơn';
      performanceBadge = '💪';
    }
  } else if (essayAverageScore >= 80) {
    performanceTitle = 'Xuất sắc!';
    performanceDesc = 'Khả năng diễn đạt và hiểu bài rất tốt';
    performanceBadge = '🌟';
  }

  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-surface border border-border/80 shadow-md p-6 sm:p-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/25 text-brand flex items-center justify-center shrink-0 shadow-xs">
          <Trophy className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã hoàn thành {totalQuestions}/{totalQuestions} câu hỏi
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Hoàn Thành Bài Luyện Đọc Hiểu!
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary">
            Bạn đã hoàn thành phiên luyện tập đọc hiểu cùng AI cho câu chuyện này.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-base/70 border border-border/60">
        {/* Metric 1: Accuracy or Score */}
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-semibold tracking-wider text-text-secondary">
            {mcqTotal > 0 ? 'Tỷ lệ chính xác' : 'Điểm tự luận'}
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {mcqPercentage !== null ? `${mcqPercentage}%` : `${essayAverageScore}/100`}
          </div>
          <p className="text-[11px] text-text-secondary">
            {mcqTotal > 0 ? `Đúng ${mcqCorrect}/${mcqTotal} câu hỏi` : 'Đã được AI chấm điểm'}
          </p>
        </div>

        {/* Metric 2: Evaluation */}
        <div className="space-y-1 sm:border-l border-border/60 sm:pl-3">
          <span className="text-[11px] uppercase font-semibold tracking-wider text-text-secondary">
            Đánh giá kết quả
          </span>
          <div className="text-sm font-bold text-text-primary pt-0.5 flex items-center gap-1.5">
            <span>{performanceBadge}</span>
            <span>{performanceTitle}</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-snug">
            {performanceDesc}
          </p>
        </div>

        {/* Metric 3: Completion Progress */}
        <div className="space-y-1.5 sm:border-l border-border/60 sm:pl-3 flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>Độ hoàn thành</span>
            <span className="font-semibold text-text-primary">100%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-border overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                (mcqPercentage ?? 100) >= 80
                  ? 'bg-emerald-500'
                  : (mcqPercentage ?? 100) >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              )}
              style={{ width: `${mcqPercentage ?? 100}%` }}
            />
          </div>
          <span className="text-[10px] text-text-secondary">
            {mcqTotal > 0 && essayTotal > 0
              ? `${mcqTotal} trắc nghiệm • ${essayTotal} tự luận`
              : mcqTotal > 0
              ? `${mcqTotal} câu trắc nghiệm`
              : `${essayTotal} câu tự luận`}
          </span>
        </div>
      </div>

      {/* Breakdown if mixed mode */}
      {mcqTotal > 0 && essayTotal > 0 && (
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-base/50 border border-border/50 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Trắc nghiệm:</span>
            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {mcqCorrect}/{mcqTotal} ({mcqPercentage}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Điểm tự luận:</span>
            <span className="font-bold font-mono text-sky-500">
              {essayAverageScore}/100
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 pt-2 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="gap-1.5 rounded-xl text-xs font-semibold px-4 border-border hover:bg-surface-hover"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Làm lại bài</span>
        </Button>

        {onReviewQuestions && (
          <Button
            type="button"
            variant="outline"
            onClick={onReviewQuestions}
            className="gap-1.5 rounded-xl text-xs font-semibold px-4 border-border hover:bg-surface-hover"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem lại đáp án</span>
          </Button>
        )}

        <Button
          type="button"
          variant="brand"
          onClick={onNewQuiz}
          className="gap-1.5 rounded-xl text-xs font-bold px-5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tạo bộ câu hỏi mới</span>
        </Button>
      </div>
    </div>
  );
}
