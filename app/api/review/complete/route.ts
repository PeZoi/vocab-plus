import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { awardXp } from '@/lib/gamification';
import type { CompleteReviewSessionDto } from '@/types/review.types';

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

    const body: CompleteReviewSessionDto = await request.json();
    const { total_xp, cards_reviewed, is_preview_only } = body;

    const parsedXp = Math.max(0, Number(total_xp) || 0);

    let actualXpAwarded = 0;
    if (parsedXp > 0) {
      actualXpAwarded = await awardXp(
        user.id,
        parsedXp,
        is_preview_only ? 'preview' : 'review',
        { skipStreak: !!is_preview_only }
      );
    }

    return NextResponse.json({
      success: true,
      cards_reviewed: cards_reviewed || 0,
      actual_xp_awarded: actualXpAwarded,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
