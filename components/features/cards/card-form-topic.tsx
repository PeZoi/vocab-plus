'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RotateCcw,
  Check,
  CheckSquare,
  Square,
  BookmarkPlus,
  Compass,
  AlertCircle,
  BookOpen,
  Lightbulb,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DualAudioButtons } from '@/components/common/dual-audio-buttons';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { useTopicWordsGenerator } from '@/hooks/features/ai/use-topic-words';
import type { CEFRLevel } from '@/types/card.types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

const CEFR_LEVELS: readonly CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function CardFormTopic({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();

  const {
    topicInput,
    setTopicInput,
    descriptionInput,
    setDescriptionInput,
    selectedCefrLevels,
    toggleCefrLevel,
    clearCefrLevels,
    wordCount,
    setWordCount,
    generatedData,
    selectedWordIndexes,
    isGenerating,
    isSaving,
    selectedCount,
    totalCount,
    isAllSelected,
    handleGenerate,
    toggleSelect,
    toggleSelectAll,
    handleSaveSelected,
    handleReset,
  } = useTopicWordsGenerator(() => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(ROUTES.APP.DASHBOARD);
    }
  });

  return (
    <div className="space-y-6">
      {/* 1. Màn hình nhập chủ đề (Input State) */}
      {!generatedData ? (
        <div className="p-5 sm:p-6 rounded-xl bg-surface/80 border border-border/70 shadow-xs space-y-5">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Compass className="w-4 h-4 text-brand" />
              <span>Nhập chủ đề hoặc ngữ cảnh bạn muốn học</span>
            </div>
            <p className="text-xs text-text-secondary">
              AI sẽ chọn lọc 10–15 từ vựng tiêu biểu, đồng bộ với định dạng phân tích chuyên sâu (phiên âm IPA, nghĩa, câu ví dụ, collocations, mẹo nhớ).
            </p>
          </div>

          {/* Form inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-primary block mb-1.5">
                Chủ đề từ vựng <span className="text-brand">*</span>
              </label>
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="vd: Artificial Intelligence, Job Interview, Environmental Protection..."
                disabled={isGenerating}
                className="bg-base/60 border-border/80 focus:border-brand text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && topicInput.trim()) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-primary block mb-1.5">
                Mô tả chi tiết ngữ cảnh <span className="text-text-secondary text-[11px]">(Tùy chọn)</span>
              </label>
              <Textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                placeholder="vd: Nhấn mạnh các thuật ngữ kỹ thuật, các cụm từ giải thích giải thuật hoặc thảo luận chuyên sâu trong bài thi IELTS..."
                disabled={isGenerating}
                rows={2}
                className="bg-base/60 border-border/80 focus:border-brand text-xs sm:text-sm resize-none"
              />
            </div>

            {/* Số lượng từ & Multi-select Trình độ CEFR */}
            <div className="space-y-3 pt-1">
              <div className="w-full sm:w-1/2">
                <label className="text-xs font-medium text-text-primary block mb-1.5">
                  Số lượng từ vựng
                </label>
                <Select
                  value={String(wordCount)}
                  onValueChange={(v) => setWordCount(Number(v))}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="bg-base/60 border-border/80 text-xs sm:text-sm">
                    <SelectValue placeholder="Số lượng từ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 từ vựng</SelectItem>
                    <SelectItem value="12">12 từ vựng (Khuyến nghị)</SelectItem>
                    <SelectItem value="15">15 từ vựng</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Multi-select CEFR Chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text-primary">
                    Trình độ CEFR mục tiêu{' '}
                    <span className="text-text-secondary text-[11px]">
                      (Có thể chọn nhiều cấp độ)
                    </span>
                  </label>
                  {selectedCefrLevels.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCefrLevels}
                      className="text-[11px] text-brand hover:underline cursor-pointer"
                    >
                      Đặt lại (Tất cả)
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={clearCefrLevels}
                    disabled={isGenerating}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none',
                      selectedCefrLevels.length === 0
                        ? 'bg-brand text-white border-brand shadow-xs'
                        : 'bg-base/60 border-border/70 text-text-secondary hover:text-text-primary hover:border-border'
                    )}
                  >
                    Tất cả trình độ
                  </button>

                  {CEFR_LEVELS.map((lvl) => {
                    const isSelected = selectedCefrLevels.includes(lvl);
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => toggleCefrLevel(lvl)}
                        disabled={isGenerating}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none flex items-center gap-1.5',
                          isSelected
                            ? 'bg-brand/15 border-brand text-brand font-semibold shadow-2xs ring-1 ring-brand/30'
                            : 'bg-base/60 border-border/70 text-text-secondary hover:text-text-primary hover:border-border'
                        )}
                      >
                        <span>{lvl}</span>
                        {isSelected && <Check className="w-3 h-3 text-brand stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="brand"
              onClick={handleGenerate}
              disabled={isGenerating || !topicInput.trim()}
              className="w-full sm:w-auto px-6 py-2.5 gap-2 text-sm font-semibold cursor-pointer shadow-md"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span>AI đang chọn lọc {wordCount} từ vựng...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo danh sách từ vựng bằng AI</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* 2. Màn hình kết quả (Result State: 10–15 từ vựng) */
        <div className="space-y-4">
          {/* Header kết quả */}
          <div className="p-4 rounded-xl bg-surface/90 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand" />
                <h3 className="text-base font-semibold text-text-primary">
                  {generatedData.topic}
                </h3>
                <Badge variant="outline" className="text-[11px] bg-brand/10 text-brand border-brand/20">
                  {totalCount} từ vựng
                </Badge>
              </div>
              {generatedData.description && (
                <p className="text-xs text-text-secondary line-clamp-1">
                  {generatedData.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đổi chủ đề</span>
              </Button>

              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={handleSaveSelected}
                disabled={isSaving || selectedCount === 0}
                className="text-xs gap-1.5 shadow-xs"
              >
                {isSaving ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </motion.div>
                ) : (
                  <BookmarkPlus className="w-3.5 h-3.5" />
                )}
                <span>Lưu {selectedCount} từ vào kho</span>
              </Button>
            </div>
          </div>

          {/* Thanh công cụ chọn nhanh */}
          <div className="flex items-center justify-between px-1 text-xs text-text-secondary">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 hover:text-text-primary cursor-pointer py-1"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-brand" />
              ) : (
                <Square className="w-4 h-4 text-text-secondary" />
              )}
              <span>{isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả các từ'}</span>
            </button>

            <span className="font-medium text-text-primary">
              Đã chọn: <span className="text-brand">{selectedCount}</span> / {totalCount} từ
            </span>
          </div>

          {/* Danh sách các thẻ từ vựng được sinh ra */}
          <div className="space-y-3">
            <AnimatePresence>
              {generatedData.words.map((item, idx) => {
                const isSelected = !!selectedWordIndexes[idx];

                return (
                  <motion.div
                    key={`${item.word}-${idx}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    onClick={() => toggleSelect(idx)}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer relative select-none',
                      isSelected
                        ? 'bg-surface/90 border-brand/50 shadow-xs'
                        : 'bg-surface/40 border-border/60 opacity-60 hover:opacity-100 hover:border-border'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-0.5 shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-md bg-brand text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border border-border/80 bg-base/50" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        {/* Word, Audio, Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base sm:text-lg font-semibold text-text-primary">
                            {item.word}
                          </span>

                          <DualAudioButtons word={item.word} size="xs" />

                          {item.ipa && (
                            <span className="text-xs font-mono text-text-secondary bg-base/60 px-1.5 py-0.5 rounded border border-border/50">
                              /{item.ipa}/
                            </span>
                          )}

                          <Badge variant="outline" className="text-[10px] uppercase font-mono py-0 px-1.5">
                            {item.part_of_speech}
                          </Badge>

                          {item.card_type && item.card_type !== 'word' && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                              {item.card_type === 'phrasal_verb' ? 'Cụm động từ' : 'Thành ngữ'}
                            </Badge>
                          )}

                          {item.cefr_level && (
                            <CEFRBadge level={item.cefr_level} size="sm" />
                          )}

                          {item.is_existing && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 ml-auto">
                              <AlertCircle className="w-3 h-3" />
                              Đã có trong kho
                            </span>
                          )}
                        </div>

                        {/* Definitions & Vietnamese hint */}
                        <div className="space-y-1 text-xs sm:text-sm">
                          <p className="font-medium text-text-primary">
                            {item.definition}
                          </p>
                          {item.definition_en && (
                            <p className="text-xs text-text-secondary italic">
                              {item.definition_en}
                            </p>
                          )}
                          {item.vietnamese_hint && (
                            <p className="text-[11px] text-text-secondary/80">
                              <span className="text-brand font-medium">Gợi ý:</span> {item.vietnamese_hint}
                            </p>
                          )}
                        </div>

                        {/* Example sentence */}
                        {item.example_sentence && (
                          <div className="p-2.5 rounded-lg bg-base/60 border border-border/50 text-xs space-y-1">
                            <p className="text-text-primary font-serif">
                              &ldquo;{item.example_sentence}&rdquo;
                            </p>
                            {item.example_translation && (
                              <p className="text-text-secondary">
                                {item.example_translation}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Mnemonic (Mẹo ghi nhớ) */}
                        {item.mnemonic && (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-start gap-1.5 text-amber-300">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <b className="font-semibold text-amber-400">Mẹo nhớ:</b> {item.mnemonic}
                            </span>
                          </div>
                        )}

                        {/* Collocations */}
                        {item.collocations && item.collocations.length > 0 && (
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-text-secondary">
                              <Layers className="w-3 h-3 text-brand" />
                              <span>Collocations:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.collocations.map((col, cIdx) => (
                                <span
                                  key={`${col.phrase}-${cIdx}`}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-base/60 border border-border/60 text-text-primary"
                                >
                                  <b>{col.phrase}</b>
                                  {col.meaning && (
                                    <span className="text-text-secondary ml-1">({col.meaning})</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border/40"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Bottom sticky action bar */}
          <div className="sticky bottom-4 z-20 p-3 rounded-xl bg-surface/95 backdrop-blur-md border border-border shadow-lg flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-medium text-text-primary">
              Đã chọn: <span className="text-brand font-bold">{selectedCount}</span> từ vựng
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="text-xs"
              >
                Hủy
              </Button>

              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={handleSaveSelected}
                disabled={isSaving || selectedCount === 0}
                className="text-xs sm:text-sm gap-1.5 shadow-md px-4 font-semibold cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.div>
                    <span>Đang lưu vào kho...</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Lưu {selectedCount} từ vào kho từ vựng</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
