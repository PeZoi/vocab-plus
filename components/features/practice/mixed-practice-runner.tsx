'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGradeSentence } from '@/hooks/features/practice/use-grade-sentence';
import { cn } from '@/lib/utils';
import type { CardWithProgress, CollocationItem, UserCard } from '@/types/card.types';
import type { PracticeQuestionItem, SentenceGradeResponse } from '@/types/practice.types';
import type { ReviewRating } from '@/types/review.types';
import { formatIPA } from '@/utils/formatters';
import { playCorrectChime } from '@/utils/sound';
import {
  ArrowRight,
  CheckCircle2,
  CornerDownLeft,
  Eye,
  FileQuestion,
  Lightbulb,
  Loader2,
  PenTool,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import {
  DEFAULT_PRACTICE_XP_RATES,
  DEFAULT_VOCAB_LEVEL_SETTINGS,
  type PracticeXpRates,
  type VocabLevelSettings,
} from '@/types/system-settings.types';
import { reviewService } from '@/services/review.service';
import {
  calculateWordLevel,
  mapQuizResultToFSRS,
} from '@/utils/fsrs-level';
import { getDistractors } from '@/utils/quiz-distractors';
import type { LevelUpItem, WateredCardItem } from '@/types/practice.types';

export type { LevelUpItem, WateredCardItem };

interface MixedPracticeRunnerProps {
  questions: PracticeQuestionItem[];
  allCards: CardWithProgress[];
  collectionTitle?: string;
  onComplete: (stats: {
    total: number;
    correct: number;
    wrongCards: CardWithProgress[];
    xpEarned: number;
    levelUps?: LevelUpItem[];
    wateredCards?: WateredCardItem[];
  }) => void;
  onExit: () => void;
}

interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export function MixedPracticeRunner({
  questions,
  allCards,
  collectionTitle,
  onComplete,
  onExit,
}: MixedPracticeRunnerProps) {
  const { data: systemSettings = [] } = useSystemSettingsQuery();
  const practiceRates = useMemo<PracticeXpRates>(() => {
    const setting = systemSettings.find((s) => s.key === 'practice_xp_rates');
    if (setting?.value && typeof setting.value === 'object') {
      return { ...DEFAULT_PRACTICE_XP_RATES, ...(setting.value as Partial<PracticeXpRates>) };
    }
    return DEFAULT_PRACTICE_XP_RATES;
  }, [systemSettings]);

  const vocabLevelConfig = useMemo<VocabLevelSettings>(() => {
    const setting = systemSettings.find((s) => s.key === 'vocab_level_config');
    if (setting?.value && typeof setting.value === 'object') {
      const val = setting.value as Partial<VocabLevelSettings>;
      if (Array.isArray(val.levels) && val.levels.length > 0) {
        return {
          penaltyRule: val.penaltyRule || DEFAULT_VOCAB_LEVEL_SETTINGS.penaltyRule,
          allowLevelUpInCasualMode: !!val.allowLevelUpInCasualMode,
          levels: val.levels,
        };
      }
    }
    return DEFAULT_VOCAB_LEVEL_SETTINGS;
  }, [systemSettings]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCards, setWrongCards] = useState<CardWithProgress[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [, setLevelUps] = useState<LevelUpItem[]>([]);
  const [, setWateredCards] = useState<WateredCardItem[]>([]);
  const [isNavigatingNext, setIsNavigatingNext] = useState(false);

  // Refs để lưu trữ đồng bộ tức thì, tránh race condition & stale closure khi bấm Xem kết quả ở câu cuối
  const wateredCardsRef = useRef<WateredCardItem[]>([]);
  const levelUpsRef = useRef<LevelUpItem[]>([]);
  const pendingReviewsRef = useRef<Map<string, Promise<unknown>>>(new Map());
  const questionStartTime = useRef<number>(0);

  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentIndex]);

  const currentQuestion = questions[currentIndex];
  const currentCard = currentQuestion?.card;

  if (!currentCard) return null;

  const handleAnswered = async (
    isCorrect: boolean,
    xp: number,
    card: CardWithProgress,
    overrideRating?: ReviewRating
  ) => {
    const now = Date.now();
    const responseMs =
      questionStartTime.current > 0 ? Math.max(500, now - questionStartTime.current) : 1000;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCards((prev) => [...prev, card]);
    }
    setTotalXp((prev) => prev + xp);

    const rating: ReviewRating =
      overrideRating ??
      mapQuizResultToFSRS(isCorrect, responseMs, currentQuestion.exerciseType);

    const oldLevelInfo = calculateWordLevel(card.user_card, vocabLevelConfig);
    const isDue =
      !card.user_card ||
      card.user_card.state === 'new' ||
      !card.user_card.due_at ||
      new Date(card.user_card.due_at).getTime() <= Date.now() + 60 * 1000;

    // Tạo Promise gửi kết quả FSRS và lưu vào pendingReviewsRef để handleNext có thể chờ nếu cần
    const reviewPromise = (async () => {
      try {
        const submitRes = await reviewService.submitReview({
          card_id: card.id,
          rating,
          response_ms: responseMs,
        });

        const wasWatered = Boolean(submitRes?.is_due ?? isDue);

        // Trường hợp 1: Thẻ đến hạn ôn tập FSRS hoặc thẻ mới được tưới nước FSRS
        if (wasWatered) {
          const simulatedUserCard: UserCard = {
            ...(card.user_card || {
              id: 'temp',
              card_id: card.id,
              user_id: '',
              difficulty: 5,
              stability: 1,
              lapse_count: 0,
              review_count: 0,
              is_leech: false,
              created_at: '',
              updated_at: '',
            }),
            state: submitRes?.state || 'learning',
            due_at: submitRes?.due_at || new Date().toISOString(),
            review_count: (card.user_card?.review_count || 0) + 1,
            lapse_count:
              rating === 1
                ? (card.user_card?.lapse_count || 0) + 1
                : card.user_card?.lapse_count || 0,
          };

          const newLevelInfo = calculateWordLevel(simulatedUserCard, vocabLevelConfig);
          const isLevelUp = newLevelInfo.level > oldLevelInfo.level;

          const wateredItem: WateredCardItem = {
            card,
            oldLevel: oldLevelInfo,
            newLevel: newLevelInfo,
            isLevelUp,
          };

          wateredCardsRef.current = [
            ...wateredCardsRef.current.filter((item) => item.card.id !== card.id),
            wateredItem,
          ];
          setWateredCards([...wateredCardsRef.current]);

          if (isLevelUp) {
            const upItem: LevelUpItem = { card, oldLevel: oldLevelInfo, newLevel: newLevelInfo };
            levelUpsRef.current = [
              ...levelUpsRef.current.filter((item) => item.card.id !== card.id),
              upItem,
            ];
            setLevelUps([...levelUpsRef.current]);
          }
        } else {
          // Trường hợp 2: Thẻ chưa đến hạn FSRS (học tự do/tùy chỉnh hoặc đã đánh dấu thuộc)
          // VẪN GHI NHẬN vào danh sách từ vựng đã được luyện tập trong phiên kiểm tra này!
          const wateredItem: WateredCardItem = {
            card,
            oldLevel: oldLevelInfo,
            newLevel: oldLevelInfo,
            isLevelUp: false,
          };

          wateredCardsRef.current = [
            ...wateredCardsRef.current.filter((item) => item.card.id !== card.id),
            wateredItem,
          ];
          setWateredCards([...wateredCardsRef.current]);
        }
      } catch (err) {
        console.error('Lỗi khi gửi kết quả kiểm tra FSRS:', err);
        // Ngay cả khi có lỗi mạng, vẫn ghi nhận thẻ vào wateredCardsRef để người dùng không bị mất kết quả phiên học
        const fallbackItem: WateredCardItem = {
          card,
          oldLevel: oldLevelInfo,
          newLevel: oldLevelInfo,
          isLevelUp: false,
        };
        wateredCardsRef.current = [
          ...wateredCardsRef.current.filter((item) => item.card.id !== card.id),
          fallbackItem,
        ];
        setWateredCards([...wateredCardsRef.current]);
      } finally {
        pendingReviewsRef.current.delete(card.id);
      }
    })();

    pendingReviewsRef.current.set(card.id, reviewPromise);
  };

  const handleNext = async () => {
    if (isNavigatingNext) return;

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsNavigatingNext(true);

      // Nếu còn request submit FSRS đang chạy trên mạng, đợi tất cả hoàn tất
      if (pendingReviewsRef.current.size > 0) {
        try {
          await Promise.all(Array.from(pendingReviewsRef.current.values()));
        } catch (err) {
          console.error('Lỗi khi chờ hoàn tất các câu submit FSRS:', err);
        }
      }

      // Nếu đúng 100% tất cả các câu, cộng thêm điểm thưởng hoàn hảo (perfect_bonus)
      const isPerfect = correctCount === questions.length;
      const finalTotalXp = totalXp + (isPerfect ? practiceRates.perfect_bonus : 0);

      onComplete({
        total: questions.length,
        correct: correctCount,
        wrongCards,
        xpEarned: finalTotalXp,
        levelUps: levelUpsRef.current,
        wateredCards: wateredCardsRef.current,
      });
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex + 1 === questions.length;

  const getModeBadge = () => {
    switch (currentQuestion.exerciseType) {
      case 'multiple_choice':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Trắc nghiệm 4 lựa chọn</span>
          </span>
        );
      case 'cloze':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <PenTool className="w-3.5 h-3.5" />
            <span>Điền khuyết ngữ cảnh</span>
          </span>
        );
      case 'sentence_writing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đặt câu & AI chấm điểm</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {getModeBadge()}
          <span className="text-xs text-text-secondary font-medium">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          {collectionTitle && (
            <span className="text-xs text-text-secondary/70 truncate max-w-[150px]">
              • {collectionTitle}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="text-xs text-text-secondary hover:text-danger h-8"
        >
          Thoát
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border/40">
        <motion.div
          className="h-full bg-gradient-to-r from-brand via-purple-500 to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Single Question Container keyed by question ID */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          {currentQuestion.exerciseType === 'multiple_choice' && (
            <MultipleChoiceQuestionCard
              card={currentCard}
              allCards={allCards}
              isLast={isLastQuestion}
              rates={practiceRates}
              onAnswered={(isCorrect, xp) => handleAnswered(isCorrect, xp, currentCard)}
              onNext={handleNext}
              isSubmitting={isNavigatingNext}
            />
          )}

          {currentQuestion.exerciseType === 'cloze' && (
            <ClozeQuestionCard
              card={currentCard}
              isLast={isLastQuestion}
              rates={practiceRates}
              onAnswered={(isCorrect, xp) => handleAnswered(isCorrect, xp, currentCard)}
              onNext={handleNext}
              isSubmitting={isNavigatingNext}
            />
          )}

          {currentQuestion.exerciseType === 'sentence_writing' && (
            <SentenceWritingQuestionCard
              card={currentCard}
              isLast={isLastQuestion}
              rates={practiceRates}
              onAnswered={(isCorrect, xp) => handleAnswered(isCorrect, xp, currentCard)}
              onNext={handleNext}
              isSubmitting={isNavigatingNext}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==============================================================================
// 1. SUBCOMPONENT: TRẮC NGHIỆM 4 LỰA CHỌN
// ==============================================================================
function MultipleChoiceQuestionCard({
  card,
  allCards,
  isLast,
  rates,
  onAnswered,
  onNext,
  isSubmitting = false,
}: {
  card: CardWithProgress;
  allCards: CardWithProgress[];
  isLast: boolean;
  rates: PracticeXpRates;
  onAnswered: (isCorrect: boolean, xp: number) => void;
  onNext: () => void;
  isSubmitting?: boolean;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Khởi tạo loại câu hỏi và 4 đáp án một lần duy nhất khi mount
  const [state] = useState(() => {
    const isWordToMeaning = Math.random() > 0.4;
    const promptType: 'word_to_meaning' | 'meaning_to_word' = isWordToMeaning
      ? 'word_to_meaning'
      : 'meaning_to_word';

    // Tạo pool ứng viên từ allCards (loại trừ chính thẻ hiện tại)
    const candidatePool = allCards
      .filter((c) => c.id !== card.id)
      .map((c) => ({
        word: c.word,
        definition: c.definition,
        part_of_speech: c.part_of_speech,
      }));

    // Lấy 3 đáp án nhiễu độc nhất (tự động mượn từ SYSTEM_DISTRACTOR_POOL nếu thiếu)
    const distractorTexts = getDistractors(
      card.word,
      card.definition,
      candidatePool,
      isWordToMeaning ? 'definition' : 'word',
      card.part_of_speech
    );

    const correctOption: ChoiceOption = {
      id: card.id,
      text: isWordToMeaning ? card.definition : card.word,
      isCorrect: true,
    };

    const wrongOptions: ChoiceOption[] = distractorTexts.map((text, idx) => ({
      id: `distractor-${card.id}-${idx}`,
      text,
      isCorrect: false,
    }));

    // Đảm bảo luôn đủ đúng 4 đáp án (1 đúng + 3 nhiễu) được xáo trộn ngẫu nhiên
    const rawOptions = [correctOption, ...wrongOptions];
    const shuffledOptions = [...rawOptions].sort(() => 0.5 - Math.random());

    return {
      promptType,
      options: shuffledOptions,
    };
  });

  const handleSelect = useCallback(
    (option: ChoiceOption) => {
      if (isAnswered) return;
      setSelectedOptionId(option.id);
      setIsAnswered(true);
      if (option.isCorrect) {
        playCorrectChime();
      }
      onAnswered(option.isCorrect, option.isCorrect ? rates.multiple_choice : 0);
    },
    [isAnswered, onAnswered, rates.multiple_choice]
  );

  // Lắng nghe phím số 1..4 để chọn đáp án và phím Enter để tiếp tục
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang tương tác trong input/textarea khác
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (!isAnswered) {
        let pickedIndex = -1;
        if (e.key === '1' || e.code === 'Numpad1') pickedIndex = 0;
        else if (e.key === '2' || e.code === 'Numpad2') pickedIndex = 1;
        else if (e.key === '3' || e.code === 'Numpad3') pickedIndex = 2;
        else if (e.key === '4' || e.code === 'Numpad4') pickedIndex = 3;

        if (pickedIndex >= 0 && pickedIndex < state.options.length) {
          e.preventDefault();
          handleSelect(state.options[pickedIndex]);
        }
      } else {
        if (e.key === 'Enter' && !isSubmitting) {
          e.preventDefault();
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelect, isAnswered, isSubmitting, onNext, state.options]);

  const isCorrect = selectedOptionId === card.id;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 sm:p-7 bg-surface/90 border border-border/80 shadow-md space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {card.cefr_level && <CEFRBadge level={card.cefr_level} size="sm" />}
          {card.part_of_speech && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-base border border-border/70 text-text-secondary">
              {card.part_of_speech}
            </span>
          )}
        </div>

        {state.promptType === 'word_to_meaning' ? (
          <div className="space-y-1.5">
            <span className="text-xs text-text-secondary uppercase tracking-wider block">
              Từ vựng này có nghĩa là gì?
            </span>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                {card.word}
              </h2>
              <AudioButton text={card.word} size="sm" />
            </div>
            {card.ipa && (
              <p className="font-mono text-xs text-text-secondary">{formatIPA(card.ipa)}</p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <span className="text-xs text-text-secondary uppercase tracking-wider block">
              Chọn từ tiếng Anh có nghĩa:
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-brand leading-snug">
              &ldquo;{card.definition}&rdquo;
            </h2>
          </div>
        )}
      </div>

      {/* 4 Lựa chọn đánh số 1, 2, 3, 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {state.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const numberLabel = `${idx + 1}`;

          let optionStyle =
            'bg-surface/70 border-border/80 hover:bg-surface hover:border-brand/50 text-text-primary';

          if (isAnswered) {
            if (option.isCorrect) {
              optionStyle = 'bg-success/15 border-success text-success font-semibold';
            } else if (isSelected && !option.isCorrect) {
              optionStyle = 'bg-danger/15 border-danger text-danger font-semibold';
            } else {
              optionStyle = 'bg-surface/40 border-border/40 text-text-secondary/60 opacity-60';
            }
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelect(option)}
              className={cn(
                'p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 select-none relative group',
                optionStyle
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border transition-transform group-hover:scale-105',
                  isAnswered && option.isCorrect
                    ? 'bg-success text-white border-success'
                    : isAnswered && isSelected && !option.isCorrect
                    ? 'bg-danger text-white border-danger'
                    : 'bg-base/70 text-text-secondary border-border/70 group-hover:border-brand/50 group-hover:text-brand'
                )}
              >
                {numberLabel}
              </div>
              <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
                {option.text}
              </span>
              {isAnswered && option.isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              )}
              {isAnswered && isSelected && !option.isCorrect && (
                <XCircle className="w-4 h-4 text-danger shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Gợi ý phím tắt khi chưa trả lời */}
      {!isAnswered && (
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-secondary/70">
          <span>Bấm phím</span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border/70 font-mono text-[10px] text-text-primary">1</span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border/70 font-mono text-[10px] text-text-primary">2</span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border/70 font-mono text-[10px] text-text-primary">3</span>
          <span className="px-1.5 py-0.5 rounded bg-surface border border-border/70 font-mono text-[10px] text-text-primary">4</span>
          <span>để chọn nhanh đáp án</span>
        </div>
      )}

      {/* Bottom Action Bar */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-surface/95 border border-border/80 gap-3"
        >
          <div className="text-left text-xs">
            {isCorrect ? (
              <span className="text-success font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Chính xác! +{rates.multiple_choice} XP
              </span>
            ) : (
              <span className="text-danger font-semibold">
                Đáp án đúng:{' '}
                <strong className="text-success">
                  {state.promptType === 'word_to_meaning' ? card.definition : card.word}
                </strong>
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={onNext}
            disabled={isSubmitting}
            className="gap-2 text-xs sm:text-sm font-bold shrink-0 shadow-md shadow-brand/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tổng kết...</span>
              </>
            ) : (
              <>
                <span>{isLast ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono flex items-center gap-0.5">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                  Enter
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ==============================================================================
// 2. SUBCOMPONENT: ĐIỀN KHUYẾT (CLOZE DELETION)
// ==============================================================================
function ClozeQuestionCard({
  card,
  isLast,
  rates,
  onAnswered,
  onNext,
  isSubmitting = false,
}: {
  card: CardWithProgress;
  isLast: boolean;
  rates: PracticeXpRates;
  onAnswered: (isCorrect: boolean, xp: number) => void;
  onNext: () => void;
  isSubmitting?: boolean;
}) {
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanWord = card.word.trim();
  const sentence = card.example_sentence || `She uses the word ${card.word} in context.`;
  const regex = new RegExp(`\\b${cleanWord}\\b`, 'gi');
  const hasMatch = regex.test(sentence);
  const parts = hasMatch
    ? sentence.split(regex)
    : [sentence.slice(0, 20) + ' ', ' ' + sentence.slice(20)];

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Lắng nghe phím Enter để chuyển sang câu tiếp theo khi đã có kết quả
  useEffect(() => {
    if (!isAnswered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isSubmitting, onNext]);

  const isCorrect = inputVal.trim().toLowerCase() === cleanWord.toLowerCase();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswered || !inputVal.trim()) return;
    setIsAnswered(true);
    if (isCorrect) {
      playCorrectChime();
    }
    onAnswered(isCorrect, isCorrect ? rates.cloze : 0);
  };

  const handleGiveUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    onAnswered(false, 0);
  };

  return (
    <div className="rounded-2xl p-6 sm:p-7 bg-surface/90 border border-border/80 shadow-md space-y-5 text-left">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          {card.cefr_level && <CEFRBadge level={card.cefr_level} size="sm" />}
          {card.part_of_speech && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-base border border-border/70 text-text-secondary">
              {card.part_of_speech}
            </span>
          )}
        </div>
        <span className="text-xs text-text-secondary">
          Độ dài: <strong className="text-brand">{cleanWord.length}</strong> chữ cái
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
          Điền từ còn thiếu vào câu:
        </span>
        <div className="p-4 rounded-xl bg-base/60 border border-border/70 text-sm sm:text-base leading-relaxed text-text-primary">
          {parts[0]}
          <span
            className={cn(
              'px-2 py-0.5 mx-1 rounded-md font-bold transition-colors inline-block border',
              isAnswered
                ? isCorrect
                  ? 'bg-success/20 text-success border-success'
                  : 'bg-danger/20 text-danger border-danger line-through'
                : 'bg-brand/15 text-brand border-brand/40 border-dashed'
            )}
          >
            {isAnswered ? cleanWord : `[ ${cleanWord[0]}___ (${cleanWord.length}) ]`}
          </span>
          {parts[1] || ''}
        </div>

        {card.example_translation && (
          <p className="text-xs text-text-secondary italic">
            💡 Dịch: &ldquo;{card.example_translation}&rdquo;
          </p>
        )}
      </div>

      <div className="p-3 rounded-xl bg-surface/60 border border-border/60 flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-text-secondary">Nghĩa tiếng Việt: </span>
          <strong className="text-text-primary">{card.definition}</strong>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowHint((p) => !p)}
          className="h-7 text-xs gap-1 text-text-secondary hover:text-brand"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>{showHint ? 'Ẩn' : 'Gợi ý'}</span>
        </Button>
      </div>

      {showHint && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
          • Chữ cái bắt đầu: <strong>{cleanWord[0]?.toUpperCase()}</strong> ({cleanWord.length} chữ)
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            autoFocus
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isAnswered}
            placeholder={`Gõ từ tiếng Anh (${cleanWord.length} ký tự)...`}
            className={cn(
              'text-sm font-semibold h-11',
              isAnswered
                ? isCorrect
                  ? 'border-success bg-success/10 text-success'
                  : 'border-danger bg-danger/10 text-danger'
                : 'focus:border-brand'
            )}
            spellCheck={false}
            autoComplete="off"
          />
          {!isAnswered ? (
            <Button
              type="submit"
              variant="primary"
              disabled={!inputVal.trim()}
              className="h-11 px-5 font-bold shrink-0 shadow-md shadow-brand/20 gap-1.5"
            >
              <span>Kiểm tra</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-white/20 text-white font-mono">↵</span>
            </Button>
          ) : (
            <div className="shrink-0 flex items-center">
              <AudioButton text={cleanWord} size="md" />
            </div>
          )}
        </div>

        {!isAnswered && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGiveUp}
              className="text-xs text-text-secondary hover:text-brand flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem đáp án</span>
            </button>
          </div>
        )}
      </form>

      {/* Bottom Action Bar */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-3 border-t border-border/60 gap-3"
        >
          <div className="text-left text-xs">
            {isCorrect ? (
              <span className="text-success font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Chính xác! +{rates.cloze} XP
              </span>
            ) : (
              <span className="text-danger font-semibold">
                Đáp án đúng: <strong className="text-success">{cleanWord}</strong>
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={onNext}
            disabled={isSubmitting}
            className="gap-2 text-xs sm:text-sm font-bold shrink-0 shadow-md shadow-brand/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tổng kết...</span>
              </>
            ) : (
              <>
                <span>{isLast ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono flex items-center gap-0.5">
                  <CornerDownLeft className="w-2.5 h-2.5" />
                  Enter
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ==============================================================================
// 3. SUBCOMPONENT: ĐẶT CÂU & AI CHẤM ĐIỂM
// ==============================================================================
function SentenceWritingQuestionCard({
  card,
  isLast,
  rates,
  onAnswered,
  onNext,
  isSubmitting = false,
}: {
  card: CardWithProgress;
  isLast: boolean;
  rates: PracticeXpRates;
  onAnswered: (isCorrect: boolean, xp: number) => void;
  onNext: () => void;
  isSubmitting?: boolean;
}) {
  const [userSentence, setUserSentence] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [gradeResult, setGradeResult] = useState<SentenceGradeResponse | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const gradeMutation = useGradeSentence();
  const collocations = (card.collocations as unknown as CollocationItem[]) || [];

  // Tự động focus vào Textarea khi câu hỏi xuất hiện
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Lắng nghe phím Enter để chuyển sang câu tiếp theo khi đã có kết quả chấm điểm
  useEffect(() => {
    if (!isAnswered) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSubmitting) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isSubmitting, onNext]);

  const handleGrade = async () => {
    if (!userSentence.trim() || gradeMutation.isPending) return;
    setGradeError(null);

    try {
      const res = await gradeMutation.mutateAsync({
        word: card.word,
        user_sentence: userSentence.trim(),
        target_meaning: card.definition,
      });

      setGradeResult(res);
      setIsAnswered(true);
      const isPassed = res.score >= 70;
      if (isPassed) {
        playCorrectChime();
      }
      const awardedXp = Math.round((res.score / 100) * rates.sentence_writing);
      onAnswered(isPassed, awardedXp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi khi gọi AI chấm điểm.';
      setGradeError(msg);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-6 bg-surface/90 border border-border/80 shadow-md space-y-3.5 text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {card.cefr_level && <CEFRBadge level={card.cefr_level} size="sm" />}
            {card.part_of_speech && (
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-base border border-border/70 text-text-secondary">
                {card.part_of_speech}
              </span>
            )}
          </div>
          <span className="text-xs text-text-secondary">Tự viết câu với từ này</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">{card.word}</h2>
              <AudioButton text={card.word} size="sm" />
            </div>
            {card.ipa && (
              <p className="font-mono text-xs text-text-secondary">{formatIPA(card.ipa)}</p>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs text-text-secondary block">Nghĩa:</span>
            <span className="text-sm font-bold text-brand">{card.definition}</span>
          </div>
        </div>

        {Array.isArray(collocations) && collocations.length > 0 && (
          <div className="pt-2 border-t border-border/50 text-xs flex flex-wrap gap-1.5">
            {collocations.slice(0, 3).map((col, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-base/80 border border-border/60 text-[11px] text-text-primary"
              >
                {typeof col === 'string' ? col : col.phrase}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        <Textarea
          ref={textareaRef}
          autoFocus
          value={userSentence}
          onChange={(e) => setUserSentence(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleGrade();
            }
          }}
          placeholder={`Viết một câu tiếng Anh hoàn chỉnh sử dụng từ "${card.word}"... (Nhấn Ctrl + Enter để chấm nhanh)`}
          rows={3}
          disabled={gradeMutation.isPending || isAnswered}
          className="text-sm focus:border-brand"
        />

        {gradeError && (
          <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/25 text-xs text-danger">
            {gradeError}
          </div>
        )}

        {!isAnswered && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-secondary/70 hidden sm:inline">
              Mẹo: Nhấn <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">Ctrl + Enter</kbd> để nộp bài
            </span>
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleGrade}
              disabled={!userSentence.trim() || gradeMutation.isPending}
              className="h-10 px-5 text-xs font-bold gap-2 bg-gradient-to-r from-purple-600 to-brand shadow-md shadow-brand/20 ml-auto"
            >
              {gradeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AI đang chấm điểm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Chấm điểm câu này</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {gradeResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-surface border border-border/80 space-y-3 text-left"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm border',
                  gradeResult.score >= 70
                    ? 'bg-success/15 border-success text-success'
                    : 'bg-amber-500/15 border-amber-500 text-amber-400'
                )}
              >
                {gradeResult.score}
              </div>
              <span className="text-xs font-bold text-text-primary">
                {gradeResult.score >= 80
                  ? 'Xuất sắc!'
                  : gradeResult.score >= 60
                  ? 'Khá tốt!'
                  : 'Cần cải thiện'}
              </span>
            </div>
            <span className="text-xs font-bold text-brand">
              +{Math.round((gradeResult.score / 100) * rates.sentence_writing)} XP
            </span>
          </div>

          <p className="text-xs text-text-primary leading-relaxed">{gradeResult.feedback_vi}</p>

          {gradeResult.improved_sentence && (
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-purple-300 uppercase">
                  Gợi ý tự nhiên hơn:
                </span>
                <AudioButton text={gradeResult.improved_sentence} size="sm" />
              </div>
              <p className="text-purple-100 italic">
                &ldquo;{gradeResult.improved_sentence}&rdquo;
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={onNext}
              disabled={isSubmitting}
              className="gap-2 text-xs sm:text-sm font-bold shadow-md shadow-brand/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tổng kết...</span>
                </>
              ) : (
                <>
                  <span>{isLast ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono flex items-center gap-0.5">
                    <CornerDownLeft className="w-2.5 h-2.5" />
                    Enter
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
