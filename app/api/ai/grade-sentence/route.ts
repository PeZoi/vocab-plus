import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestAISentenceGrading } from '@/lib/ai/sentence-grader';

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

    const { word, user_sentence, target_meaning } = await request.json();

    if (!word || typeof word !== 'string' || !word.trim()) {
      return NextResponse.json({ error: 'Từ vựng mục tiêu là bắt buộc' }, { status: 400 });
    }

    if (!user_sentence || typeof user_sentence !== 'string' || !user_sentence.trim()) {
      return NextResponse.json({ error: 'Câu của bạn là bắt buộc' }, { status: 400 });
    }

    const result = await requestAISentenceGrading({
      word,
      user_sentence,
      target_meaning,
      supabase,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi chấm điểm câu';
    console.error('Grade sentence route error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
