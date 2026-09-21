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
  Check,
  CheckCircle2,
  FileQuestion,
  Flame,
  FolderKanban,
  GraduationCap,
  Loader2,
  PenTool,
  Play,
  Shuffle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { createRandomMixedQuestions } from '@/utils/practice-generator';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface PracticeSetupProps {
  cards: CardWithProgress[];
  onStart: (config: {
    sourceType: PracticeSourceType;
    collectionTitle?: string;
    selectedCards: CardWithProgress[];
    questions: PracticeQuestionItem[];
    questionCount: number;
    exerciseTypes?: PracticeExerciseType[];
  }) => void;
}

const QUESTION_COUNTS = [5, 10, 15, 20];

const EXERCISE_OPTIONS: {
  type: PracticeExerciseType;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  activeBorder: string;
  activeBadge: string;
}[] = [
  {
    type: 'multiple_choice',
    title: 'Trắc nghiệm',
    subtitle: '4 đáp án',
    desc: 'Luyện phản xạ nhận diện từ & chọn nghĩa đúng / ngược lại',
    icon: FileQuestion,
    iconColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    activeBorder: 'border-blue-500 ring-1 ring-blue-500/40 bg-blue-500/[0.04] dark:bg-blue-500/[0.08]',
    activeBadge: 'bg-blue-500 text-white',
  },
  {
    type: 'cloze',
    title: 'Điền khuyết',
    subtitle: 'Ngữ cảnh',
    desc: 'Gõ từ vựng vào chỗ trống trong câu có gợi ý nghĩa',
    icon: PenTool,
    iconColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    activeBorder: 'border-amber-500 ring-1 ring-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.08]',
    activeBadge: 'bg-amber-500 text-white',
  },
  {
    type: 'sentence_writing',
    title: 'Tự đặt câu',
    subtitle: 'AI chấm điểm',
    desc: 'Tự viết câu thực tế theo ngữ cảnh & nhận AI chấm điểm',
    icon: Sparkles,
    iconColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
    activeBorder: 'border-purple-500 ring-1 ring-purple-500/40 bg-purple-500/[0.04] dark:bg-purple-500/[0.08]',
    activeBadge: 'bg-purple-500 text-white',
  },
];

export function PracticeSetup({ cards, onStart }: PracticeSetupProps) {
  const [sourceType, setSourceType] = useState<PracticeSourceType>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [selectedExerciseTypes, setSelectedExerciseTypes] = useState<PracticeExerciseType[]>([
    'multiple_choice',
    'cloze',
    'sentence_writing',
  ]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mountedTime, setMountedTime] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedTime(Date.now());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const { data: collections = [], isLoading: isLoadingCollections } = useCollectionsQuery();

  // Lọc danh sách thẻ đang đến hạn kiểm tra FSRS
  const dueCards = useMemo(() => {
    if (!mountedTime) return [];
    return cards.filter((c) => {
      if (!c.user_card || c.user_card.state === 'new') return true;
      if (!c.user_card.due_at) return true;
      return new Date(c.user_card.due_at).getTime() <= mountedTime + 60 * 1000;
    });
  }, [cards, mountedTime]);

  const toggleExerciseType = (type: PracticeExerciseType) => {
    if (selectedExerciseTypes.includes(type)) {
      if (selectedExerciseTypes.length <= 1) {
        toast.info('Bạn cần chọn tối thiểu ít nhất 1 hình thức kiểm tra!');
        return;
      }
      setErrorMessage(null);
      setSelectedExerciseTypes(selectedExerciseTypes.filter((t) => t !== type));
    } else {
      setErrorMessage(null);
      setSelectedExerciseTypes([...selectedExerciseTypes, type]);
    }
  };

  const handleSelectAllExerciseTypes = () => {
    setErrorMessage(null);
    setSelectedExerciseTypes(['multiple_choice', 'cloze', 'sentence_writing']);
  };

  const handleStartDueCards = () => {
    setErrorMessage(null);
    if (dueCards.length === 0) return;

    const shuffled = [...dueCards].sort(() => 0.5 - Math.random());
    const pickedCards = shuffled.slice(0, Math.min(20, shuffled.length));
    const mixedQuestions = createRandomMixedQuestions(pickedCards, selectedExerciseTypes);

    onStart({
      sourceType: 'all',
      collectionTitle: 'Từ vựng đến hạn',
      selectedCards: pickedCards,
      questions: mixedQuestions,
      questionCount: mixedQuestions.length,
      exerciseTypes: selectedExerciseTypes,
    });
  };

  const handleStart = async () => {
    setErrorMessage(null);

    if (selectedExerciseTypes.length === 0) {
      setErrorMessage('Vui lòng chọn tối thiểu ít nhất 1 hình thức kiểm tra.');
      return;
    }

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

    const mixedQuestions = createRandomMixedQuestions(pickedCards, selectedExerciseTypes);

    onStart({
      sourceType,
      collectionTitle: currentCollectionTitle,
      selectedCards: pickedCards,
      questions: mixedQuestions,
      questionCount: mixedQuestions.length,
      exerciseTypes: selectedExerciseTypes,
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

      {/* Fast-Track Banner: Ôn tập & kiểm tra ngay các từ đến hạn FSRS */}
      {dueCards.length > 0 ? (
        <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-brand/20 via-surface to-surface border border-brand/40 shadow-lg shadow-brand/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-brand/20 text-brand border border-brand/30">
                <Flame className="w-3.5 h-3.5 text-brand fill-brand animate-pulse" />
                <span>Ưu tiên hàng đầu</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-text-primary">
                Hôm nay có <span className="text-brand font-black">{dueCards.length}</span> từ vựng đến hạn cần kiểm tra
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Làm bài kiểm tra ngay để tính toán độ bền trí nhớ, duy trì chuỗi Streak và thăng cấp Cây Sinh Trưởng.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleStartDueCards}
              className="h-11 px-5 text-xs sm:text-sm font-bold gap-2 shrink-0 shadow-md shadow-brand/30"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Kiểm tra ngay ({Math.min(20, dueCards.length)} từ)</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-success/10 border border-success/25 flex items-center gap-2.5 text-xs text-success">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Tuyệt vời! Hiện tại kho từ vựng của bạn chưa có từ nào quá hạn. Bạn có thể tự do luyện tập kho từ bên dưới.
          </span>
        </div>
      )}

      {/* Cấu hình: Nguồn từ vựng, Hình thức kiểm tra & Số lượng câu hỏi */}
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

        {/* 2. HÌNH THỨC KIỂM TRA (CHỌN 1 HOẶC NHIỀU, TỐI THIỂU 1, MẶC ĐỊNH CẢ 3) */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5 text-brand" />
              <span>2. Chọn hình thức kiểm tra:</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-text-secondary">
                Đã chọn:{' '}
                <span
                  className={cn(
                    'font-bold',
                    selectedExerciseTypes.length === 3 ? 'text-brand' : 'text-text-primary'
                  )}
                >
                  {selectedExerciseTypes.length}/3
                </span>
              </span>
              {selectedExerciseTypes.length < 3 && (
                <button
                  type="button"
                  onClick={handleSelectAllExerciseTypes}
                  className="text-[11px] font-bold text-brand hover:underline cursor-pointer"
                >
                  (Chọn cả 3)
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-text-secondary">
            Bạn có thể chọn 1 hoặc kết hợp nhiều hình thức (tối thiểu 1, mặc định chọn cả 3).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {EXERCISE_OPTIONS.map((opt) => {
              const isSelected = selectedExerciseTypes.includes(opt.type);
              const Icon = opt.icon;
              return (
                <div
                  key={opt.type}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExerciseType(opt.type)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExerciseType(opt.type);
                    }
                  }}
                  className={cn(
                    'relative p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between select-none group',
                    isSelected
                      ? cn('bg-surface shadow-xs', opt.activeBorder)
                      : 'bg-surface/40 border-border/60 opacity-65 hover:opacity-100 hover:border-border hover:bg-surface/70'
                  )}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center border transition-colors',
                          opt.iconColor
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Checkbox indicator */}
                      <div
                        className={cn(
                          'w-5 h-5 rounded-md flex items-center justify-center transition-all text-[11px] font-bold',
                          isSelected
                            ? opt.activeBadge
                            : 'border border-border/80 bg-base/50 text-transparent group-hover:border-text-secondary/50'
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-text-primary">
                          {opt.title}
                        </h4>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-base/80 border border-border/60 text-text-secondary">
                          {opt.subtitle}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SỐ LƯỢNG CÂU HỎI */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand" />
            <span>3. Số lượng câu hỏi trong bài:</span>
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
            <span>
              Bắt đầu bài kiểm tra ({selectedCount} câu •{' '}
              {selectedExerciseTypes.length === 3
                ? 'kết hợp cả 3'
                : `${selectedExerciseTypes.length} hình thức`}
              )
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
