import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SeasonDetailResponse, SeasonUserHistory } from '@/services/leaderboard.service';
import type { LeagueTier } from '@/constants/leagues';

/**
 * GET /api/leaderboard/seasons/[seasonId]
 * Lấy chi tiết kết quả và bảng xếp hạng của một mùa giải
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ seasonId: string }> }
) {
  try {
    const { seasonId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    // 1. Lấy thông tin mùa giải
    const { data: season, error: seasonError } = await supabase
      .from('league_seasons')
      .select('*')
      .eq('id', seasonId)
      .maybeSingle();

    if (seasonError) {
      console.error('[GET_SEASON_DETAIL_ERROR]:', seasonError);
      return NextResponse.json({ error: seasonError.message }, { status: 500 });
    }

    if (!season) {
      return NextResponse.json({ error: 'Không tìm thấy mùa giải' }, { status: 404 });
    }

    // 2. Lấy danh sách kết quả học viên của mùa giải đó
    const { data: historyRows, error: historyError } = await supabase
      .from('user_season_history')
      .select(`
        id,
        user_id,
        rank_position,
        league_tier,
        weekly_xp,
        zone,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq('season_id', seasonId)
      .order('rank_position', { ascending: true });

    if (historyError) {
      console.error('[GET_SEASON_USERS_ERROR]:', historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    const leaderboard: SeasonUserHistory[] = (historyRows || []).map((row) => {
      const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const isCurrentUser = row.user_id === user.id;

      return {
        id: row.id,
        user_id: row.user_id,
        display_name: isCurrentUser
          ? user.user_metadata?.full_name || p?.display_name || 'Bạn'
          : p?.display_name || 'Học viên ẩn danh',
        avatar_url: p?.avatar_url || null,
        rank_position: row.rank_position,
        league_tier: row.league_tier as LeagueTier,
        weekly_xp: row.weekly_xp,
        zone: row.zone,
        is_current_user: isCurrentUser,
      };
    });

    const currentUser = leaderboard.find((u) => u.user_id === user.id) || null;

    const response: SeasonDetailResponse = {
      season,
      leaderboard,
      currentUser,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống không xác định';
    console.error('[GET_SEASON_DETAIL_UNEXPECTED]:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
