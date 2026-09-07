'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAiAnalyzer } from '@/hooks/features/ai/use-ai-analyzer';
import { useCreateCardMutation } from '@/hooks/features/cards/use-card-mutation';
import type { AIWordAnalysisResponse, CardWithProgress, CEFRLevel, CollocationItem, CreateCardDto } from '@/types/card.types';
import { formatIPA } from '@/utils/formatters';
import type { ReaderToken } from '@/utils/text-extractor';
import { AlertCircle, BookmarkPlus, Check, Lightbulb, Loader2, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';

interface WordQuickPopoverProps {
  token: ReaderToken | null;
  contextSentence: string;
  knownCard?: CardWithProgress;
  onClose: () => void;
}

export function WordQuickPopover({
  token,
  contextSentence,
  knownCard,
  onClose,
}: WordQuickPopoverProps) {
  const { mutateAsync: analyzeWord, isPending: isAnalyzing } = useAiAnalyzer();
  const { mutateAsync: createCard, isPending: isSaving } = useCreateCardMutation();

  const [analyzedData, setAnalyzedData] = useState<AIWordAnalysisResponse | null>(null);
  const [justSavedCard, setJustSavedCard] = useState<CardWithProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map analyzed data into a temporary CardWithProgress for display
  const tempCard = React.useMemo(() => {
    if (!analyzedData) return null;
    const primarySense = analyzedData.senses[0] || {};
    return {
      id: 'temp',
      word: analyzedData.word,
      cefr_level: analyzedData.cefr_level,
      ipa: analyzedData.ipa,
      part_of_speech: primarySense?.part_of_speech,
      definition_en: primarySense?.definition_en,
      definition: primarySense?.definition,
      example_sentence: contextSentence || primarySense?.example_sentence,
      example_translation: analyzedData.context_translation || primarySense?.example_translation,
      tags: primarySense?.tags || [],
      mnemonic: analyzedData.mnemonic,
      collocations: analyzedData.collocations as unknown as import('@/types/database.types').Json,
      word_family: analyzedData.word_family as unknown as import('@/types/database.types').Json,
    } as unknown as CardWithProgress;
  }, [analyzedData, contextSentence]);

  if (!token) return null;

  const word = token.clean;
  const isAlreadySaved = Boolean(knownCard) || Boolean(justSavedCard);
  const activeCard = knownCard || justSavedCard || tempCard;
  const collocations = (activeCard?.collocations as unknown as CollocationItem[]) || [];

  const handleSave = async () => {
    if (!analyzedData) return;
    setErrorMsg(null);
    
    try {
      const primarySense = analyzedData.senses[0] || {};
      const tagsSet = new Set<string>();
      
      if (primarySense.tags) {
        primarySense.tags.forEach((t) => tagsSet.add(t.startsWith('#') ? t : `#${t}`));
      }

      const payload: CreateCardDto = {
        word: analyzedData.is_corrected ? analyzedData.word : word,
        ipa: analyzedData.ipa,
        definition: primarySense.definition || primarySense.definition_en || '',
        definition_en: primarySense.definition_en,
        example_sentence: contextSentence || primarySense.example_sentence,
        example_translation: (contextSentence && analyzedData.context_translation) || primarySense.example_translation,
        part_of_speech: primarySense.part_of_speech as import('@/types/card.types').PartOfSpeech,
        card_type: analyzedData.card_type || 'word',
        source_type: 'imported',
        cefr_level: analyzedData.cefr_level,
        tags: Array.from(tagsSet),
        mnemonic: analyzedData.mnemonic,
        collocations: analyzedData.collocations,
        word_family: analyzedData.word_family,
      };

      const newCard = await createCard(payload);
      setJustSavedCard(newCard as CardWithProgress);
    } catch (err: unknown) {
      console.error('Lỗi khi lưu từ vựng:', err);
      const msg = err instanceof Error ? err.message : 'Có lỗi khi lưu từ vựng.';
      setErrorMsg(msg);
    }
  };

  const handleAnalyze = () => {
    if (!token) return;
    setErrorMsg(null);
    analyzeWord({ word: token.clean, context_sentence: contextSentence })
      .then((res) => setAnalyzedData(res))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Có lỗi khi phân tích từ vựng.';
        setErrorMsg(msg);
      });
  };

  // Tách câu ngữ cảnh để làm nổi bật từ mục tiêu
  const renderHighlightedSentence = () => {
    if (!contextSentence) return null;

    const regex = new RegExp(`(\\b${word}\\b)`, 'gi');
    const parts = contextSentence.split(regex);

    return (
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
        {parts.map((part, i) =>
          part.toLowerCase() === word.toLowerCase() ? (
            <span
              key={i}
              className="text-brand font-bold bg-brand/10 px-1 py-0.5 rounded border border-brand/20"
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-surface border border-border/80 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border/60 flex items-start justify-between gap-3 bg-base/40">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary capitalize tracking-tight truncate">
                    {activeCard?.word || word}
                  </h3>
                  <AudioButton text={activeCard?.word || word} className="w-8 h-8 shrink-0" />
                  {activeCard?.cefr_level && (
                    <CEFRBadge level={activeCard.cefr_level as CEFRLevel} />
                  )}
                  {activeCard?.part_of_speech && (
                    <Badge variant="secondary" className="text-[11px] font-semibold py-0.5 px-2">
                      {activeCard.part_of_speech}
                    </Badge>
                  )}
                </div>
                {activeCard?.ipa && (
                  <span className="text-xs font-mono text-text-secondary mt-1 block">
                    {formatIPA(activeCard.ipa)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[65vh] custom-scrollbar">
            {/* Context Sentence */}
            <div className="p-3.5 rounded-xl bg-base border border-border/60 space-y-1.5">
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                Ngữ cảnh trong bài đọc
              </span>
              {renderHighlightedSentence()}

              {activeCard?.example_translation && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-0.5">
                    Dịch nghĩa ngữ cảnh:
                  </span>
                  <p className="text-xs text-text-secondary italic leading-relaxed">
                    {activeCard.example_translation}
                  </p>
                </div>
              )}
            </div>

            {/* Error Notification Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2.5 animate-in fade-in-50 duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-danger">Đã có lỗi xảy ra</p>
                  <p className="text-danger/90 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Definitions & Preview Card Details */}
            {activeCard ? (
              <div className="space-y-3 p-4 rounded-xl bg-surface-hover/40 border border-border/70 animate-in fade-in-50 duration-200">
                {/* Definitions (English-First Bilingual) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-brand uppercase tracking-wider block">
                    Định nghĩa từ vựng
                  </span>
                  {activeCard.definition_en ? (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-bold text-slate-400 bg-base px-1.5 py-0.5 rounded border border-border shrink-0 mt-0.5">
                          EN
                        </span>
                        <p className="text-sm font-semibold text-white leading-relaxed">
                          {activeCard.definition_en}
                        </p>
                      </div>
                      {activeCard.definition && (
                        <div className="flex items-start gap-2 pt-1 border-t border-border/40">
                          <span className="text-[10px] font-bold text-slate-400 bg-base px-1.5 py-0.5 rounded border border-border shrink-0 mt-0.5">
                            VI
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {activeCard.definition}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-white">
                      {activeCard.definition}
                    </p>
                  )}
                </div>

                {/* Mnemonic (Mẹo nhớ) */}
                {activeCard.mnemonic && (
                  <div className="p-3 rounded-lg bg-brand/5 border border-brand/20 flex items-start gap-2.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-brand text-[11px] block">Mẹo nhớ (Mnemonic):</span>
                      <p className="text-text-primary/90 italic text-[11.5px] leading-relaxed">
                        {activeCard.mnemonic}
                      </p>
                    </div>
                  </div>
                )}

                {/* Collocations */}
                {Array.isArray(collocations) && collocations.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                      Cụm từ thông dụng (Collocations):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {collocations.slice(0, 4).map((col, idx) => {
                        const phrase = typeof col === 'string' ? col : col.phrase;
                        const meaning = typeof col === 'object' ? col.meaning : null;
                        return (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-base border border-border/60 text-text-primary"
                          >
                            <strong className="text-brand font-medium">{phrase}</strong>
                            {meaning && <span className="text-text-secondary ml-1">({meaning})</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {activeCard.tags && activeCard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-border/40">
                    {activeCard.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-brand/80 bg-brand/10 px-2 py-0.5 rounded border border-brand/20 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : isAnalyzing ? (
              <div className="text-center py-6 px-3 rounded-xl bg-surface-hover/30 border border-dashed border-border/80 text-xs text-text-secondary space-y-3">
                <Loader2 className="w-6 h-6 text-brand mx-auto animate-spin opacity-80" />
                <p className="font-medium text-text-primary">Đang nhờ AI phân tích từ vựng...</p>
                <p className="text-[11.5px] text-text-secondary max-w-xs mx-auto">
                  AI đang trích xuất định nghĩa, phát âm, và collocations dựa trên ngữ cảnh bài đọc.
                </p>
              </div>
            ) : errorMsg ? (
              <div className="text-center py-5 px-3 rounded-xl bg-danger/5 border border-danger/20 text-xs text-text-secondary space-y-2 flex flex-col items-center">
                <AlertCircle className="w-5 h-5 text-danger mx-auto opacity-90 mb-0.5" />
                <p className="font-medium text-text-primary">Không thể tải dữ liệu phân tích</p>
                <p className="text-[11.5px] text-text-secondary max-w-xs mx-auto leading-relaxed">
                  {errorMsg}
                </p>
                <p className="text-[11px] text-text-secondary">Nhấn nút <strong className="text-brand">Phân tích AI</strong> bên dưới để thử lại.</p>
              </div>
            ) : (
              <div className="text-center py-6 px-3 rounded-xl bg-surface-hover/30 border border-dashed border-border/80 text-xs text-text-secondary space-y-2.5 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="font-medium text-text-primary text-sm">Sẵn sàng phân tích với AI</p>
                <p className="text-[11.5px] text-text-secondary max-w-xs mx-auto leading-relaxed">
                  Nhấn nút <strong className="text-brand font-semibold">Phân tích AI</strong> bên dưới để trích xuất định nghĩa chuẩn ngữ cảnh, phiên âm IPA và ví dụ.
                </p>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-border/60 bg-base/20 flex items-center justify-between gap-3">
            {isAlreadySaved ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Đã lưu vào kho từ vựng (FSRS)</span>
              </div>
            ) : analyzedData ? (
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-medium shadow-md shadow-brand/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Lưu vào kho từ</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-medium shadow-md shadow-brand/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Phân tích AI</span>
                  </>
                )}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-border hover:bg-surface-hover text-text-secondary shrink-0 cursor-pointer"
            >
              Đóng
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

