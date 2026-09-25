'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Mic,
  ArrowRight,
  BookmarkPlus,
} from 'lucide-react';
import { WordClozeView } from './word-cloze-view';
import { ChunkClozeView } from './chunk-cloze-view';
import { FullDictationView } from './full-dictation-view';
import { ConnectedSpeechModal } from './connected-speech-modal';
import { ShadowingModal } from './shadowing-modal';
import { SaveToFlashcardModal } from './save-to-flashcard-modal';
import type {
  TimedSegment,
  ListeningDifficulty,
  WordClozeItem,
  ChunkClozeItem,
  DictationGradingResult,
} from '@/types/listening.types';

interface DictationWorkspaceProps {
  currentSegment: TimedSegment | null;
  currentIndex: number;
  totalSegments: number;
  difficulty: ListeningDifficulty;
  showHint: boolean;
  showAnswer: boolean;
  wordClozeItems: WordClozeItem[];
  chunkClozeItem: ChunkClozeItem | null;
  chunkClozeState: string;
  fullDictationText: string;
  diffResult: DictationGradingResult | null;
  isCurrentSegmentCompleted: boolean;
  onToggleHint: () => void;
  onToggleAnswer: () => void;
  onWordAnswerChange: (index: number, val: string) => void;
  onChunkAnswerChange: (val: string) => void;
  onDictationAnswerChange: (val: string) => void;
  onCheckAnswer: () => boolean;
  onNextSegment: () => void;
  podcastTitle?: string;
}

export function DictationWorkspace({
  currentSegment,
  currentIndex,
  totalSegments,
  difficulty,
  showHint,
  showAnswer,
  wordClozeItems,
  chunkClozeItem,
  chunkClozeState,
  fullDictationText,
  diffResult,
  isCurrentSegmentCompleted,
  onToggleHint,
  onToggleAnswer,
  onWordAnswerChange,
  onChunkAnswerChange,
  onDictationAnswerChange,
  onCheckAnswer,
  onNextSegment,
  podcastTitle,
}: DictationWorkspaceProps) {
  const [isConnectedSpeechOpen, setIsConnectedSpeechOpen] = useState(false);
  const [isShadowingOpen, setIsShadowingOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [vocabWordToSave, setVocabWordToSave] = useState('');

  const handleOpenSaveModal = (customWord?: string) => {
    if (customWord) {
      setVocabWordToSave(customWord);
    } else {
      const firstMasked = wordClozeItems.find((i) => i.isMasked);
      setVocabWordToSave(firstMasked ? firstMasked.cleanedWord : '');
    }
    setIsSaveModalOpen(true);
  };

  if (!currentSegment) {
    return (
      <div className="rounded-2xl bg-surface border border-border/70 p-8 text-center text-text-secondary">
        Vui lòng chọn một câu hoặc podcast để bắt đầu luyện nghe.
      </div>
    );
  }

  const handleCheck = () => {
    onCheckAnswer();
  };

  return (
    <div className="rounded-2xl bg-surface border border-border/70 p-4 sm:p-6 space-y-5 shadow-xs">
      {/* Header: Segment Counter & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight">
            Câu {currentIndex + 1} / {totalSegments}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
              difficulty === 'easy'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : difficulty === 'medium'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}
          >
            {difficulty === 'easy'
              ? 'Level: Dễ (Điền từ)'
              : difficulty === 'medium'
              ? 'Level: Vừa (Điền cụm)'
              : 'Level: Khó (Chép cả câu)'}
          </span>

          {isCurrentSegmentCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đã hoàn thành</span>
            </span>
          )}
        </div>

        {/* Translation Toggle */}
        {currentSegment.vietnameseTranslation && (
          <button
            type="button"
            onClick={() => setShowTranslation((prev) => !prev)}
            className="text-[11px] font-medium text-text-secondary hover:text-brand transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{showTranslation ? 'Ẩn nghĩa tiếng Việt' : 'Xem nghĩa tiếng Việt'}</span>
          </button>
        )}
      </div>

      {/* Vietnamese Meaning Box (Optional) */}
      {showTranslation && currentSegment.vietnameseTranslation && (
        <div className="p-3 rounded-xl bg-base/80 border border-border text-xs text-text-secondary italic leading-relaxed">
          🇻🇳 {currentSegment.vietnameseTranslation}
        </div>
      )}

      {/* Exercise Area based on selected difficulty */}
      <div className="py-2">
        {difficulty === 'easy' && (
          <WordClozeView
            key={currentSegment?.id || currentIndex}
            items={wordClozeItems}
            segmentId={currentSegment?.id}
            showHint={showHint}
            showAnswer={showAnswer}
            onAnswerChange={onWordAnswerChange}
            onEnterPress={handleCheck}
          />
        )}

        {difficulty === 'medium' && chunkClozeItem && (
          <ChunkClozeView
            key={currentSegment?.id || currentIndex}
            item={chunkClozeItem}
            segmentId={currentSegment?.id}
            userAnswer={
              chunkClozeState ||
              (isCurrentSegmentCompleted ? chunkClozeItem.maskedChunks[0]?.cleanedText || '' : '')
            }
            isCompleted={isCurrentSegmentCompleted}
            showHint={showHint}
            showAnswer={showAnswer}
            onAnswerChange={onChunkAnswerChange}
            onEnterPress={handleCheck}
          />
        )}

        {difficulty === 'hard' && (
          <FullDictationView
            key={currentSegment?.id || currentIndex}
            expectedSentence={currentSegment.text}
            segmentId={currentSegment?.id}
            userAnswer={
              fullDictationText || (isCurrentSegmentCompleted ? currentSegment.text : '')
            }
            diffResult={diffResult}
            showAnswer={showAnswer}
            onAnswerChange={onDictationAnswerChange}
            onEnterPress={handleCheck}
          />
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút Kiểm tra (Enter) */}
          <button
            type="button"
            onClick={handleCheck}
            className="h-10 px-5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-brand/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Kiểm Tra (Enter)</span>
          </button>

          {/* Nút Gợi ý (H) */}
          <button
            type="button"
            onClick={onToggleHint}
            className={`h-10 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showHint
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                : 'bg-base border-border text-text-secondary hover:text-text-primary'
            }`}
            title="Xem gợi ý ký tự (Phím H)"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Gợi ý</span>
          </button>

          {/* Xem Đáp án Toggle */}
          <button
            type="button"
            onClick={onToggleAnswer}
            className="h-10 px-3.5 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
          </button>
        </div>

        {/* Nút Mở rộng: Lưu Flashcard & Nối âm & Shadowing & Câu tiếp theo */}
        <div className="flex items-center gap-2">
          {/* Nút Thêm vào Flashcard SRS */}
          <button
            type="button"
            onClick={() => handleOpenSaveModal()}
            className="h-10 px-3 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-brand text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Lưu từ vựng trong câu vào bộ thẻ Flashcard FSRS"
          >
            <BookmarkPlus className="w-4 h-4 text-brand" />
            <span className="hidden sm:inline">Lưu Flashcard</span>
          </button>

          {/* Mẹo nối âm AI */}
          <button
            type="button"
            onClick={() => setIsConnectedSpeechOpen(true)}
            className="h-10 px-3 rounded-xl bg-base hover:bg-surface-hover border border-border text-brand text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xem giải thích hiện tượng nối âm AI"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Mẹo Nối Âm AI</span>
          </button>

          {/* Shadowing Mic */}
          <button
            type="button"
            onClick={() => setIsShadowingOpen(true)}
            className="h-10 px-3 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Luyện nhại giọng theo câu"
          >
            <Mic className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Shadowing</span>
          </button>

          {/* Câu kế tiếp */}
          <button
            type="button"
            onClick={onNextSegment}
            className="h-10 px-4 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Câu sau</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Save to Flashcard Modal */}
      <SaveToFlashcardModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        defaultWord={vocabWordToSave}
        sentence={currentSegment.text}
        vietnameseTranslation={currentSegment.vietnameseTranslation}
        podcastTitle={podcastTitle}
      />

      {/* Connected Speech Modal */}
      <ConnectedSpeechModal
        isOpen={isConnectedSpeechOpen}
        onClose={() => setIsConnectedSpeechOpen(false)}
        sentence={currentSegment.text}
      />

      {/* Shadowing Modal */}
      <ShadowingModal
        isOpen={isShadowingOpen}
        onClose={() => setIsShadowingOpen(false)}
        sentence={currentSegment.text}
      />
    </div>
  );
}
