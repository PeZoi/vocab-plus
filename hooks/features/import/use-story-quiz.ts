'use client';

import { useState, useMemo, useCallback } from 'react';
import type {
  StoryQuizMode,
  StoryQuizQuestion,
  StoryMultipleChoiceQuestion,
  StoryEssayQuestion,
  McqAnswerState,
  EssayAnswerState,
} from '@/types/story-quiz.types';
import { storyQuizService } from '@/services/story-quiz.service';
import { toast } from 'sonner';

export function useStoryQuiz() {
  const [mode, setMode] = useState<StoryQuizMode>('multiple_choice');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<StoryQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lưu trạng thái trả lời trắc nghiệm: { [qId]: { selectedIndex, isCorrect, revealed } }
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, McqAnswerState>>({});

  // Lưu trạng thái trả lời tự luận: { [qId]: { text, isGrading, result } }
  const [essayAnswers, setEssayAnswers] = useState<Record<string, EssayAnswerState>>({});

  // Sinh bộ câu hỏi từ AI
  const handleGenerateQuiz = useCallback(
    async (storyText: string, storyTitle?: string) => {
      if (!storyText || storyText.trim().length < 30) {
        toast.warning('Nội dung bài đọc quá ngắn để tạo câu hỏi.');
        return;
      }

      try {
        setIsGenerating(true);
        const res = await storyQuizService.generateQuiz({
          story_text: storyText,
          story_title: storyTitle,
          mode,
          question_count: mode === 'mixed' ? 6 : 5,
        });

        if (res && res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
          setCurrentIndex(0);
          setMcqAnswers({});
          setEssayAnswers({});
          toast.success(`Đã tạo thành công ${res.questions.length} câu hỏi đọc hiểu!`);
        } else {
          toast.error('Không nhận được câu hỏi từ AI. Vui lòng thử lại.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tạo câu hỏi từ AI';
        toast.error(msg);
      } finally {
        setIsGenerating(false);
      }
    },
    [mode]
  );

  // Xử lý chọn đáp án trắc nghiệm -> Phản hồi đúng/sai tức thì kèm giải thích
  const handleSelectMcqOption = useCallback(
    (question: StoryMultipleChoiceQuestion, optionIndex: number) => {
      setMcqAnswers((prev) => {
        // Nếu đã chọn rồi thì không đổi để giữ tính nghiêm túc của bài test
        if (prev[question.id]?.revealed) {
          return prev;
        }

        const isCorrect = optionIndex === question.correct_index;
        return {
          ...prev,
          [question.id]: {
            selectedIndex: optionIndex,
            isCorrect,
            revealed: true,
          },
        };
      });
    },
    []
  );

  // Cập nhật văn bản tự luận của người dùng
  const handleEssayTextChange = useCallback((questionId: string, text: string) => {
    setEssayAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { isGrading: false }),
        text,
      },
    }));
  }, []);

  // Gọi AI chấm điểm câu tự luận
  const handleGradeEssay = useCallback(
    async (question: StoryEssayQuestion, storyText: string) => {
      const currentAns = essayAnswers[question.id]?.text?.trim();
      if (!currentAns) {
        toast.warning('Vui lòng nhập câu trả lời tiếng Anh trước khi chấm điểm.');
        return;
      }

      try {
        setEssayAnswers((prev) => ({
          ...prev,
          [question.id]: {
            ...prev[question.id],
            isGrading: true,
          },
        }));

        const result = await storyQuizService.gradeEssay({
          story_text: storyText,
          question: question.question,
          sample_answer: question.sample_answer,
          user_answer: currentAns,
        });

        setEssayAnswers((prev) => ({
          ...prev,
          [question.id]: {
            ...prev[question.id],
            isGrading: false,
            result,
          },
        }));

        if (result.is_correct) {
          toast.success(`Đạt ${result.score}/100 điểm! ${result.score >= 85 ? 'Xuất sắc! 🎉' : 'Làm tốt lắm!'}`);
        } else {
          toast.info(`Điểm: ${result.score}/100. Hãy xem gợi ý để hoàn thiện hơn nhé.`);
        }
      } catch (err: unknown) {
        setEssayAnswers((prev) => ({
          ...prev,
          [question.id]: {
            ...prev[question.id],
            isGrading: false,
          },
        }));
        const msg = err instanceof Error ? err.message : 'Lỗi khi chấm điểm câu tự luận';
        toast.error(msg);
      }
    },
    [essayAnswers]
  );

  // Điều hướng câu hỏi
  const handleNextQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const handlePrevQuestion = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSelectQuestionIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length]
  );

  // Làm lại bài quiz này
  const handleRetryQuiz = useCallback(() => {
    setMcqAnswers({});
    setEssayAnswers({});
    setCurrentIndex(0);
    toast.info('Đã làm mới lượt làm bài. Chúc bạn hoàn thành tốt!');
  }, []);

  // Xóa trắng để tạo mới
  const handleClearQuiz = useCallback(() => {
    setQuestions([]);
    setMcqAnswers({});
    setEssayAnswers({});
    setCurrentIndex(0);
  }, []);

  // Thống kê tiến độ & kết quả
  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    let mcqTotal = 0;
    let mcqCorrect = 0;
    let mcqAnswered = 0;

    let essayTotal = 0;
    let essayGradedCount = 0;
    let essayTotalScore = 0;

    questions.forEach((q) => {
      if (q.type === 'multiple_choice') {
        mcqTotal++;
        const ans = mcqAnswers[q.id];
        if (ans?.revealed) {
          mcqAnswered++;
          if (ans.isCorrect) mcqCorrect++;
        }
      } else {
        essayTotal++;
        const ans = essayAnswers[q.id];
        if (ans?.result) {
          essayGradedCount++;
          essayTotalScore += ans.result.score;
        }
      }
    });

    const essayAverageScore = essayGradedCount > 0 ? Math.round(essayTotalScore / essayGradedCount) : 0;
    const isCompleted =
      totalQuestions > 0 &&
      mcqAnswered === mcqTotal &&
      essayGradedCount === essayTotal;

    return {
      totalQuestions,
      mcqTotal,
      mcqCorrect,
      mcqAnswered,
      essayTotal,
      essayGradedCount,
      essayAverageScore,
      isCompleted,
    };
  }, [questions, mcqAnswers, essayAnswers]);

  const currentQuestion = questions[currentIndex] || null;

  return {
    mode,
    setMode,
    isGenerating,
    questions,
    currentIndex,
    currentQuestion,
    mcqAnswers,
    essayAnswers,
    stats,
    handleGenerateQuiz,
    handleSelectMcqOption,
    handleEssayTextChange,
    handleGradeEssay,
    handleNextQuestion,
    handlePrevQuestion,
    handleSelectQuestionIndex,
    handleRetryQuiz,
    handleClearQuiz,
  };
}
