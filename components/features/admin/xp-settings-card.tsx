'use client';

import React, { useState, useMemo } from 'react';
import { Award, RotateCcw, Save, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type ReviewXpRates,
  type PracticeXpRates,
  DEFAULT_REVIEW_XP_RATES,
  DEFAULT_PRACTICE_XP_RATES,
} from '@/types/system-settings.types';

interface XpSettingsCardProps {
  initialReviewRates?: ReviewXpRates;
  initialPracticeRates?: PracticeXpRates;
  onSave: (reviewRates: ReviewXpRates, practiceRates: PracticeXpRates) => Promise<void>;
  isSaving: boolean;
}

export function XpSettingsCard({
  initialReviewRates,
  initialPracticeRates,
  onSave,
  isSaving,
}: XpSettingsCardProps) {
  const [reviewRates, setReviewRates] = useState<ReviewXpRates>(
    initialReviewRates || DEFAULT_REVIEW_XP_RATES
  );
  const [practiceRates, setPracticeRates] = useState<PracticeXpRates>(
    initialPracticeRates || DEFAULT_PRACTICE_XP_RATES
  );

  const [prevReview, setPrevReview] = useState(initialReviewRates);
  const [prevPractice, setPrevPractice] = useState(initialPracticeRates);

  if (initialReviewRates && initialReviewRates !== prevReview) {
    setPrevReview(initialReviewRates);
    setReviewRates(initialReviewRates);
  }

  if (initialPracticeRates && initialPracticeRates !== prevPractice) {
    setPrevPractice(initialPracticeRates);
    setPracticeRates(initialPracticeRates);
  }

  const isDirty = useMemo(() => {
    const origReview = initialReviewRates || DEFAULT_REVIEW_XP_RATES;
    const origPractice = initialPracticeRates || DEFAULT_PRACTICE_XP_RATES;

    const reviewChanged = reviewRates.per_card !== origReview.per_card;

    const practiceChanged =
      practiceRates.multiple_choice !== origPractice.multiple_choice ||
      practiceRates.cloze !== origPractice.cloze ||
      practiceRates.sentence_writing !== origPractice.sentence_writing ||
      practiceRates.perfect_bonus !== origPractice.perfect_bonus;

    return reviewChanged || practiceChanged;
  }, [reviewRates, practiceRates, initialReviewRates, initialPracticeRates]);

  const handleReset = () => {
    setReviewRates(DEFAULT_REVIEW_XP_RATES);
    setPracticeRates(DEFAULT_PRACTICE_XP_RATES);
  };

  const handleSave = () => {
    onSave(reviewRates, practiceRates);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-border/80 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Cấu hình Điểm Thưởng XP (Ôn tập & Kiểm tra)
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Tùy chỉnh số XP tích lũy trong mỗi phiên học. Toàn bộ điểm sẽ được tổng hợp và cập nhật một lần khi kết thúc phiên.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Điểm Ôn tập Flashcard */}
        <div className="space-y-4 p-4 rounded-xl bg-base/50 border border-border/70 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <BookOpen className="w-4 h-4 text-brand" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                1. Điểm Ôn tập Flashcard (SRS)
              </h3>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Mỗi thẻ flashcard hoàn thành trong phiên ôn tập sẽ tích lũy số điểm này và được tổng kết cập nhật một lần vào tài khoản khi kết thúc phiên.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface/80 border border-border/70 space-y-2.5">
            <label className="text-xs font-medium text-text-primary flex items-center justify-between">
              <span>Điểm cho mỗi Flashcard hoàn thành:</span>
              <span className="text-[11px] text-brand font-bold">1 thẻ = {reviewRates.per_card} XP</span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={20}
                value={reviewRates.per_card}
                onChange={(e) =>
                  setReviewRates((prev) => ({
                    ...prev,
                    per_card: Math.max(1, Number(e.target.value)),
                  }))
                }
                className="h-9 text-sm font-bold bg-base border-border text-center w-24"
              />
              <span className="text-xs text-text-secondary font-medium">XP / thẻ flashcard (Mặc định: 1)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Điểm Bài kiểm tra & Luyện tập */}
        <div className="space-y-4 p-4 rounded-xl bg-base/50 border border-border/70">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              2. Điểm Bài Kiểm Tra (Practice)
            </h3>
          </div>
          <p className="text-[11px] text-text-secondary">
            Điểm cộng cho mỗi câu trả lời đúng theo dạng câu hỏi và thưởng hoàn thành:
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>Trắc nghiệm 4 chọn</span>
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={practiceRates.multiple_choice}
                  onChange={(e) =>
                    setPracticeRates((prev) => ({
                      ...prev,
                      multiple_choice: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="h-8 text-xs font-bold bg-surface border-border text-center"
                />
                <span className="text-xs text-text-secondary">XP</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>Điền khuyết (Cloze)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={practiceRates.cloze}
                  onChange={(e) =>
                    setPracticeRates((prev) => ({
                      ...prev,
                      cloze: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="h-8 text-xs font-bold bg-surface border-border text-center"
                />
                <span className="text-xs text-text-secondary">XP</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                <span>Đặt câu AI (Tối đa)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={practiceRates.sentence_writing}
                  onChange={(e) =>
                    setPracticeRates((prev) => ({
                      ...prev,
                      sentence_writing: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="h-8 text-xs font-bold bg-surface border-border text-center"
                />
                <span className="text-xs text-text-secondary">XP</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>Thưởng đúng 100%</span>
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={practiceRates.perfect_bonus}
                  onChange={(e) =>
                    setPracticeRates((prev) => ({
                      ...prev,
                      perfect_bonus: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className="h-8 text-xs font-bold bg-surface border-border text-center"
                />
                <span className="text-xs text-text-secondary">XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-text-secondary hover:text-text-primary gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại mặc định</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="gap-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs shadow-amber-500/30"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Điểm'}</span>
        </Button>
      </div>
    </div>
  );
}
