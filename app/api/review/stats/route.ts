import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addDays, format, parseISO, startOfDay } from 'date-fns';
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

    // 4. Tính chuỗi ngày streak từ review_logs
    const { data: logs } = await supabase
      .from('review_logs')
      .select('reviewed_at')
      .eq('user_id', user.id)
      .order('reviewed_at', { ascending: false });

    let streak_days = 0;
    let has_reviewed_today = today_xp > 0;

    if (logs && logs.length > 0) {
      const distinctDays = new Set(
        logs
          .filter((l) => l.reviewed_at)
          .map((l) => format(parseISO(l.reviewed_at!), 'yyyy-MM-dd'))
      );

      let checkDate = startOfDay(now);
      const todayStr = format(checkDate, 'yyyy-MM-dd');
      const yesterdayStr = format(addDays(checkDate, -1), 'yyyy-MM-dd');

      if (distinctDays.has(todayStr)) {
        has_reviewed_today = true;
      }

      // Nếu hôm nay có học hoặc hôm qua có học thì streak còn tiếp diễn
      if (distinctDays.has(todayStr) || distinctDays.has(yesterdayStr)) {
        if (!distinctDays.has(todayStr)) {
          checkDate = addDays(checkDate, -1);
        }
        while (distinctDays.has(format(checkDate, 'yyyy-MM-dd'))) {
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
