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

    // 4. Tập hợp các ngày thực sự ĐÃ HOÀN THÀNH ôn tập
    // Quy tắc: Chỉ khi người dùng hoàn tất trọn vẹn phiên (có thưởng XP hoặc được ghi nhận streak)
    // mới được tính là 1 lần ôn tập hoàn thành. Nhấn vào làm dở dang rồi thoát KHÔNG được tính.
    const completedDatesSet = new Set<string>();
    (yearlyDailyXp || []).forEach((x) => {
      if (x.date && (x.xp_earned || 0) > 0) {
        completedDatesSet.add(x.date);
      }
    });
    if (userStreakRecord?.last_active_date) {
      completedDatesSet.add(userStreakRecord.last_active_date);
    }

    const reviewCountsByDate = new Map<string, number>();
    (yearlyLogs || []).forEach((l) => {
      if (l.reviewed_at) {
        const d = format(parseISO(l.reviewed_at), 'yyyy-MM-dd');
        // Chỉ cộng số câu ôn tập nếu ngày đó thực sự có hoàn thành phiên ôn tập
        if (completedDatesSet.has(d)) {
          reviewCountsByDate.set(d, (reviewCountsByDate.get(d) || 0) + 1);
        }
      }
    });

    const xpByDate = new Map<string, number>();
    (yearlyDailyXp || []).forEach((x) => {
      if (x.date) {
        xpByDate.set(x.date, x.xp_earned || 0);
      }
    });

    // 5. Tính toán chuỗi streak chuẩn xác & đồng bộ theo các phiên đã hoàn thành
    const todayStr = format(now, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');

    const has_reviewed_today = completedDatesSet.has(todayStr);

    // Tính chuỗi ngày học liên tục thực tế từ các ngày ĐÃ HOÀN THÀNH
    let historyStreak = 0;
    const streakStartDay = has_reviewed_today
      ? now
      : (completedDatesSet.has(yesterdayStr) ? subDays(now, 1) : null);

    if (streakStartDay) {
      let checkDate = streakStartDay;
      while (completedDatesSet.has(format(checkDate, 'yyyy-MM-dd'))) {
        historyStreak++;
        checkDate = subDays(checkDate, 1);
      }
    }

    // Kết hợp với bản ghi user_streaks (bao gồm logic dùng băng bảo vệ freeze nếu có)
    let streak_days = historyStreak;

    if (userStreakRecord) {
      const lastActive = userStreakRecord.last_active_date;
      if (lastActive) {
        const lastDate = parseISO(lastActive);
        const diffDays = differenceInDays(startOfDay(now), startOfDay(lastDate));
        const missedDays = diffDays - 1;
        const freezes = userStreakRecord.freezes_available || 0;

        // Nếu người dùng có freeze bảo vệ số ngày bỏ lỡ
        if (freezes >= missedDays && missedDays > 0) {
          streak_days = Math.max(streak_days, userStreakRecord.current_streak);
        } else if (diffDays <= 1 && historyStreak > 0) {
          streak_days = Math.max(streak_days, userStreakRecord.current_streak);
        } else if (diffDays > 1 && (!freezes || freezes < missedDays)) {
          streak_days = 0;
        }
      }

      // Tự động đồng bộ hóa bản ghi user_streaks nếu trạng thái streak thay đổi
      if (userStreakRecord.current_streak !== streak_days) {
        const updatedLongest = Math.max(userStreakRecord.longest_streak || 0, streak_days);
        supabase
          .from('user_streaks')
          .update({
            current_streak: streak_days,
            longest_streak: updatedLongest,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .then(() => {});
      }
    }

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

    // 7. Chuẩn bị dữ liệu Heatmap 52 tuần cho GitHub-style Activity Calendar
    const totalDaysToShow = 365;
    const activity_history = [];
    let totalReviewsYear = 0;
    let activeDaysCount = 0;

    for (let i = totalDaysToShow; i >= 0; i--) {
      const d = subDays(now, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const isCompletedDay = completedDatesSet.has(dStr);
      const count = isCompletedDay ? (reviewCountsByDate.get(dStr) || 0) : 0;
      const xp = xpByDate.get(dStr) || 0;

      if (isCompletedDay) {
        activeDaysCount++;
      }
      totalReviewsYear += count;

      // Xác định level màu cho ô vuông heatmap (chỉ tô màu khi ngày đó đã hoàn thành bài)
      let level = 0;
      if (isCompletedDay) {
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
