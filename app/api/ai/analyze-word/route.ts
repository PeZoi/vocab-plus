import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestAIWordAnalysis } from '@/lib/ai/word-analyzer';

export const maxDuration = 90; // Cho phép route chạy tối đa 90s khi có nhiều vòng lặp retry 429

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const { word, context_sentence } = await request.json();

    if (!word || typeof word !== 'string' || !word.trim()) {
      return NextResponse.json({ error: 'Từ vựng cần phân tích là bắt buộc' }, { status: 400 });
    }

    const analysis = await requestAIWordAnalysis({
      word,
      context_sentence,
      supabase,
    });

    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
