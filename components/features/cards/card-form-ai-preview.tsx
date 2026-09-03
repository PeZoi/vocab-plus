'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAiAnalyzer } from '@/hooks/features/ai/use-ai-analyzer';
import { useCreateCardMutation } from '@/hooks/features/cards/use-card-mutation';
import type { AIWordAnalysisResponse, SenseItem, PartOfSpeech } from '@/types/card.types';

export function CardFormAiPreview({ onSuccess }: { onSuccess?: () => void }) {
  const [wordInput, setWordInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AIWordAnalysisResponse | null>(null);
  const [selectedSenses, setSelectedSenses] = useState<Record<number, boolean>>({});
  const [editedSenses, setEditedSenses] = useState<SenseItem[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const aiAnalyzer = useAiAnalyzer();
  const createCardMutation = useCreateCardMutation();

  const handleAnalyze = async () => {
    if (!wordInput.trim()) return;

    try {
      const result = await aiAnalyzer.mutateAsync({
        word: wordInput.trim(),
        context_sentence: contextInput.trim() || undefined,
      });

      setAnalysisResult(result);
      setEditedSenses(result.senses);

      if (result.is_corrected && result.word) {
        setWordInput(result.word);
      }

      // Mặc định chọn nghĩa đầu tiên
      const initialSelection: Record<number, boolean> = {};
      result.senses.forEach((_, idx) => {
        initialSelection[idx] = idx === 0;
      });
      setSelectedSenses(initialSelection);
    } catch (err) {
      console.error('Lỗi phân tích AI:', err);
    }
  };

  const toggleSense = (index: number) => {
    setSelectedSenses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const updateSenseField = (index: number, field: keyof SenseItem, value: string) => {
    setEditedSenses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveSelected = async () => {
    if (!analysisResult) return;

    const indicesToSave = Object.keys(selectedSenses)
      .map(Number)
      .filter((idx) => selectedSenses[idx]);

    if (indicesToSave.length === 0) {
      alert('Vui lòng chọn ít nhất một nghĩa để lưu');
      return;
    }

    try {
      for (const idx of indicesToSave) {
        const sense = editedSenses[idx];
        await createCardMutation.mutateAsync({
          word: analysisResult.word,
          ipa: analysisResult.ipa || null,
          definition: sense.definition,
          example_sentence: sense.example_sentence || null,
          part_of_speech: (sense.part_of_speech as PartOfSpeech) || null,
          card_type: analysisResult.card_type || 'word',
          source_type: 'ai_generated',
          sense_number: idx + 1,
          mnemonic: analysisResult.mnemonic || null,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setAnalysisResult(null);
        setWordInput('');
        setContextInput('');
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Lỗi lưu thẻ từ AI:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Analyze Input Box */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface/80 border border-border/70 space-y-3.5 shadow-xs">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Nhập từ hoặc cụm từ cần phân tích <span className="text-danger">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="vd: process, ubiquitous, break down..."
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              className="text-sm font-medium"
            />
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={aiAnalyzer.isPending || !wordInput.trim()}
              className="shrink-0 gap-1.5"
              size="default"
            >
              {aiAnalyzer.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang phân tích...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Phân tích bằng AI</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Ngữ cảnh trong câu (Tùy chọn — giúp AI ưu tiên nghĩa phù hợp nhất)
          </label>
          <Input
            placeholder="vd: The process of making bread takes time."
            value={contextInput}
            onChange={(e) => setContextInput(e.target.value)}
            className="text-xs"
          />
        </div>

        {aiAnalyzer.error && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiAnalyzer.error.message}</span>
          </div>
        )}
      </div>

      {/* Analysis Preview Card with Motion */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="p-4 sm:p-5 rounded-xl bg-surface/90 border border-border/80 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-semibold text-text-primary tracking-tight">
                    {analysisResult.word}
                  </h3>
                  {analysisResult.ipa && (
                    <span className="font-mono text-xs text-text-secondary bg-base/60 px-2 py-0.5 rounded-md border border-border/70">
                      {analysisResult.ipa}
                    </span>
                  )}
                  <Badge variant="default" className="text-[10px] py-0 px-1.5">
                    {analysisResult.card_type}
                  </Badge>
                </div>
              </div>
              <p className="text-[11px] text-text-secondary">
                Bạn có thể chỉnh sửa trực tiếp nội dung bên dưới trước khi lưu
              </p>
            </div>

            {/* Spelling Correction Notice */}
            {analysisResult.is_corrected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  AI đã tự động sửa lỗi chính tả từ{' '}
                  <strong className="line-through opacity-75">{analysisResult.original_word}</strong>{' '}
                  thành <strong className="text-amber-200">{analysisResult.word}</strong>
                </span>
              </motion.div>
            )}

          {/* Senses Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Các tầng nghĩa ({editedSenses.length} nghĩa):
              </h4>
              <span className="text-[11px] text-brand font-medium">
                Tick chọn các nghĩa muốn thêm vào bộ thẻ
              </span>
            </div>

            <div className="space-y-2.5">
              {editedSenses.map((sense, idx) => {
                const isSelected = !!selectedSenses[idx];

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-base/70 border-brand/40 shadow-xs'
                        : 'bg-base/30 border-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id={`sense-${idx}`}
                        checked={isSelected}
                        onChange={() => toggleSense(idx)}
                        className="mt-1 w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand accent-brand cursor-pointer"
                      />
                      <div className="flex-1 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            htmlFor={`sense-${idx}`}
                            className="font-medium text-xs text-text-primary cursor-pointer select-none"
                          >
                            Nghĩa #{idx + 1}
                          </label>
                          <Badge variant="secondary" className="text-[9px] py-0 px-1.5">
                            {sense.part_of_speech}
                          </Badge>
                          {sense.vietnamese_hint && (
                            <span className="text-xs text-brand font-medium">
                              ({sense.vietnamese_hint})
                            </span>
                          )}
                        </div>

                        {/* Editable Definition */}
                        <div>
                          <label className="text-[10px] text-text-secondary block mb-0.5">
                            Định nghĩa tiếng Việt:
                          </label>
                          <Input
                            value={sense.definition}
                            onChange={(e) => updateSenseField(idx, 'definition', e.target.value)}
                            disabled={!isSelected}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Editable Example Sentence */}
                        <div>
                          <label className="text-[10px] text-text-secondary block mb-0.5">
                            Câu ví dụ minh họa:
                          </label>
                          <Textarea
                            value={sense.example_sentence}
                            onChange={(e) =>
                              updateSenseField(idx, 'example_sentence', e.target.value)
                            }
                            disabled={!isSelected}
                            rows={2}
                            className="text-xs min-h-[55px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collocations & Word Family */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
            {analysisResult.collocations && analysisResult.collocations.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Cụm từ hay đi kèm (Collocations):
                </p>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.collocations.map((col, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-base border border-border/70 text-text-secondary"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.word_family && analysisResult.word_family.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Gia đình từ (Word Family):
                </p>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.word_family.map((wf, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-base border border-border/70 text-text-secondary"
                    >
                      {wf.form_word}{' '}
                      <span className="text-[9px] text-brand">({wf.part_of_speech})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mnemonic */}
          {analysisResult.mnemonic && (
            <div className="p-3 rounded-lg bg-brand/5 border border-brand/20 text-xs">
              <span className="font-semibold text-brand mr-1">💡 Mẹo liên tưởng:</span>
              <span className="text-text-primary italic">&ldquo;{analysisResult.mnemonic}&rdquo;</span>
            </div>
          )}

          {/* Action button */}
          {saveSuccess ? (
            <div className="p-2.5 rounded-lg bg-success/15 border border-success/30 text-success text-center text-xs font-medium">
              ✓ Đã lưu thành công vào bộ thẻ của bạn!
            </div>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleSaveSelected}
              disabled={createCardMutation.isPending}
              className="w-full gap-1.5"
            >
              {createCardMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu các nghĩa đã chọn...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Lưu các nghĩa đã chọn vào bộ thẻ</span>
                </>
              )}
            </Button>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
