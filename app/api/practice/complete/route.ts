import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { awardXp, incrementQuestProgress, updateStreak } from '@/lib/gamification';
import type { SubmitPracticeSessionDto } from '@/types/practice.types';

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

    const body: SubmitPracticeSessionDto = await request.json();
    const { xp_earned, total_questions, correct_count, mode } = body;

    const parsedXp = Math.max(0, Number(xp_earned) || 0);

    let actualXpAwarded = 0;
    if (parsedXp > 0) {
      actualXpAwarded = await awardXp(user.id, parsedXp, 'practice');
    }

    // Cập nhật chuỗi học Streak chính thức cho bài kiểm tra hôm nay
    const streakResult = await updateStreak(user.id, new Date());

    if (correct_count && correct_count > 0) {
      await incrementQuestProgress(user.id, 'review_cards', correct_count);
    }

    return NextResponse.json({
      success: true,
      total_questions: total_questions || 0,
      correct_count: correct_count || 0,
      mode: mode || 'mixed',
      actual_xp_awarded: actualXpAwarded,
      streak_activated: streakResult?.streakActivated ?? false,
      streak_count: streakResult?.streakCount ?? 1,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
