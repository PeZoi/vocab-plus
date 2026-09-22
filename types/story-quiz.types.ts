export type StoryQuizMode = 'multiple_choice' | 'essay' | 'mixed';

export interface StoryMultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  question: string;
  options: [string, string, string, string]; // 4 options A, B, C, D
  correct_index: number; // 0, 1, 2, 3
  explanation_vi: string; // Giải thích chi tiết bằng tiếng Việt kèm trích đoạn trong bài
}

export interface StoryEssayQuestion {
  id: string;
  type: 'essay';
  question: string;
  sample_answer: string; // Câu trả lời mẫu chuẩn bằng tiếng Anh
  evaluation_criteria: string; // Tiêu chí đánh giá trọng tâm
}

export type StoryQuizQuestion = StoryMultipleChoiceQuestion | StoryEssayQuestion;

export interface GenerateStoryQuizRequest {
  story_text: string;
  story_title?: string;
  mode: StoryQuizMode;
  question_count?: number; // Mặc định 5 (hoặc 6 nếu mixed: 3 TN + 3 TL)
}

export interface GenerateStoryQuizResponse {
  story_title?: string;
  mode: StoryQuizMode;
  questions: StoryQuizQuestion[];
}

export interface GradeStoryEssayRequest {
  story_text: string;
  question: string;
  sample_answer: string;
  user_answer: string;
}

export interface GradeStoryEssayResponse {
  score: number; // 0 - 100
  is_correct: boolean; // >= 60 là đạt
  feedback_vi: string; // Nhận xét bằng tiếng Việt về điểm mạnh, điểm thiếu
  suggestions_vi: string; // Gợi ý cải thiện
  corrected_answer?: string; // Câu trả lời hoàn thiện gợi ý nếu có
}

export interface McqAnswerState {
  selectedIndex: number;
  isCorrect: boolean;
  revealed: boolean;
}

export interface EssayAnswerState {
  text: string;
  isGrading: boolean;
  result?: GradeStoryEssayResponse;
}
