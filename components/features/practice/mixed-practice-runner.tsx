'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGradeSentence } from '@/hooks/features/practice/use-grade-sentence';
import { cn } from '@/lib/utils';
import type { CardWithProgress, CollocationItem } from '@/types/card.types';
import type { PracticeQuestionItem, SentenceGradeResponse } from '@/types/practice.types';
import { formatIPA } from '@/utils/formatters';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  FileQuestion,
  Lightbulb,
  Loader2,
  PenTool,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSystemSettingsQuery } from '@/hooks/features/admin/use-system-settings';
import {
  DEFAULT_PRACTICE_XP_RATES,
  type PracticeXpRates,
} from '@/types/system-settings.types';

interface MixedPracticeRunnerProps {
  questions: PracticeQuestionItem[];
  allCards: CardWithProgress[];
  collectionTitle?: string;
  onComplete: (stats: {
    total: number;
    correct: number;
    wrongCards: CardWithProgress[];
    xpEarned: number;
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCards, setWrongCards] = useState<CardWithProgress[]>([]);
  const [totalXp, setTotalXp] = useState(0);

  const currentQuestion = questions[currentIndex];
  const currentCard = currentQuestion?.card;

  if (!currentCard) return null;

  const handleAnswered = (isCorrect: boolean, xp: number, card: CardWithProgress) => {
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCards((prev) => [...prev, card]);
    }
    setTotalXp((prev) => prev + xp);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Nếu đúng 100% tất cả các câu, cộng thêm điểm thưởng hoàn hảo (perfect_bonus)
      const isPerfect = correctCount === questions.length;
      const finalTotalXp = totalXp + (isPerfect ? practiceRates.perfect_bonus : 0);

      onComplete({
        total: questions.length,
        correct: correctCount,
        wrongCards,
        xpEarned: finalTotalXp,
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
            />
          )}

          {currentQuestion.exerciseType === 'cloze' && (
            <ClozeQuestionCard
              card={currentCard}
              isLast={isLastQuestion}
              rates={practiceRates}
              onAnswered={(isCorrect, xp) => handleAnswered(isCorrect, xp, currentCard)}
              onNext={handleNext}
            />
          )}

          {currentQuestion.exerciseType === 'sentence_writing' && (
            <SentenceWritingQuestionCard
              card={currentCard}
              isLast={isLastQuestion}
              rates={practiceRates}
              onAnswered={(isCorrect, xp) => handleAnswered(isCorrect, xp, currentCard)}
              onNext={handleNext}
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
}: {
  card: CardWithProgress;
  allCards: CardWithProgress[];
  isLast: boolean;
  rates: PracticeXpRates;
  onAnswered: (isCorrect: boolean, xp: number) => void;
  onNext: () => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Khởi tạo loại câu hỏi và 4 đáp án một lần duy nhất khi mount
  const [state] = useState(() => {
    const isWordToMeaning = Math.random() > 0.4;
    const promptType: 'word_to_meaning' | 'meaning_to_word' = isWordToMeaning
      ? 'word_to_meaning'
      : 'meaning_to_word';

    const distractors = allCards
      .filter((c) => c.id !== card.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const correctOption: ChoiceOption = {
      id: card.id,
      text: isWordToMeaning ? card.definition : card.word,
      isCorrect: true,
    };

    const wrongOptions: ChoiceOption[] = distractors.map((c) => ({
      id: c.id,
      text: isWordToMeaning ? c.definition : c.word,
      isCorrect: false,
    }));

    return {
      promptType,
      options: [correctOption, ...wrongOptions].sort(() => 0.5 - Math.random()),
    };
  });

  const handleSelect = (option: ChoiceOption) => {
    if (isAnswered) return;
    setSelectedOptionId(option.id);
    setIsAnswered(true);
    onAnswered(option.isCorrect, option.isCorrect ? rates.multiple_choice : 0);
  };

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

      {/* 4 Lựa chọn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {state.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const letter = String.fromCharCode(65 + idx);

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
                'p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 select-none',
                optionStyle
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border',
                  isAnswered && option.isCorrect
                    ? 'bg-success text-white border-success'
                    : isAnswered && isSelected && !option.isCorrect
                    ? 'bg-danger text-white border-danger'
                    : 'bg-base/70 text-text-secondary border-border/70'
                )}
              >
                {letter}
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
            className="gap-1.5 text-xs sm:text-sm font-bold shrink-0"
          >
            <span>{isLast ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
            <ArrowRight className="w-4 h-4" />
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
}: {
  card: CardWithProgress;
  isLast: boolean;
  rates: PracticeXpRates;
  onAnswered: (isCorrect: boolean, xp: number) => void;
  onNext: () => void;
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
    inputRef.current?.focus();
  }, []);

  const isCorrect = inputVal.trim().toLowerCase() === cleanWord.toLowerCase();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswered || !inputVal.trim()) return;
    setIsAnswered(true);
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
              className="h-11 px-5 font-bold shrink-0"
            >
              Kiểm tra
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
            className="gap-1.5 text-xs sm:text-sm font-bold shrink-0"
          >
            <span>{isLast ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
            <ArrowRight className="w-4 h-4" />
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
}: {
  card: CardWithProgress;
  isLast: boolean;
  rates: PracticeXpRates;
  onAnswered: (isCorrect: boolean, xp: number) => void;
  onNext: () => void;
}) {
  const [userSentence, setUserSentence] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [gradeResult, setGradeResult] = useState<SentenceGradeResponse | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const gradeMutation = useGradeSentence();
  const collocations = (card.collocations as unknown as CollocationItem[]) || [];

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
      const awardedXp = Math.round((res.score / 100) * rates.sentence_writing);
      onAnswered(res.score >= 70, awardedXp);
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
          value={userSentence}
          onChange={(e) => setUserSentence(e.target.value)}
          placeholder={`Viết một câu tiếng Anh hoàn chỉnh sử dụng từ "${card.word}"...`}
          rows={3}
          disabled={gradeMutation.isPending || isAnswered}
          className="text-sm"
        />

        {gradeError && (
          <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/25 text-xs text-danger">
            {gradeError}
          </div>
        )}

        {!isAnswered && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleGrade}
              disabled={!userSentence.trim() || gradeMutation.isPending}
              className="h-10 px-5 text-xs font-bold gap-2 bg-gradient-to-r from-purple-600 to-brand"
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
              className="gap-1.5 text-xs sm:text-sm font-bold"
            >
              <span>{isLast ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
