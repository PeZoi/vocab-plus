'use client';

import React, { useState } from 'react';
import { Sparkles, Layers, X, Wand2, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VocabPickerModal } from './vocab-picker-modal';
import { useAiStory } from '@/hooks/features/ai/use-ai-story';
import type { CEFRLevel } from '@/types/card.types';

interface AiStoryGeneratorProps {
  onStoryGenerated: (story: { title: string; text: string }) => void;
}

const CEFR_LEVELS: Array<{ value: CEFRLevel; label: string; desc: string }> = [
  { value: 'A1', label: 'A1 - Beginner', desc: 'Cực kỳ đơn giản, thì hiện tại cơ bản' },
  { value: 'A2', label: 'A2 - Elementary', desc: 'Giao tiếp hàng ngày, câu ngắn' },
  { value: 'B1', label: 'B1 - Intermediate', desc: 'Đầy đủ ngữ pháp thông dụng, đa dạng' },
  { value: 'B2', label: 'B2 - Upper Intermediate', desc: 'Từ vựng học thuật, cấu trúc phức' },
  { value: 'C1', label: 'C1 - Advanced', desc: 'Văn phong tự nhiên, sắc thái tinh tế' },
  { value: 'C2', label: 'C2 - Mastery', desc: 'Mức độ người bản xứ, văn chương điêu luyện' },
];

const GENRES = [
  { id: 'Daily Life', label: '☕ Đời thường (Daily Life)' },
  { id: 'Mystery', label: '🕵️ Trinh thám / Bí ẩn (Mystery)' },
  { id: 'Sci-Fi', label: '🚀 Viễn tưởng (Sci-Fi)' },
  { id: 'Adventure', label: '🏔️ Phiêu lưu (Adventure)' },
  { id: 'Business', label: '💼 Công sở & Kinh doanh (Business)' },
  { id: 'Technology', label: '💻 Công nghệ & AI (Technology)' },
  { id: 'Humor', label: '😄 Hài hước (Humor)' },
  { id: 'Romance', label: '🌹 Tình cảm (Romance)' },
];

const LOADING_STEPS = [
  'Đang phác thảo cốt truyện phù hợp trình độ...',
  'Đang kết hợp các từ vựng mục tiêu của bạn...',
  'Đang hoàn thiện các câu văn tự nhiên và cuốn hút...',
  'Sắp xong rồi, đang trau chuốt độ dài 100-250 từ...',
];

export function AiStoryGenerator({ onStoryGenerated }: AiStoryGeneratorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [level, setLevel] = useState<CEFRLevel>('B1');
  const [genre, setGenre] = useState('Daily Life');
  const [topic, setTopic] = useState('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { mutate: generateStory, isPending } = useAiStory();

  // Cycling loading step messages
  React.useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPending]);

  const handleRemoveWord = (word: string) => {
    setSelectedWords((prev) => prev.filter((w) => w !== word));
  };

  const handleGenerate = () => {
    setFeedbackMessage(null);
    generateStory(
      {
        level,
        genre,
        topic: topic.trim() || undefined,
        target_words: selectedWords,
      },
      {
        onSuccess: (data) => {
          onStoryGenerated({
            title: data.title,
            text: data.text,
          });
          setFeedbackMessage({
            type: 'success',
            text:
              selectedWords.length > 0
                ? `Đã tạo thành công câu chuyện "${data.title}" kết hợp ${data.used_words?.length || selectedWords.length} từ vựng mục tiêu!`
                : `Đã tạo thành công câu chuyện "${data.title}"!`,
          });
        },
        onError: (err) => {
          setFeedbackMessage({
            type: 'error',
            text: err.message || 'Không thể tạo câu chuyện lúc này. Vui lòng kiểm tra API key trong cấu hình Admin.',
          });
        },
      }
    );
  };

  return (
    <div className="rounded-2xl border border-brand/20 bg-linear-to-b from-brand/5 via-surface to-surface overflow-hidden shadow-xs">
      {/* Header toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/2 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary">
                Tạo Câu Chuyện Bằng AI
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/20 text-brand font-medium border border-brand/30">
                100 - 250 từ
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Tạo bài đọc theo cấp độ CEFR, chủ đề tùy ý và lồng ghép từ vựng trong kho
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Form Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 sm:pt-0 space-y-4 border-t border-border/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Trình độ CEFR mục tiêu *
              </label>
              <Select
                value={level}
                onValueChange={(val) => setLevel(val as CEFRLevel)}
                disabled={isPending}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-base border-border text-text-primary text-sm focus:border-brand">
                  <SelectValue placeholder="Chọn trình độ CEFR" />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_LEVELS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-text-primary">{item.label}</span>
                        <span className="text-xs text-text-secondary hidden sm:inline">({item.desc})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Genre Selector */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                Thể loại truyện *
              </label>
              <Select
                value={genre}
                onValueChange={(val) => setGenre(val)}
                disabled={isPending}
              >
                <SelectTrigger className="w-full h-10 rounded-xl bg-base border-border text-text-primary text-sm focus:border-brand">
                  <SelectValue placeholder="Chọn thể loại truyện" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Chủ đề cụ thể (Tùy chọn)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isPending}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              placeholder="Ví dụ: Một buổi sáng đi lạc ở Tokyo, Thuyết phục khách hàng khó tính, Khám phá hành tinh mới..."
              className="w-full px-4 py-2.5 rounded-xl bg-base border border-border text-text-primary placeholder:text-text-secondary/50 text-sm focus:border-brand transition-colors"
            />
          </div>

          {/* Selected Vocabulary from Deck */}
          <div className="p-3.5 rounded-xl bg-base/60 border border-border/60 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                <Layers className="w-3.5 h-3.5 text-brand" />
                <span>Từ vựng cần lồng ghép ({selectedWords.length}/10 từ)</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPickerOpen(true)}
                disabled={isPending}
                className="h-7 text-xs px-2.5 rounded-lg border-brand/30 hover:border-brand text-brand bg-brand/5 hover:bg-brand/10 transition-colors"
              >
                + Chọn từ trong kho vựng
              </Button>
            </div>

            {selectedWords.length === 0 ? (
              <p className="text-xs text-text-secondary/70 italic">
                Chưa chọn từ nào. AI sẽ tự động chọn lọc các từ vựng tự nhiên phù hợp với trình độ {level}.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-brand/30 text-text-primary text-xs font-medium group"
                  >
                    <span>{word}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(word)}
                      disabled={isPending}
                      className="text-text-secondary hover:text-danger transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedbackMessage.type === 'success'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-danger/10 text-danger border border-danger/20'
              }`}
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Generate Button & Progress */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-text-secondary">
              {isPending ? (
                <div className="flex items-center gap-2 text-brand font-medium animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{LOADING_STEPS[loadingStepIndex]}</span>
                </div>
              ) : (
                <span>Độ dài câu chuyện mặc định: 100 - 250 từ</span>
              )}
            </div>

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isPending}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-medium shadow-md shadow-brand/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang sáng tác...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Tạo câu chuyện AI</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Vocab Picker Modal */}
      <VocabPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedWords={selectedWords}
        onSelectWords={setSelectedWords}
        maxSelect={10}
      />
    </div>
  );
}
