import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestAIStoryEssayGrading } from '@/lib/ai/story-quiz-grader';
import type { GradeStoryEssayRequest } from '@/types/story-quiz.types';

export const maxDuration = 60;

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

    const body = (await request.json()) as GradeStoryEssayRequest;
    const { story_text, question, sample_answer, user_answer } = body;

    if (!user_answer || user_answer.trim().length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập câu trả lời trước khi yêu cầu chấm điểm.' },
        { status: 400 }
      );
    }

    const result = await requestAIStoryEssayGrading({
      story_text: story_text || '',
      question: question || '',
      sample_answer: sample_answer || '',
      user_answer: user_answer.trim(),
      supabase,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi khi chấm điểm câu trả lời tự luận';
    console.error('Error grading story essay:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
