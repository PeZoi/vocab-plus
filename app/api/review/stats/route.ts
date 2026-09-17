import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addDays, differenceInDays, format, parseISO, startOfDay, startOfWeek, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';

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

    // 4. Lấy và tính toán chuỗi streak chuẩn từ user_streaks
    const todayStr = format(now, 'yyyy-MM-dd');
    const yesterdayStr = format(addDays(now, -1), 'yyyy-MM-dd');

    let streak_days = 0;
    let has_reviewed_today = false;

    if (userStreakRecord) {
      const lastActive = userStreakRecord.last_active_date;
      if (lastActive === todayStr) {
        has_reviewed_today = true;
        streak_days = userStreakRecord.current_streak;
      } else if (lastActive === yesterdayStr) {
        has_reviewed_today = false;
        streak_days = userStreakRecord.current_streak;
      } else if (!lastActive) {
        has_reviewed_today = false;
        streak_days = userStreakRecord.current_streak;
      } else {
        const lastDate = parseISO(lastActive);
        const diffDays = differenceInDays(startOfDay(now), startOfDay(lastDate));
        const missedDays = diffDays - 1;
        const freezes = userStreakRecord.freezes_available || 0;
        if (freezes >= missedDays && missedDays > 0) {
          streak_days = userStreakRecord.current_streak;
        } else {
          streak_days = 0;
        }
        has_reviewed_today = false;
      }
    } else {
      const activeDaysSet = new Set<string>();
      (yearlyLogs || []).forEach((l) => {
        if (l.reviewed_at) activeDaysSet.add(format(parseISO(l.reviewed_at), 'yyyy-MM-dd'));
      });

      if (activeDaysSet.has(todayStr)) {
        has_reviewed_today = true;
      }

      if (activeDaysSet.has(todayStr) || activeDaysSet.has(yesterdayStr)) {
        let checkDate = activeDaysSet.has(todayStr) ? startOfDay(now) : addDays(startOfDay(now), -1);
        while (activeDaysSet.has(format(checkDate, 'yyyy-MM-dd'))) {
          streak_days++;
          checkDate = addDays(checkDate, -1);
        }
      }
    }

    // 5. Tập hợp các ngày đã có hoạt động học tập (từ review_logs và user_daily_xp)
    const reviewCountsByDate = new Map<string, number>();
    (yearlyLogs || []).forEach((l) => {
      if (l.reviewed_at) {
        const d = format(parseISO(l.reviewed_at), 'yyyy-MM-dd');
        reviewCountsByDate.set(d, (reviewCountsByDate.get(d) || 0) + 1);
      }
    });

    const xpByDate = new Map<string, number>();
    (yearlyDailyXp || []).forEach((x) => {
      if (x.date) {
        xpByDate.set(x.date, x.xp_earned || 0);
      }
    });

    // 6. Tính toán 7 ngày trong tuần cho Thẻ Chuỗi Ngày Học (Thứ 2 đến Chủ nhật)
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

      // Xác định ngày có hoạt động học tập hay không
      let is_active = false;
      if (is_today) {
        is_active = has_reviewed_today;
      } else if (is_past) {
        const count = reviewCountsByDate.get(dayDateStr) || 0;
        const xp = xpByDate.get(dayDateStr) || 0;
        is_active = count > 0 || xp > 0;

        // Nếu người dùng đang có streak > 0 và ngày này nằm trong khoảng streak gần nhất
        if (!is_active && streak_days > 0 && userStreakRecord?.last_active_date) {
          const lastActiveDate = parseISO(userStreakRecord.last_active_date);
          const diffFromLast = differenceInDays(startOfDay(lastActiveDate), startOfDay(dayDate));
          if (diffFromLast >= 0 && diffFromLast < streak_days) {
            is_active = true;
          }
        }
      }

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

    // 7. Chuẩn bị dữ liệu Heatmap 52 tuần cho GitHub-style Activity Calendar
    const totalDaysToShow = 365;
    const activity_history = [];
    let totalReviewsYear = 0;
    let activeDaysCount = 0;

    for (let i = totalDaysToShow; i >= 0; i--) {
      const d = subDays(now, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const count = reviewCountsByDate.get(dStr) || 0;
      const xp = xpByDate.get(dStr) || 0;

      if (count > 0 || xp > 0) {
        activeDaysCount++;
      }
      totalReviewsYear += count;

      // Xác định level màu cho ô vuông heatmap (0 đến 4)
      let level = 0;
      if (count > 0 || xp > 0) {
        if (count >= 20 || xp >= 150) level = 4;
        else if (count >= 10 || xp >= 80) level = 3;
        else if (count >= 5 || xp >= 30) level = 2;
        else level = 1;
      }

      activity_history.push({
        date: dStr,
        count,
        xp,
        level,
      });
    }

    const longest_streak = Math.max(userStreakRecord?.longest_streak || 0, streak_days);

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
        activity_summary: {
          total_reviews_year: totalReviewsYear,
          total_active_days: activeDaysCount,
          current_streak: streak_days,
          longest_streak,
        },
      },
      forecast,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
