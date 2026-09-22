import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestAIStoryQuizGeneration } from '@/lib/ai/story-quiz-generator';
import type { GenerateStoryQuizRequest } from '@/types/story-quiz.types';

export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực người dùng' }, { status: 401 });
    }

    const body = (await request.json()) as GenerateStoryQuizRequest;
    const { story_text, story_title, mode, question_count } = body;

    if (!story_text || story_text.trim().length < 30) {
      return NextResponse.json(
        { error: 'Nội dung bài đọc quá ngắn để tạo câu hỏi trắc nghiệm hoặc tự luận.' },
        { status: 400 }
      );
    }

    const validModes = ['multiple_choice', 'essay', 'mixed'];
    const safeMode = validModes.includes(mode) ? mode : 'multiple_choice';

    const quiz = await requestAIStoryQuizGeneration({
      story_text: story_text.trim(),
      story_title: story_title?.trim(),
      mode: safeMode,
      question_count: question_count || (safeMode === 'mixed' ? 6 : 5),
      supabase,
    });

    return NextResponse.json(quiz);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi khi tạo câu hỏi đọc hiểu bằng AI';
    console.error('Error generating story quiz:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
