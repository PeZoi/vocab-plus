import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startOfWeek, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'weekly';

    let leaderboard = [];

    if (timeframe === 'all_time') {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, xp')
        .order('xp', { ascending: false })
        .limit(100);
      
      leaderboard = (data || []).map((u, i) => ({
        id: u.id,
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        xp: u.xp || 0,
        rank: i + 1,
      }));
    } else if (timeframe === 'daily') {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('user_daily_xp')
        .select('xp_earned, profiles(id, display_name, avatar_url)')
        .eq('date', today)
        .order('xp_earned', { ascending: false })
        .limit(100);
        
      leaderboard = (data || []).map((row, i) => {
        const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return {
          id: p?.id,
          display_name: p?.display_name,
          avatar_url: p?.avatar_url,
          xp: row.xp_earned,
          rank: i + 1,
        };
      });
    } else {
      // Weekly / League
      const startOfWk = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      // Fetch system settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'league_min_threshold')
        .maybeSingle();
      const minThreshold = (settings?.value as number) || 200;

      // Supabase RPC or aggregate
      // Since we don't have an RPC yet, we can fetch all daily xp for this week and group them in memory
      // (For production with 1M users, an RPC `get_weekly_leaderboard` is required, but fine for MVP)
      const { data } = await supabase
        .from('user_daily_xp')
        .select('xp_earned, profiles(id, display_name, avatar_url)')
        .gte('date', startOfWk);

      const userMap = new Map();
      (data || []).forEach(row => {
        const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        if (!p) return;
        if (!userMap.has(p.id)) {
          userMap.set(p.id, {
            id: p.id,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            xp: 0
          });
        }
        userMap.get(p.id).xp += row.xp_earned;
      });

      leaderboard = Array.from(userMap.values())
        .filter((u) => u.xp > 0)
        .sort((a, b) => b.xp - a.xp)
        .map((u, i) => ({
          ...u,
          rank: i + 1,
          is_qualified: u.xp >= minThreshold,
        }))
        .slice(0, 100);

      const currentUserRank = leaderboard.find((u) => u.id === user.id);
      const currentUserWeekly = userMap.get(user.id);

      return NextResponse.json({
        leaderboard,
        currentUser: currentUserRank || null,
        minThreshold,
        userWeeklyXp: currentUserWeekly?.xp || 0,
      });
    }

    // Find current user's rank
    const currentUserRank = leaderboard.find((u) => u.id === user.id);

    return NextResponse.json({
      leaderboard,
      currentUser: currentUserRank || null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
