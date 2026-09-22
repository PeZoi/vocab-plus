import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { subDays, format } from 'date-fns';
import { buildActivityCalendarData } from '@/utils/activity-calendar';
import type { PublicUserProfile, UserLearningStats } from '@/types/admin-user.types';
import type { Collection } from '@/types/collection.types';
import type { LeagueTier } from '@/constants/leagues';

export async function GET(
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

    // 1. Lấy thông tin hồ sơ người dùng
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, role, xp, created_at, timezone')
      .eq('id', targetUserId)
      .single();

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const now = new Date();
    const oneYearAgo = subDays(now, 365);
    const oneYearAgoStr = format(oneYearAgo, 'yyyy-MM-dd');

    // 2. Lấy dữ liệu League, Streak, Thống kê học tập, Collections và Activity Logs song song
    const [
      { data: leagueData },
      { data: streakData },
      { data: userCardsData },
      { count: totalCardsCount },
      { count: totalReviewsCount },
      { data: collectionsData },
      { data: yearlyLogs },
      { data: yearlyDailyXp },
    ] = await Promise.all([
      supabase.from('user_leagues').select('league').eq('user_id', targetUserId).maybeSingle(),
      supabase.from('user_streaks').select('*').eq('user_id', targetUserId).maybeSingle(),
      supabase.from('user_cards').select('state, stability').eq('user_id', targetUserId),
      supabase.from('cards').select('*', { count: 'exact', head: true }).eq('owner_id', targetUserId),
      supabase.from('review_logs').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId),
      supabase
        .from('collections')
        .select('*')
        .eq('creator_id', targetUserId)
        .eq('is_public', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('review_logs')
        .select('reviewed_at')
        .eq('user_id', targetUserId)
        .gte('reviewed_at', oneYearAgo.toISOString())
        .order('reviewed_at', { ascending: false }),
      supabase
        .from('user_daily_xp')
        .select('date, xp_earned')
        .eq('user_id', targetUserId)
        .gte('date', oneYearAgoStr)
        .order('date', { ascending: false }),
    ]);

    // 3. Tính toán thống kê học tập FSRS
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;

    (userCardsData || []).forEach((uc) => {
      const stability = Number(uc.stability) || 0;
      if (uc.state === 'mastered' || stability >= 20) {
        masteredCount++;
      } else if (uc.state === 'learning' || uc.state === 'relearning') {
        learningCount++;
      } else if (uc.state === 'new') {
        newCount++;
      }
    });

    const totalCards = totalCardsCount || 0;
    if (totalCards > (userCardsData || []).length) {
      newCount += totalCards - (userCardsData || []).length;
    }

    const stats: UserLearningStats = {
      total_cards: totalCards,
      mastered_cards: masteredCount,
      learning_cards: learningCount,
      new_cards: newCount,
      total_reviews: totalReviewsCount || 0,
    };

    // 4. Tính toán Heatmap 52 tuần & Streak chuẩn hóa
    const { activity_history, activity_summary, streak_days, longest_streak } =
      buildActivityCalendarData({
        yearlyLogs,
        yearlyDailyXp,
        streakRecord: streakData,
        now,
      });

    const publicCollections: Collection[] = (collectionsData || []).map((col) => ({
      ...col,
      creator: {
        id: targetProfile.id,
        display_name: targetProfile.display_name,
        avatar_url: targetProfile.avatar_url,
      },
    }));

    const userLeague: LeagueTier = (leagueData?.league as LeagueTier) || 'unranked';

    const result: PublicUserProfile = {
      id: targetProfile.id,
      display_name: targetProfile.display_name,
      avatar_url: targetProfile.avatar_url,
      role: targetProfile.role || 'user',
      xp: targetProfile.xp || 0,
      created_at: targetProfile.created_at,
      timezone: targetProfile.timezone,
      current_streak: streak_days,
      longest_streak: longest_streak,
      last_active_date: streakData?.last_active_date || null,
      freezes_available: streakData?.freezes_available || 0,
      league: userLeague,
      stats,
      public_collections: publicCollections,
      activity_history,
      activity_summary,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
