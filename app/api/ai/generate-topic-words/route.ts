import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestAITopicWords } from '@/lib/ai/topic-generator';
import type { GenerateTopicWordsRequest } from '@/types/ai-topic.types';

export const maxDuration = 90;

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

    const body: GenerateTopicWordsRequest = await request.json();

    if (!body.topic || typeof body.topic !== 'string' || !body.topic.trim()) {
      return NextResponse.json(
        { error: 'Chủ đề từ vựng là bắt buộc' },
        { status: 400 }
      );
    }

    const result = await requestAITopicWords({
      topic: body.topic,
      description: body.description,
      cefr_levels: body.cefr_levels,
      count: body.count,
      userId: user.id,
      supabase,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi sinh từ vựng';
    console.error('[AI_GENERATE_TOPIC_WORDS] Error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
