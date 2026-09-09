'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Volume2, XCircle } from 'lucide-react';
import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { WordLevelBadge } from '@/components/common/word-level-badge';
import { cn } from '@/lib/utils';
import type { QuizOptionItem, QuizQuestionItem } from '@/types/review.types';

interface QuizQuestionCardProps {
  question: QuizQuestionItem;
  selectedOptionId: string | null;
  isAnswered: boolean;
  onSelectOption: (option: QuizOptionItem) => void;
}

export function QuizQuestionCard({
  question,
  selectedOptionId,
  isAnswered,
  onSelectOption,
}: QuizQuestionCardProps) {
  const card = question.cardItem.card;
  const userCard = question.cardItem.user_card;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="p-5 sm:p-6 rounded-2xl bg-surface/95 border border-border space-y-5 shadow-sm"
    >
      {/* Card Header Info */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          {card.cefr_level && <CEFRBadge level={card.cefr_level} size="sm" />}
          <WordLevelBadge userCard={userCard} mode="compact" />
        </div>

        <div className="flex items-center gap-1">
          <AudioButton text={card.word} size="sm" />
        </div>
      </div>

      {/* Question Title & Content */}
      <div className="space-y-3 text-center sm:text-left">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {question.questionText}
        </p>

        {/* Context sentence for Cloze question */}
        {question.contextSentence ? (
          <div className="p-3.5 rounded-xl bg-base/80 border border-border/80 space-y-1.5 text-left">
            <p className="text-base font-medium text-text-primary leading-relaxed">
              &ldquo;{question.contextSentence}&rdquo;
            </p>
            {question.contextTranslation && (
              <p className="text-xs text-text-secondary italic">
                {question.contextTranslation}
              </p>
            )}
          </div>
        ) : question.type === 'en_to_vi' ? (
          <div className="text-center py-2">
            <h2 className="text-3xl font-extrabold text-text-primary tracking-tight font-heading">
              {card.word}
            </h2>
            {card.ipa && (
              <span className="font-mono text-xs text-text-secondary block mt-1">
                /{card.ipa.replace(/^\/|\/$/g, '')}/
              </span>
            )}
          </div>
        ) : question.type === 'audio_to_en' ? (
          <div className="text-center py-4 space-y-2">
            <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto text-brand animate-pulse">
              <Volume2 className="w-7 h-7" />
            </div>
            <p className="text-xs text-text-secondary">Bấm loa nếu cần nghe lại phát âm</p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-lg font-bold text-text-primary">
              &ldquo;{card.definition}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* 4 Multiple Choice Options */}
      <div className="grid grid-cols-1 gap-2.5 pt-2">
        {question.options.map((option, optIdx) => {
          const isSelected = selectedOptionId === option.id;
          let optionVariantClass = 'bg-base/70 border-border hover:border-brand/50 hover:bg-surface-hover text-text-primary';

          if (isAnswered) {
            if (option.isCorrect) {
              optionVariantClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-xs shadow-emerald-500/20';
            } else if (isSelected) {
              optionVariantClass = 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold';
            } else {
              optionVariantClass = 'bg-base/40 border-border/40 text-text-secondary/50 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option)}
              disabled={isAnswered}
              className={cn(
                'w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer disabled:cursor-default',
                optionVariantClass
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-surface border border-border/70 flex items-center justify-center font-mono text-xs font-bold text-text-secondary shrink-0">
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm font-medium leading-snug">{option.text}</span>
              </div>

              {isAnswered && (
                <div>
                  {option.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
