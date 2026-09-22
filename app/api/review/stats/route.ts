import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addDays, format, parseISO, startOfDay, startOfWeek, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { buildActivityCalendarData } from '@/utils/activity-calendar';

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

    const now = new Date();
    const nowIso = now.toISOString();
    const oneYearAgo = subDays(now, 365);
    const oneYearAgoStr = format(oneYearAgo, 'yyyy-MM-dd');

    // 1. Profile (XP) & System Settings
    const [
      { data: profile },
      { data: settings },
      { data: todayXpRow },
      { data: userStreakRecord },
      { data: yearlyLogs },
      { data: yearlyDailyXp }
    ] = await Promise.all([
      supabase.from('profiles').select('xp').eq('id', user.id).single(),
      supabase.from('system_settings').select('key, value').in('key', ['daily_xp_cap', 'league_min_threshold']),
      supabase.from('user_daily_xp').select('xp_earned').eq('user_id', user.id).eq('date', format(now, 'yyyy-MM-dd')).maybeSingle(),
      supabase.from('user_streaks').select('current_streak, longest_streak, last_active_date, freezes_available').eq('user_id', user.id).maybeSingle(),
      supabase.from('review_logs').select('reviewed_at').eq('user_id', user.id).gte('reviewed_at', oneYearAgo.toISOString()).order('reviewed_at', { ascending: false }),
      supabase.from('user_daily_xp').select('date, xp_earned').eq('user_id', user.id).gte('date', oneYearAgoStr).order('date', { ascending: false })
    ]);

    const daily_xp_cap = (settings?.find((s) => s.key === 'daily_xp_cap')?.value as number) || 500;
    const league_min_threshold = (settings?.find((s) => s.key === 'league_min_threshold')?.value as number) || 200;
    const today_xp = todayXpRow?.xp_earned || 0;

    // 2. User cards
    const { data: userCards } = await supabase
      .from('user_cards')
      .select('due_at, stability, state')
      .eq('user_id', user.id);

    const cards = userCards || [];
    const learning_count = cards.filter((c) => c.state !== 'new').length;
    const due_count = cards.filter((c) => c.due_at && c.due_at <= nowIso).length;
    const mastered_count = cards.filter((c) => (Number(c.stability) || 0) >= 20).length;

    // 3. Forecast 7 ngày tới
    const forecast = [];
    const dayLabels = ['Hôm nay', 'Ngày mai', 'Ngày kia'];

    for (let i = 0; i < 7; i++) {
      const targetDate = addDays(now, i);
      const targetStart = startOfDay(targetDate);
      const targetEnd = addDays(targetStart, 1);

      let label = '';
      if (i < 3) {
        label = dayLabels[i];
      } else {
        label = format(targetDate, 'EEEE', { locale: vi });
      }

      const count = cards.filter((c) => {
        if (!c.due_at) return false;
        const dueDate = parseISO(c.due_at);
        if (i === 0) {
          // Hôm nay tính tất cả các thẻ đã quá hạn và đến hạn hôm nay
          return dueDate <= targetEnd;
        }
        return dueDate >= targetStart && dueDate < targetEnd;
      }).length;

      forecast.push({
        date: format(targetDate, 'yyyy-MM-dd'),
        day_label: label,
        count,
      });
    }

    // 4. Tính toán tập trung dữ liệu Heatmap 52 tuần, Streak & Tổng kết hoạt động
    const {
      completedDatesSet,
      streak_days,
      longest_streak,
      has_reviewed_today,
      activity_history,
      activity_summary,
    } = buildActivityCalendarData({
      yearlyLogs,
      yearlyDailyXp,
      streakRecord: userStreakRecord,
      now,
    });

    // Tự động đồng bộ hóa bản ghi user_streaks nếu trạng thái streak hoặc longest_streak thay đổi
    if (userStreakRecord) {
      if (
        userStreakRecord.current_streak !== streak_days ||
        (userStreakRecord.longest_streak || 0) < longest_streak
      ) {
        supabase
          .from('user_streaks')
          .update({
            current_streak: streak_days,
            longest_streak,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .then(() => {});
      }
    }

    // 5. Tính toán 7 ngày trong tuần cho Thẻ Chuỗi Ngày Học (Thứ 2 đến Chủ nhật)
    const todayStr = format(now, 'yyyy-MM-dd');
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekDayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const weekFullLabels = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

    const week_days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(weekStart, i);
      const dayDateStr = format(dayDate, 'yyyy-MM-dd');
      const is_today = dayDateStr === todayStr;
      const is_past = dayDateStr < todayStr;
      const is_future = dayDateStr > todayStr;

      // Một ngày chỉ bật ngọn lửa nếu ngày đó ĐÃ HOÀN THÀNH bài ôn tập
      const is_active = completedDatesSet.has(dayDateStr);

      week_days.push({
        date: dayDateStr,
        day_label: weekDayLabels[i],
        full_label: weekFullLabels[i],
        day_number: dayDate.getDate(),
        is_today,
        is_past,
        is_future,
        is_active,
      });
    }

    return NextResponse.json({
      stats: {
        learning_count,
        due_count,
        mastered_count,
        streak_days,
        longest_streak,
        total_xp: profile?.xp || 0,
        today_xp,
        daily_xp_cap,
        league_min_threshold,
        has_reviewed_today,
        freezes_available: userStreakRecord?.freezes_available || 0,
        week_days,
        activity_history,
        activity_summary,
      },
      forecast,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
