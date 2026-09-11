import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format, addDays } from 'date-fns';
import type { ResetStreakPayload, ResetStreakResponse } from '@/types/admin-user.types';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await props.params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    // Kiểm tra quyền Admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (currentProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Từ chối truy cập: Cần quyền Quản trị viên' }, { status: 403 });
    }

    const body: ResetStreakPayload = await request.json().catch(() => ({}));
    const { target_streak = 0, simulate_yesterday = false } = body;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(addDays(new Date(), -1), 'yyyy-MM-dd');

    const newCurrentStreak = Math.max(0, Number(target_streak));
    const newLastActiveDate = simulate_yesterday ? yesterdayStr : null;

    // 1. Cập nhật hoặc tạo mới bản ghi user_streaks
    const { data: existingStreak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (existingStreak) {
      const newLongest = Math.max(existingStreak.longest_streak, newCurrentStreak);
      await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongest,
          last_active_date: newLastActiveDate,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', targetUserId);
    } else {
      await supabase.from('user_streaks').insert({
        user_id: targetUserId,
        current_streak: newCurrentStreak,
        longest_streak: newCurrentStreak,
        freezes_available: 0,
        last_active_date: newLastActiveDate,
      });
    }

    // 2. Dọn dẹp bản ghi user_daily_xp của ngày hôm nay để đảm bảo trạng thái "chưa học hôm nay"
    await supabase
      .from('user_daily_xp')
      .delete()
      .eq('user_id', targetUserId)
      .eq('date', todayStr);

    const res: ResetStreakResponse = {
      success: true,
      user_id: targetUserId,
      current_streak: newCurrentStreak,
      last_active_date: newLastActiveDate,
      message: simulate_yesterday
        ? `Đã giả lập chuỗi ${newCurrentStreak} ngày (kết thúc hôm qua). Lần học tiếp theo hôm nay sẽ kích hoạt streak ngày thứ ${newCurrentStreak + 1}!`
        : `Đã reset chuỗi streak về 0 (chưa học hôm nay).`,
    };

    return NextResponse.json(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
