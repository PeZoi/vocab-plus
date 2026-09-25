'use client';

import React, { useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import type { DictationGradingResult } from '@/types/listening.types';

interface FullDictationViewProps {
  expectedSentence: string;
  segmentId?: string;
  userAnswer: string;
  diffResult: DictationGradingResult | null;
  showAnswer: boolean;
  onAnswerChange: (value: string) => void;
  onEnterPress: () => void;
}

export function FullDictationView({
  expectedSentence,
  segmentId,
  userAnswer,
  diffResult,
  showAnswer,
  onAnswerChange,
  onEnterPress,
}: FullDictationViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tự động focus vào ô textarea khi chuyển sang câu mới
  useEffect(() => {
    if (showAnswer) return;

    const doFocus = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    };

    doFocus();
    const t1 = setTimeout(doFocus, 50);
    const t2 = setTimeout(doFocus, 150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [segmentId, showAnswer]);

  return (
    <div className="space-y-4">
      {/* Ô nhập chính tả toàn câu */}
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          autoFocus={!showAnswer}
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onEnterPress();
            }
          }}
          disabled={showAnswer}
          placeholder="Lắng nghe podcast và gõ lại toàn bộ câu hoặc đoạn văn bạn nghe được..."
          rows={3}
          className="w-full p-4 rounded-2xl bg-base border border-border focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm sm:text-base text-text-primary placeholder:text-text-secondary/50 outline-hidden transition-all resize-none shadow-inner"
        />
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Nhấn Enter để kiểm tra, Shift + Enter để xuống dòng</span>
          <span>{userAnswer.trim().split(/\s+/).filter(Boolean).length} từ đã gõ</span>
        </div>
      </div>

      {/* Hiển thị kết quả Diff so sánh trực quan khi đã chấm điểm */}
      {diffResult && !showAnswer && (
        <div className="p-4 rounded-2xl bg-base/80 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {diffResult.isPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm font-bold text-text-primary">
                Độ chính xác: {diffResult.accuracyPercentage}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                {diffResult.correctWords} / {diffResult.totalWords} từ đúng
              </span>
            </div>
          </div>

          {/* Tokens Diff Highlighting */}
          <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-surface border border-border/60 text-sm leading-relaxed">
            {diffResult.diffTokens.map((token, idx) => {
              if (token.type === 'correct') {
                return (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/20"
                  >
                    {token.actual || token.expected}
                  </span>
                );
              }

              if (token.type === 'incorrect') {
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-500 font-semibold border border-red-500/20"
                    title={`Đã gõ: "${token.actual}", Từ đúng: "${token.expected}"`}
                  >
                    <s className="opacity-60">{token.actual}</s>
                    <span className="text-emerald-500 underline font-bold">{token.expected}</span>
                  </span>
                );
              }

              if (token.type === 'missing') {
                return (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 font-semibold border border-amber-500/20"
                    title="Từ bị bỏ sót"
                  >
                    +{token.expected}
                  </span>
                );
              }

              if (token.type === 'extra') {
                return (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded-md bg-slate-500/15 text-slate-400 line-through border border-slate-500/20"
                    title="Từ gõ thừa"
                  >
                    {token.actual}
                  </span>
                );
              }

              return null;
            })}
          </div>

          <p className="text-xs text-text-secondary leading-relaxed italic">
            💡 {diffResult.feedback}
          </p>
        </div>
      )}

      {/* Hiển thị toàn bộ đáp án khi người dùng bật Show Answer */}
      {showAnswer && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đáp án câu podcast gốc:</span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-text-primary leading-relaxed">
            {expectedSentence}
          </p>
        </div>
      )}
    </div>
  );
}
