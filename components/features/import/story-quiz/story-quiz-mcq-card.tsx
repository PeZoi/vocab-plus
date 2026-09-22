'use client';

import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StoryMultipleChoiceQuestion, McqAnswerState } from '@/types/story-quiz.types';
import { cn } from '@/lib/utils';

interface StoryQuizMcqCardProps {
  question: StoryMultipleChoiceQuestion;
  answerState?: McqAnswerState;
  onSelectOption: (optionIndex: number) => void;
  onNext?: () => void;
  hasNext: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function StoryQuizMcqCard({
  question,
  answerState,
  onSelectOption,
  onNext,
  hasNext,
}: StoryQuizMcqCardProps) {
  const isRevealed = Boolean(answerState?.revealed);
  const selectedIdx = answerState?.selectedIndex;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Question Header */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand px-2 py-0.5 rounded-md bg-brand/10 border border-brand/25 inline-block">
          Trắc nghiệm đọc hiểu
        </span>
        <h4 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
          {question.question}
        </h4>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-2.5">
        {question.options.map((optText, optIdx) => {
          const isSelected = selectedIdx === optIdx;
          const isCorrectOption = optIdx === question.correct_index;

          let optionStyle =
            'bg-base/60 border-border/80 text-text-primary hover:border-brand/40 hover:bg-surface-hover';

          if (isRevealed) {
            if (isCorrectOption) {
              optionStyle =
                'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs';
            } else if (isSelected && !isCorrectOption) {
              optionStyle =
                'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400 font-semibold shadow-xs';
            } else {
              optionStyle = 'bg-base/30 border-border/40 text-text-secondary/60 opacity-60';
            }
          }

          return (
            <button
              key={`opt-${optIdx}`}
              type="button"
              disabled={isRevealed}
              onClick={() => onSelectOption(optIdx)}
              className={cn(
                'w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-3 select-none',
                optionStyle,
                !isRevealed && 'cursor-pointer active:scale-[0.99]'
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 border',
                    isRevealed && isCorrectOption
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : isRevealed && isSelected && !isCorrectOption
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-surface border-border text-text-secondary'
                  )}
                >
                  {OPTION_LABELS[optIdx]}
                </span>
                <span className="text-sm leading-relaxed">{optText}</span>
              </div>

              {/* Status Icon */}
              {isRevealed && isCorrectOption && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-in zoom-in-50" />
              )}
              {isRevealed && isSelected && !isCorrectOption && (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 animate-in zoom-in-50" />
              )}
            </button>
          );
        })}
      </div>

      {/* Immediate Feedback & Explanation Box */}
      {isRevealed && (
        <div
          className={cn(
            'p-4 rounded-xl border space-y-2 text-xs animate-in slide-in-from-top-2 duration-300',
            answerState?.isCorrect
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
          )}
        >
          <div className="flex items-center justify-between gap-2 font-bold text-sm">
            <span className="flex items-center gap-1.5">
              {answerState?.isCorrect ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Chính xác! Đáp án đúng là {OPTION_LABELS[question.correct_index]}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Chưa chính xác. Đáp án đúng là {OPTION_LABELS[question.correct_index]}</span>
                </>
              )}
            </span>
          </div>

          <div className="pt-1.5 border-t border-current/20 flex items-start gap-2 text-text-primary text-xs leading-relaxed">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-400 font-semibold block mb-0.5">Giải thích chi tiết:</strong>
              <p className="text-text-secondary dark:text-slate-300">{question.explanation_vi}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Action Button */}
      {isRevealed && hasNext && onNext && (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="brand"
            size="sm"
            onClick={onNext}
            className="gap-1.5 rounded-xl text-xs font-semibold px-4"
          >
            <span>Câu tiếp theo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
