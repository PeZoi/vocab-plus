'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type {
  TimedSegment,
  ListeningDifficulty,
  WordClozeItem,
  ChunkClozeItem,
  DictationGradingResult,
} from '@/types/listening.types';
import { generateWordCloze, generateChunkCloze, checkWordMatch } from '@/lib/listening/cloze-generator';
import { gradeFullDictation } from '@/lib/listening/diff-grader';
import { listeningService } from '@/services/listening.service';
import { toast } from 'sonner';

interface UseListeningSessionProps {
  youtubeId?: string;
  segments: TimedSegment[];
  initialDifficulty?: ListeningDifficulty;
  difficulty?: ListeningDifficulty;
  onPlaySegment?: (start: number, end: number, loop?: boolean) => void;
}

export function useListeningSession({
  youtubeId,
  segments,
  initialDifficulty = 'medium',
  difficulty: externalDifficulty,
  onPlaySegment,
}: UseListeningSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [internalDifficulty, setDifficulty] = useState<ListeningDifficulty>(
    externalDifficulty || initialDifficulty
  );
  const difficulty = externalDifficulty || internalDifficulty;
  const [isLooping, setIsLooping] = useState(false);
  const [autoPauseAtEnd, setAutoPauseAtEnd] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Lưu trạng thái hoàn thành của từng câu
  const [completedSegmentIds, setCompletedSegmentIds] = useState<Set<string>>(new Set());

  // Trạng thái bài làm cho từng chế độ
  const [wordClozeState, setWordClozeState] = useState<Record<number, string>>({});
  const [chunkClozeState, setChunkClozeState] = useState<string>('');
  const [fullDictationText, setFullDictationText] = useState<string>('');
  const [diffResult, setDiffResult] = useState<DictationGradingResult | null>(null);

  // Bộ nhớ lưu câu trả lời đã gõ theo từng segment ID để khi chuyển qua lại câu không bị mất
  const savedWordAnswersRef = useRef<Record<string, Record<number, string>>>({});
  const savedChunkAnswersRef = useRef<Record<string, string>>({});
  const savedDictationAnswersRef = useRef<Record<string, string>>({});
  const savedDiffResultsRef = useRef<Record<string, DictationGradingResult>>({});

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper kích hoạt lưu ngầm tiến độ lên Supabase (Debounce 1.5s)
  const triggerAutoSave = useCallback(
    (indexToSave: number, completedSet: Set<string>) => {
      if (!youtubeId) return;

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          const savedAnswersPayload = {
            words: savedWordAnswersRef.current,
            chunks: savedChunkAnswersRef.current,
            dictation: savedDictationAnswersRef.current,
          };

          const isFinished = segments.length > 0 && completedSet.size >= segments.length;

          await listeningService.saveProgress({
            youtubeId,
            difficulty,
            currentIndex: indexToSave,
            completedSegmentIds: Array.from(completedSet),
            savedAnswers: savedAnswersPayload,
            isFinished,
          });
        } catch {
          // Bỏ qua lỗi ngầm khi không có mạng
        }
      }, 1500);
    },
    [youtubeId, difficulty, segments.length]
  );

  // Phục hồi tiến độ học từ Supabase khi mở video hoặc đổi difficulty
  useEffect(() => {
    if (!youtubeId || segments.length === 0) return;

    let isCancelled = false;

    const restoreProgress = async () => {
      try {
        const res = await listeningService.getProgress(youtubeId, difficulty);
        if (isCancelled || !res.success || !res.progress) return;

        const p = res.progress;

        // Phục hồi danh sách câu đã hoàn thành
        if (Array.isArray(p.completedSegmentIds) && p.completedSegmentIds.length > 0) {
          setCompletedSegmentIds(new Set(p.completedSegmentIds));
        }

        // Phục hồi câu trả lời đã lưu
        if (p.savedAnswers && typeof p.savedAnswers === 'object') {
          const answers = p.savedAnswers as {
            words?: Record<string, Record<number, string>>;
            chunks?: Record<string, string>;
            dictation?: Record<string, string>;
          };
          if (answers.words) savedWordAnswersRef.current = answers.words;
          if (answers.chunks) savedChunkAnswersRef.current = answers.chunks;
          if (answers.dictation) savedDictationAnswersRef.current = answers.dictation;
        }

        // Phục hồi vị trí câu đang học dở
        if (typeof p.currentIndex === 'number' && p.currentIndex >= 0 && p.currentIndex < segments.length) {
          setCurrentIndex(p.currentIndex);
          if (p.currentIndex > 0 || (p.completedSegmentIds && p.completedSegmentIds.length > 0)) {
            toast.success(`Đã khôi phục tiến độ học tập (Câu ${p.currentIndex + 1}/${segments.length})`);
          }
        }
      } catch {
        // Bỏ qua nếu user chưa đăng nhập
      }
    };

    restoreProgress();

    return () => {
      isCancelled = true;
    };
  }, [youtubeId, difficulty, segments.length]);

  const currentSegment = segments[currentIndex] || null;

  const onPlaySegmentRef = useRef(onPlaySegment);
  useEffect(() => {
    onPlaySegmentRef.current = onPlaySegment;
  });

  // 1a. Cấu trúc từ khoét lỗ gốc (CHỈ TẠO LẠI khi đổi câu hoặc đổi difficulty)
  const baseWordClozeItems: WordClozeItem[] = useMemo(() => {
    if (!currentSegment || difficulty !== 'easy') return [];
    return generateWordCloze(currentSegment.text);
  }, [currentSegment, difficulty]);

  // 1b. Gán câu trả lời của user (KHÔNG gọi lại generateWordCloze khi người dùng gõ chữ)
  const wordClozeItems: WordClozeItem[] = useMemo(() => {
    if (baseWordClozeItems.length === 0) return [];
    const isCompleted = currentSegment ? completedSegmentIds.has(currentSegment.id) : false;

    return baseWordClozeItems.map((item) => {
      const stateAns = wordClozeState[item.index];

      // Thứ tự ưu tiên:
      // 1. Text đang gõ trong state
      // 2. Nếu câu đã Đạt (completed), tự động hiển thị từ đúng (cleanedWord)
      const userAns =
        stateAns !== undefined && stateAns !== ''
          ? stateAns
          : isCompleted && item.isMasked
          ? item.cleanedWord
          : '';

      const isMatch = userAns ? checkWordMatch(item.cleanedWord, userAns) : false;
      const isCorrect = isCompleted ? true : userAns ? isMatch : undefined;

      return {
        ...item,
        userAnswer: userAns,
        isCorrect,
      };
    });
  }, [baseWordClozeItems, wordClozeState, completedSegmentIds, currentSegment]);

  // 2. Dữ liệu Cloze cho chế độ Vừa (Chunk Cloze)
  const chunkClozeItem: ChunkClozeItem | null = useMemo(() => {
    if (!currentSegment || difficulty !== 'medium') return null;
    return generateChunkCloze(currentSegment.text);
  }, [currentSegment, difficulty]);

  const isFirstMountRef = useRef(true);
  const prevIndexRef = useRef(currentIndex);

  // Phục hồi hoặc reset input khi chuyển câu hoặc đổi chế độ
  useEffect(() => {
    const segId = currentSegment?.id;

    if (segId) {
      const isCompleted = completedSegmentIds.has(segId);

      // 1. Phục hồi Word Cloze
      const savedWord = savedWordAnswersRef.current[segId];
      if (savedWord && Object.keys(savedWord).length > 0) {
        setWordClozeState(savedWord);
      } else if (isCompleted) {
        const autoFilled: Record<number, string> = {};
        baseWordClozeItems.filter((i) => i.isMasked).forEach((i) => {
          autoFilled[i.index] = i.cleanedWord;
        });
        savedWordAnswersRef.current[segId] = autoFilled;
        setWordClozeState(autoFilled);
      } else {
        setWordClozeState({});
      }

      // 2. Phục hồi Chunk Cloze
      const savedChunk = savedChunkAnswersRef.current[segId];
      if (savedChunk !== undefined && savedChunk !== '') {
        setChunkClozeState(savedChunk);
      } else if (isCompleted && chunkClozeItem?.maskedChunks[0]) {
        const autoChunk = chunkClozeItem.maskedChunks[0].cleanedText;
        savedChunkAnswersRef.current[segId] = autoChunk;
        setChunkClozeState(autoChunk);
      } else {
        setChunkClozeState('');
      }

      // 3. Phục hồi Full Dictation
      const savedDict = savedDictationAnswersRef.current[segId];
      if (savedDict !== undefined && savedDict !== '') {
        setFullDictationText(savedDict);
      } else if (isCompleted) {
        savedDictationAnswersRef.current[segId] = currentSegment.text;
        setFullDictationText(currentSegment.text);
      } else {
        setFullDictationText('');
      }

      // 4. Phục hồi Diff Result
      const savedDiff = savedDiffResultsRef.current[segId];
      setDiffResult(savedDiff || null);
    } else {
      setWordClozeState({});
      setChunkClozeState('');
      setFullDictationText('');
      setDiffResult(null);
    }

    setShowHint(false);
    setShowAnswer(false);

    // Không tự động phát khi vừa mount lần đầu để tránh lỗi player chưa sẵn sàng
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevIndexRef.current = currentIndex;
      return;
    }

    // Chỉ tự động phát khi người dùng thực sự chuyển sang câu khác
    if (prevIndexRef.current !== currentIndex && currentSegment) {
      prevIndexRef.current = currentIndex;
      onPlaySegmentRef.current?.(currentSegment.start, currentSegment.end);
    }
  }, [
    currentIndex,
    currentSegment,
    difficulty,
    completedSegmentIds,
    baseWordClozeItems,
    chunkClozeItem,
  ]);

  // Cập nhật câu trả lời cho chế độ Dễ
  const setWordAnswer = useCallback((wordIndex: number, value: string) => {
    setWordClozeState((prev) => {
      const next = { ...prev, [wordIndex]: value };
      if (currentSegment) {
        if (!savedWordAnswersRef.current[currentSegment.id]) {
          savedWordAnswersRef.current[currentSegment.id] = {};
        }
        savedWordAnswersRef.current[currentSegment.id][wordIndex] = value;
      }
      return next;
    });
  }, [currentSegment]);

  // Cập nhật câu trả lời cho chế độ Vừa
  const setChunkAnswer = useCallback((value: string) => {
    setChunkClozeState(value);
    if (currentSegment) {
      savedChunkAnswersRef.current[currentSegment.id] = value;
    }
  }, [currentSegment]);

  // Cập nhật câu trả lời cho chế độ Khó
  const setDictationAnswer = useCallback((value: string) => {
    setFullDictationText(value);
    if (currentSegment) {
      savedDictationAnswersRef.current[currentSegment.id] = value;
    }
  }, [currentSegment]);

  // Kiểm tra kết quả của câu hiện tại
  const checkCurrentAnswer = useCallback(() => {
    if (!currentSegment) return false;

    if (difficulty === 'easy') {
      const masked = wordClozeItems.filter((item) => item.isMasked);
      const allCorrect = masked.every((item) => {
        const userAns = wordClozeState[item.index] || '';
        return checkWordMatch(item.cleanedWord, userAns);
      });

      if (allCorrect) {
        setCompletedSegmentIds((prev) => {
          const next = new Set([...prev, currentSegment.id]);
          triggerAutoSave(currentIndex, next);
          return next;
        });
        // Lưu lại toàn bộ từ đúng vào cache
        const finalWordMap: Record<number, string> = {
          ...(savedWordAnswersRef.current[currentSegment.id] || {}),
          ...wordClozeState,
        };
        masked.forEach((item) => {
          if (!finalWordMap[item.index]) {
            finalWordMap[item.index] = item.cleanedWord;
          }
        });
        savedWordAnswersRef.current[currentSegment.id] = finalWordMap;
        setWordClozeState(finalWordMap);
      }
      return allCorrect;
    }

    if (difficulty === 'medium') {
      if (!chunkClozeItem || chunkClozeItem.maskedChunks.length === 0) return false;
      const expected = chunkClozeItem.maskedChunks[0].cleanedText;
      const isMatch = checkWordMatch(expected, chunkClozeState);

      if (isMatch) {
        setCompletedSegmentIds((prev) => {
          const next = new Set([...prev, currentSegment.id]);
          triggerAutoSave(currentIndex, next);
          return next;
        });
        savedChunkAnswersRef.current[currentSegment.id] = chunkClozeState || expected;
      }
      return isMatch;
    }

    if (difficulty === 'hard') {
      const result = gradeFullDictation(currentSegment.text, fullDictationText);
      setDiffResult(result);
      savedDiffResultsRef.current[currentSegment.id] = result;
      savedDictationAnswersRef.current[currentSegment.id] = fullDictationText;

      if (result.isPassed) {
        setCompletedSegmentIds((prev) => {
          const next = new Set([...prev, currentSegment.id]);
          triggerAutoSave(currentIndex, next);
          return next;
        });
      }
      return result.isPassed;
    }

    return false;
  }, [
    currentSegment,
    currentIndex,
    difficulty,
    wordClozeItems,
    wordClozeState,
    chunkClozeItem,
    chunkClozeState,
    fullDictationText,
    triggerAutoSave,
  ]);

  // Chuyển sang câu tiếp theo
  const nextSegment = useCallback(() => {
    if (currentIndex < segments.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      triggerAutoSave(nextIdx, completedSegmentIds);
    }
  }, [currentIndex, segments.length, triggerAutoSave, completedSegmentIds]);

  // Quay lại câu trước
  const prevSegment = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      triggerAutoSave(prevIdx, completedSegmentIds);
    }
  }, [currentIndex, triggerAutoSave, completedSegmentIds]);

  // Nhảy tới câu bất kỳ
  const goToSegment = useCallback(
    (index: number) => {
      if (index >= 0 && index < segments.length) {
        setCurrentIndex(index);
        triggerAutoSave(index, completedSegmentIds);
      }
    },
    [segments.length, triggerAutoSave, completedSegmentIds]
  );

  // Toggle lặp A-B
  const toggleLooping = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  // Toggle tự dừng
  const toggleAutoPause = useCallback(() => {
    setAutoPauseAtEnd((prev) => !prev);
  }, []);

  return {
    currentIndex,
    currentSegment,
    totalSegments: segments.length,
    difficulty,
    setDifficulty,
    isLooping,
    toggleLooping,
    autoPauseAtEnd,
    setAutoPauseAtEnd,
    toggleAutoPause,
    showHint,
    setShowHint,
    showAnswer,
    setShowAnswer,
    completedSegmentIds,
    wordClozeItems,
    wordClozeState,
    setWordAnswer,
    chunkClozeItem,
    chunkClozeState,
    setChunkAnswer,
    fullDictationText,
    setDictationAnswer,
    diffResult,
    checkCurrentAnswer,
    nextSegment,
    prevSegment,
    goToSegment,
  };
}
