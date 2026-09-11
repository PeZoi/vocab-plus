import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addDays, differenceInDays, format, parseISO, startOfDay } from 'date-fns';
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

    // 1. Profile (XP) & System Settings
    const [
      { data: profile },
      { data: settings },
      { data: todayXpRow }
    ] = await Promise.all([
      supabase.from('profiles').select('xp').eq('id', user.id).single(),
      supabase.from('system_settings').select('key, value').in('key', ['daily_xp_cap', 'league_min_threshold']),
      supabase.from('user_daily_xp').select('xp_earned').eq('user_id', user.id).eq('date', format(now, 'yyyy-MM-dd')).maybeSingle()
    ]);

    const daily_xp_cap = settings?.find((s) => s.key === 'daily_xp_cap')?.value as number || 500;
    const league_min_threshold = settings?.find((s) => s.key === 'league_min_threshold')?.value as number || 200;
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

    // 4. Lấy và tính toán chuỗi streak chuẩn từ user_streaks và user_daily_xp
    // (Bảo toàn streak khi người dùng xóa từ vựng vì streak gắn với tài khoản cá nhân)
    const [
      { data: userStreakRecord },
      { data: dailyXpRows },
      { data: logs }
    ] = await Promise.all([
      supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_active_date, freezes_available')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('user_daily_xp')
        .select('date, xp_earned')
        .eq('user_id', user.id)
        .gt('xp_earned', 0)
        .order('date', { ascending: false }),
      supabase
        .from('review_logs')
        .select('reviewed_at')
        .eq('user_id', user.id)
        .order('reviewed_at', { ascending: false })
    ]);

    const todayStr = format(now, 'yyyy-MM-dd');
    const yesterdayStr = format(addDays(now, -1), 'yyyy-MM-dd');

    let streak_days = 0;
    let has_reviewed_today = today_xp > 0;

    // 4. Lấy và tính toán chuỗi streak chuẩn từ user_streaks (nguồn dữ liệu chính thức)
    if (userStreakRecord) {
      const lastActive = userStreakRecord.last_active_date;
      if (lastActive === todayStr) {
        has_reviewed_today = true;
        streak_days = userStreakRecord.current_streak;
      } else if (lastActive === yesterdayStr) {
        has_reviewed_today = today_xp > 0;
        streak_days = userStreakRecord.current_streak;
      } else if (!lastActive) {
        // Chưa có ngày học hoặc vừa được Admin reset về 0
        has_reviewed_today = false;
        streak_days = userStreakRecord.current_streak;
      } else {
        // Ngày học cuối là từ 2 ngày trước trở lên -> kiểm tra freeze
        const lastDate = parseISO(lastActive);
        const diffDays = differenceInDays(startOfDay(now), startOfDay(lastDate));
        const missedDays = diffDays - 1;
        const freezes = userStreakRecord.freezes_available || 0;
        if (freezes >= missedDays && missedDays > 0) {
          streak_days = userStreakRecord.current_streak;
        } else {
          streak_days = 0; // Đứt streak do không học
        }
        has_reviewed_today = false;
      }
    } else {
      // Fallback: Chỉ dùng khi user chưa có bản ghi user_streaks nào trong hệ thống
      const activeDaysSet = new Set<string>();
      (dailyXpRows || []).forEach((row) => {
        if (row.date) activeDaysSet.add(row.date);
      });
      (logs || []).forEach((l) => {
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

    return NextResponse.json({
      stats: {
        learning_count,
        due_count,
        mastered_count,
        streak_days,
        total_xp: profile?.xp || 0,
        today_xp,
        daily_xp_cap,
        league_min_threshold,
        has_reviewed_today,
      },
      forecast,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
