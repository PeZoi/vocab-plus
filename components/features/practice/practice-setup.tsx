'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollectionsQuery } from '@/hooks/features/collections/use-collections';
import { cn } from '@/lib/utils';
import { collectionsService } from '@/services/collections.service';
import type { CardWithProgress } from '@/types/card.types';
import type { Collection } from '@/types/collection.types';
import type {
  PracticeExerciseType,
  PracticeQuestionItem,
  PracticeSourceType,
} from '@/types/practice.types';
import {
  BookOpen,
  CheckCircle2,
  FileQuestion,
  FolderKanban,
  GraduationCap,
  Loader2,
  PenTool,
  Play,
  Shuffle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface PracticeSetupProps {
  cards: CardWithProgress[];
  onStart: (config: {
    sourceType: PracticeSourceType;
    collectionTitle?: string;
    selectedCards: CardWithProgress[];
    questions: PracticeQuestionItem[];
    questionCount: number;
  }) => void;
}

const QUESTION_COUNTS = [5, 10, 15, 20];

export function PracticeSetup({ cards, onStart }: PracticeSetupProps) {
  const [sourceType, setSourceType] = useState<PracticeSourceType>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: collections = [], isLoading: isLoadingCollections } = useCollectionsQuery();

  // Tạo danh sách câu hỏi kết hợp ngẫu nhiên tất cả các hình thức
  const createRandomMixedQuestions = (selectedCards: CardWithProgress[]): PracticeQuestionItem[] => {
    // 3 hình thức bài tập
    const baseModes: PracticeExerciseType[] = ['multiple_choice', 'cloze', 'sentence_writing'];

    // Trộn ngẫu nhiên thứ tự các thẻ trước
    const shuffledCards = [...selectedCards].sort(() => 0.5 - Math.random());

    return shuffledCards.map((card, idx) => {
      const hasExampleSentence =
        !!card.example_sentence && card.example_sentence.trim().length > 0;

      // Xoay vòng và chọn ngẫu nhiên để bài kiểm tra luôn có đủ các hình thức
      let targetMode = baseModes[idx % baseModes.length];

      // Nếu thẻ không có câu ví dụ thì không thể làm điền khuyết (Cloze) -> đổi sang Trắc nghiệm hoặc Đặt câu
      if (targetMode === 'cloze' && !hasExampleSentence) {
        targetMode = Math.random() > 0.5 ? 'multiple_choice' : 'sentence_writing';
      }

      return {
        id: `${card.id}-${idx}`,
        card,
        exerciseType: targetMode,
      };
    });
  };

  const handleStart = async () => {
    setErrorMessage(null);

    let candidateCards: CardWithProgress[] = [];
    let currentCollectionTitle: string | undefined = undefined;

    if (sourceType === 'all') {
      candidateCards = cards;
    } else {
      if (!selectedCollectionId) {
        setErrorMessage('Vui lòng chọn một bộ sưu tập để bắt đầu kiểm tra.');
        return;
      }

      setIsLoadingCollection(true);
      try {
        const colDetail = await collectionsService.getCollectionById(selectedCollectionId);
        currentCollectionTitle = colDetail?.title;
        candidateCards = colDetail?.cards || [];
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải bộ sưu tập.';
        setErrorMessage(msg);
        setIsLoadingCollection(false);
        return;
      }
      setIsLoadingCollection(false);
    }

    if (candidateCards.length === 0) {
      setErrorMessage('Nguồn từ vựng được chọn hiện không có từ nào.');
      return;
    }

    // Trộn ngẫu nhiên và cắt số lượng
    const shuffled = [...candidateCards].sort(() => 0.5 - Math.random());
    const finalCount = Math.min(selectedCount, shuffled.length);
    const pickedCards = shuffled.slice(0, finalCount);

    const mixedQuestions = createRandomMixedQuestions(pickedCards);

    onStart({
      sourceType,
      collectionTitle: currentCollectionTitle,
      selectedCards: pickedCards,
      questions: mixedQuestions,
      questionCount: mixedQuestions.length,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-surface via-surface to-base border border-border/80 shadow-md">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/25">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Phân hệ Ôn tập & Kiểm tra</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Bài Kiểm Tra Tổng Hợp
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg leading-relaxed">
            Hệ thống sẽ lấy ngẫu nhiên từ vựng và tự động kết hợp cả 3 hình thức trong cùng một bài:
            Trắc nghiệm, Điền khuyết, và Tự đặt câu chấm điểm bằng AI.
          </p>
        </div>
      </div>

      {/* Thông tin 3 hình thức ngẫu nhiên trong bài */}
      <div className="p-4 rounded-xl bg-surface/70 border border-border/70 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Shuffle className="w-3.5 h-3.5 text-brand" />
          <span>Các hình thức xuất hiện ngẫu nhiên trong bài kiểm tra:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="p-2.5 rounded-lg bg-base/60 border border-border/60 flex items-center gap-2 text-xs text-text-primary">
            <div className="w-6 h-6 rounded-md bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <FileQuestion className="w-3.5 h-3.5" />
            </div>
            <span>Trắc nghiệm 4 đáp án</span>
          </div>

          <div className="p-2.5 rounded-lg bg-base/60 border border-border/60 flex items-center gap-2 text-xs text-text-primary">
            <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <PenTool className="w-3.5 h-3.5" />
            </div>
            <span>Điền khuyết ngữ cảnh</span>
          </div>

          <div className="p-2.5 rounded-lg bg-base/60 border border-border/60 flex items-center gap-2 text-xs text-text-primary">
            <div className="w-6 h-6 rounded-md bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Đặt câu & AI chấm điểm</span>
          </div>
        </div>
      </div>

      {/* Cấu hình: Nguồn từ vựng & Số lượng câu hỏi */}
      <div className="p-5 sm:p-6 rounded-xl bg-surface/80 border border-border/70 space-y-6">
        {/* 1. NGUỒN TỪ VỰNG */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand" />
            <span>1. Chọn nguồn từ vựng kiểm tra:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lựa chọn A: Tất cả từ trong kho */}
            <div
              onClick={() => {
                setSourceType('all');
                setErrorMessage(null);
              }}
              className={cn(
                'p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none',
                sourceType === 'all'
                  ? 'bg-surface border-brand ring-1 ring-brand/50 shadow-sm shadow-brand/10'
                  : 'bg-surface/50 border-border/70 hover:border-border hover:bg-surface/80'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-brand/15 text-brand flex items-center justify-center border border-brand/20">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  {sourceType === 'all' && (
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Tất cả từ trong kho</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Lấy ngẫu nhiên từ toàn bộ kho từ vựng cá nhân của bạn.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-border/40 text-xs text-text-secondary">
                Hiện có: <strong className="text-brand font-bold">{cards.length}</strong> từ vựng
              </div>
            </div>

            {/* Lựa chọn B: Chọn 1 bộ sưu tập */}
            <div
              onClick={() => {
                setSourceType('collection');
                setErrorMessage(null);
              }}
              className={cn(
                'p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between select-none',
                sourceType === 'collection'
                  ? 'bg-surface border-brand ring-1 ring-brand/50 shadow-sm shadow-brand/10'
                  : 'bg-surface/50 border-border/70 hover:border-border hover:bg-surface/80'
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  {sourceType === 'collection' && (
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Chọn 1 bộ sưu tập</h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Kiểm tra tập trung các từ thuộc một chủ đề hoặc bộ từ cụ thể.
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-border/40 text-xs text-text-secondary">
                {collections.length} bộ sưu tập khả dụng
              </div>
            </div>
          </div>

          {/* Dropdown chọn Bộ sưu tập khi sourceType === 'collection' */}
          {sourceType === 'collection' && (
            <div className="p-3.5 rounded-xl bg-base/50 border border-border/70 space-y-2 animate-in fade-in-50 duration-200">
              <label className="text-xs font-medium text-text-secondary block">
                Chọn bộ sưu tập để ôn tập:
              </label>

              {isLoadingCollections ? (
                <div className="flex items-center gap-2 text-xs text-text-secondary py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                  <span>Đang tải danh sách bộ sưu tập...</span>
                </div>
              ) : collections.length === 0 ? (
                <p className="text-xs text-amber-400 py-1">
                  Bạn chưa có bộ sưu tập nào. Hãy tạo bộ sưu tập hoặc chọn &ldquo;Tất cả từ trong kho&rdquo;.
                </p>
              ) : (
                <Select
                  value={selectedCollectionId}
                  onValueChange={(val) => {
                    setSelectedCollectionId(val);
                    setErrorMessage(null);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9 bg-surface">
                    <SelectValue placeholder="-- Chọn một bộ sưu tập --" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((col: Collection) => (
                      <SelectItem key={col.id} value={col.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{col.title}</span>
                          <span className="text-[11px] text-text-secondary">
                            ({col.card_count || 0} từ)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        {/* 2. SỐ LƯỢNG CÂU HỎI */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand" />
            <span>2. Số lượng câu hỏi trong bài:</span>
          </label>

          <div className="flex items-center gap-2 pt-1">
            {QUESTION_COUNTS.map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setSelectedCount(cnt)}
                className={cn(
                  'w-12 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center',
                  selectedCount === cnt
                    ? 'bg-brand text-white border-brand shadow-xs shadow-brand/20'
                    : 'bg-base/60 text-text-secondary border-border/70 hover:text-text-primary hover:bg-surface'
                )}
              >
                {cnt}
              </button>
            ))}
            <span className="text-xs text-text-secondary ml-2">câu hỏi ngẫu nhiên</span>
          </div>
        </div>

        {/* Cảnh báo hoặc báo lỗi */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 text-xs text-danger font-medium">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={handleStart}
        disabled={isLoadingCollection || (sourceType === 'all' && cards.length === 0)}
        className="w-full h-12 text-sm font-bold gap-2 shadow-lg shadow-brand/20"
      >
        {isLoadingCollection ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang chuẩn bị bài kiểm tra...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-white" />
            <span>Bắt đầu bài kiểm tra tổng hợp ({selectedCount} câu)</span>
          </>
        )}
      </Button>
    </div>
  );
}
