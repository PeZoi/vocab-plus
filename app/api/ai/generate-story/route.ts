import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestAIStoryGeneration } from '@/lib/ai/story-generator';
import type { GenerateStoryRequest } from '@/types/imported-text.types';

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

    const body = (await request.json()) as GenerateStoryRequest;
    const { level, genre, topic, target_words } = body;

    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (level && !validLevels.includes(level)) {
      return NextResponse.json({ error: 'Cấp độ CEFR không hợp lệ' }, { status: 400 });
    }

    const story = await requestAIStoryGeneration({
      level: level || 'B1',
      genre: genre || 'Daily Life',
      topic: topic?.trim(),
      target_words: Array.isArray(target_words) ? target_words : [],
      supabase,
    });

    return NextResponse.json(story);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi khi tạo câu chuyện bằng AI';
    console.error('Error generating story:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
