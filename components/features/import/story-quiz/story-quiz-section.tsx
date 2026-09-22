'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  PenLine,
  Layers,
  RotateCcw,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStoryQuiz } from '@/hooks/features/import/use-story-quiz';
import { StoryQuizMcqCard } from './story-quiz-mcq-card';
import { StoryQuizEssayCard } from './story-quiz-essay-card';
import { StoryQuizSummary } from './story-quiz-summary';
import type { StoryQuizMode } from '@/types/story-quiz.types';
import { cn } from '@/lib/utils';

interface StoryQuizSectionProps {
  rawText: string;
  storyTitle?: string;
}

const MODES: { id: StoryQuizMode; label: string; desc: string; icon: React.ElementType }[] = [
  {
    id: 'multiple_choice',
    label: 'Trắc nghiệm',
    desc: '5 câu hỏi chọn A, B, C, D kèm giải thích chi tiết',
    icon: HelpCircle,
  },
  {
    id: 'essay',
    label: 'Tự luận',
    desc: '5 câu tự luận tiếng Anh được AI chấm điểm & nhận xét',
    icon: PenLine,
  },
  {
    id: 'mixed',
    label: 'Kết hợp',
    desc: 'Cả trắc nghiệm và tự luận (6 câu toàn diện)',
    icon: Layers,
  },
];

export function StoryQuizSection({ rawText, storyTitle }: StoryQuizSectionProps) {
  const {
    mode,
    setMode,
    isGenerating,
    questions,
    currentIndex,
    currentQuestion,
    mcqAnswers,
    essayAnswers,
    stats,
    handleGenerateQuiz,
    handleSelectMcqOption,
    handleEssayTextChange,
    handleGradeEssay,
    handleNextQuestion,
    handlePrevQuestion,
    handleSelectQuestionIndex,
    handleRetryQuiz,
    handleClearQuiz,
  } = useStoryQuiz();

  const [forceShowQuestions, setForceShowQuestions] = useState(false);

  // Khi chưa tạo câu hỏi
  if (questions.length === 0) {
    return (
      <section className="mt-8 pt-8 border-t border-border/80">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface/80 border border-border/80 backdrop-blur-xs relative overflow-hidden shadow-md">
          {/* Subtle decorative background gradient */}
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                AI Đọc Hiểu & Trắc Nghiệm Ngữ Cảnh
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                Luyện Tập Đọc Hiểu Cùng AI
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary">
                AI sẽ phân tích nội dung câu chuyện trên để tạo bộ câu hỏi đọc hiểu thông minh (tối thiểu 5 câu), giúp bạn củng cố từ vựng và khả năng nắm bắt ý chính.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {MODES.map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={cn(
                      'p-4 rounded-xl border text-left transition-all relative select-none flex flex-col justify-between gap-3 group',
                      isSelected
                        ? 'bg-brand/10 border-brand ring-1 ring-brand text-text-primary shadow-xs'
                        : 'bg-base/60 border-border/80 text-text-secondary hover:border-brand/40 hover:bg-surface-hover hover:text-text-primary'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-brand text-white shadow-xs'
                            : 'bg-surface border border-border group-hover:border-brand/30 text-text-secondary'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary">{m.label}</div>
                      <div className="text-[11px] text-text-secondary leading-snug mt-0.5">
                        {m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <Button
                size="lg"
                disabled={isGenerating || !rawText || rawText.trim().length < 30}
                onClick={() => handleGenerateQuiz(rawText, storyTitle)}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold shadow-md shadow-brand/20 gap-2 h-auto"
              >
                <Sparkles className={cn('w-4 h-4', isGenerating && 'animate-spin')} />
                {isGenerating ? 'AI Đang Phân Tích & Sinh Câu Hỏi...' : 'Tạo Câu Hỏi Với AI'}
              </Button>
              {(!rawText || rawText.trim().length < 30) && (
                <p className="text-[11px] text-text-secondary/70 mt-2">
                  (Bài đọc cần ít nhất 30 ký tự để AI có thể sinh câu hỏi)
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Khi đã hoàn thành toàn bộ bài quiz và không cố ý xem lại câu hỏi
  if (stats.isCompleted && !forceShowQuestions) {
    return (
      <section className="mt-8 pt-8 border-t border-border/80">
        <StoryQuizSummary
          stats={stats}
          onRetry={() => {
            handleRetryQuiz();
            setForceShowQuestions(false);
          }}
          onNewQuiz={() => {
            handleClearQuiz();
            setForceShowQuestions(false);
          }}
          onReviewQuestions={() => setForceShowQuestions(true)}
        />
      </section>
    );
  }

  // Giao diện làm bài / xem lại câu hỏi
  return (
    <section className="mt-8 pt-8 border-t border-border/80 space-y-5">
      {/* Header bar: Title & Actions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/25 text-brand flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-text-primary">
                Luyện Tập Đọc Hiểu
              </h3>
              <p className="text-[11px] text-text-secondary">
                Bộ {questions.length} câu hỏi AI dựa trên ngữ cảnh bài đọc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryQuiz}
              className="text-xs h-8 px-2.5 rounded-lg border-border hover:bg-surface-hover gap-1.5"
              title="Xóa kết quả và làm lại bộ câu hỏi này"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Làm lại
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleClearQuiz();
                setForceShowQuestions(false);
              }}
              className="text-xs h-8 px-2.5 rounded-lg border-border hover:bg-surface-hover gap-1.5 text-brand border-brand/30"
              title="Tạo bộ câu hỏi mới"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Đổi bộ câu hỏi
            </Button>
          </div>
        </div>

        {/* Question Stepper Dots / Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto p-1.5 -mx-1 scrollbar-none">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isMcq = q.type === 'multiple_choice';
            const mcqAns = mcqAnswers[q.id];
            const essayAns = essayAnswers[q.id];

            let statusIcon = null;
            let dotStyle =
              'bg-base/80 border-border/80 text-text-secondary hover:border-brand/40';

            if (isMcq && mcqAns?.revealed) {
              if (mcqAns.isCorrect) {
                dotStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 font-bold';
                statusIcon = <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
              } else {
                dotStyle = 'bg-rose-500/15 border-rose-500/60 text-rose-700 dark:text-rose-400 font-bold';
                statusIcon = <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />;
              }
            } else if (!isMcq && essayAns?.result) {
              dotStyle = 'bg-sky-500/15 border-sky-500/60 text-sky-400 font-bold';
              statusIcon = <Award className="w-3 h-3 text-sky-400" />;
            }

            if (isCurrent) {
              dotStyle = cn(
                dotStyle,
                'ring-2 ring-brand border-brand font-bold text-text-primary shadow-xs'
              );
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuestionIndex(idx)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-all whitespace-nowrap select-none shrink-0',
                  dotStyle
                )}
              >
                <span>Câu {idx + 1}</span>
                {statusIcon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      {currentQuestion && (
        <div className="p-5 sm:p-7 rounded-2xl bg-surface border border-border/80 shadow-md">
          {currentQuestion.type === 'multiple_choice' ? (
            <StoryQuizMcqCard
              question={currentQuestion}
              answerState={mcqAnswers[currentQuestion.id]}
              onSelectOption={(optIdx) => handleSelectMcqOption(currentQuestion, optIdx)}
              onNext={handleNextQuestion}
              hasNext={currentIndex < questions.length - 1}
            />
          ) : (
            <StoryQuizEssayCard
              question={currentQuestion}
              answerState={essayAnswers[currentQuestion.id]}
              onTextChange={(val) => handleEssayTextChange(currentQuestion.id, val)}
              onGrade={() => handleGradeEssay(currentQuestion, rawText)}
              onNext={handleNextQuestion}
              hasNext={currentIndex < questions.length - 1}
            />
          )}

          {/* Navigation Prev / Next Footer */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={handlePrevQuestion}
              className="rounded-xl border-border hover:bg-surface-hover gap-1 text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Câu trước
            </Button>

            <span className="text-xs text-text-secondary font-medium">
              {currentIndex + 1} / {questions.length}
            </span>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
                className="rounded-xl border-border hover:bg-surface-hover gap-1 text-xs sm:text-sm"
              >
                Câu tiếp
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : stats.isCompleted ? (
              <Button
                size="sm"
                onClick={() => setForceShowQuestions(false)}
                className="rounded-xl bg-brand hover:bg-brand-hover text-white font-bold gap-1 text-xs sm:text-sm shadow-sm"
              >
                Xem tổng kết
                <Award className="w-4 h-4" />
              </Button>
            ) : (
              <div className="text-[11px] text-text-secondary italic">
                (Câu cuối)
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
