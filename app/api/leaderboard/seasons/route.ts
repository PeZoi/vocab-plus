import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { LeagueSeason } from '@/services/leaderboard.service';

/**
 * GET /api/leaderboard/seasons
 * Lấy danh sách các mùa giải đã lưu trữ từ trước đến nay
 */
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

    const { data: seasons, error } = await supabase
      .from('league_seasons')
      .select('*')
      .order('season_number', { ascending: false });

    if (error) {
      console.error('[GET_SEASONS_ERROR]:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((seasons || []) as LeagueSeason[]);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống không xác định';
    console.error('[GET_SEASONS_UNEXPECTED]:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
