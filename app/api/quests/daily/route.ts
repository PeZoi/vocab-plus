import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureDailyQuests } from '@/lib/gamification';
import type { DailyQuestsResponse } from '@/types/quest.types';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const quests = await ensureDailyQuests(user.id);
    const completedCount = quests.filter((q) => q.is_completed).length;
    const totalCount = quests.length;

    const response: DailyQuestsResponse = {
      quests,
      completedCount,
      totalCount,
      allCompleted: totalCount > 0 && completedCount === totalCount,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi lấy danh sách nhiệm vụ';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
