'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  RotateCw,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StoryEssayQuestion, EssayAnswerState } from '@/types/story-quiz.types';
import { cn } from '@/lib/utils';

interface StoryQuizEssayCardProps {
  question: StoryEssayQuestion;
  answerState?: EssayAnswerState;
  onTextChange: (text: string) => void;
  onGrade: () => void;
  onNext?: () => void;
  hasNext: boolean;
}

export function StoryQuizEssayCard({
  question,
  answerState,
  onTextChange,
  onGrade,
  onNext,
  hasNext,
}: StoryQuizEssayCardProps) {
  const [showSample, setShowSample] = useState(false);
  const text = answerState?.text || '';
  const isGrading = Boolean(answerState?.isGrading);
  const result = answerState?.result;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Question Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/25 inline-block">
            Tự luận đọc hiểu
          </span>
          {question.evaluation_criteria && (
            <span className="text-[11px] text-text-secondary line-clamp-1 italic">
              Yêu cầu: {question.evaluation_criteria}
            </span>
          )}
        </div>
        <h4 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
          {question.question}
        </h4>
      </div>

      {/* Essay Answer Textarea Area */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-secondary">
          Câu trả lời của bạn (bằng tiếng Anh dựa trên câu chuyện):
        </label>
        <textarea
          rows={3}
          value={text}
          disabled={isGrading}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Type your English answer here based on the story facts..."
          className="w-full px-4 py-3 rounded-xl bg-base border border-border text-text-primary placeholder:text-text-secondary/50 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-hidden transition-all disabled:opacity-70 resize-y"
        />

        {/* Action Button & Character Count */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <span className="text-[11px] text-text-secondary">
            {text.trim().length} ký tự
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="brand"
              size="sm"
              onClick={onGrade}
              disabled={isGrading || text.trim().length === 0}
              className="gap-2 rounded-xl text-xs font-semibold px-4"
            >
              {isGrading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI đang chấm điểm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{result ? 'Chấm lại bài' : 'Chấm điểm bằng AI'}</span>
                </>
              )}
            </Button>

            {result && hasNext && onNext && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNext}
                className="gap-1.5 rounded-xl text-xs font-semibold px-3.5 border-border"
              >
                <span>Câu tiếp theo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Grading Results Card */}
      {result && (
        <div
          className={cn(
            'p-4 sm:p-5 rounded-2xl border space-y-3.5 animate-in slide-in-from-top-2 duration-300',
            result.is_correct
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          )}
        >
          {/* Score Header */}
          <div className="flex items-center justify-between gap-3 border-b border-current/15 pb-2.5">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm',
                  result.is_correct
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/20'
                    : 'bg-amber-500 text-white shadow-xs shadow-amber-500/20'
                )}
              >
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block text-text-primary">
                  {result.is_correct ? 'Đạt yêu cầu đọc hiểu' : 'Cần bổ sung thêm ý'}
                </span>
                <span className="text-[11px] text-text-secondary">
                  Điểm AI đánh giá dựa trên nội dung bài đọc
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={cn(
                  'text-xl font-black font-mono tracking-tight block leading-none',
                  result.is_correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                )}
              >
                {result.score}
                <span className="text-xs font-normal text-text-secondary">/100</span>
              </span>
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              {result.is_correct ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-text-primary">
                <strong className="font-semibold block text-text-primary">
                  Nhận xét của giáo viên AI:
                </strong>
                <p className="text-text-secondary dark:text-slate-300 leading-relaxed">
                  {result.feedback_vi}
                </p>
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions_vi && (
              <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-text-secondary space-y-1">
                <strong className="text-text-primary font-semibold block text-[11px]">
                  💡 Gợi ý cải thiện:
                </strong>
                <p className="text-[11px] leading-relaxed">{result.suggestions_vi}</p>
              </div>
            )}

            {/* Polished sentence if available */}
            {result.corrected_answer && (
              <div className="p-3 rounded-xl bg-base/60 border border-border/70 space-y-1">
                <span className="text-[11px] font-semibold text-brand block">
                  ✨ Diễn đạt tiếng Anh tự nhiên hơn:
                </span>
                <p className="text-xs font-medium text-text-primary italic">
                  &quot;{result.corrected_answer}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Sample Answer Accordion */}
          {question.sample_answer && (
            <div className="pt-2 border-t border-current/10">
              <button
                type="button"
                onClick={() => setShowSample(!showSample)}
                className="text-xs text-brand hover:underline font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showSample ? 'Ẩn câu trả lời mẫu' : 'Xem câu trả lời mẫu chuẩn'}</span>
                {showSample ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSample && (
                <div className="mt-2 p-3 rounded-xl bg-base border border-border text-xs text-text-primary space-y-1 animate-in fade-in duration-200">
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    Câu trả lời mẫu tham khảo:
                  </span>
                  <p className="italic text-emerald-700 dark:text-emerald-400 font-medium">
                    &quot;{question.sample_answer}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
