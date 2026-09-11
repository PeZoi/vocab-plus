import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AdminUserListItem } from '@/types/admin-user.types';

export async function GET(request: Request) {
  try {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const role = searchParams.get('role');

    // 1. Query danh sách profiles
    let profilesQuery = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      profilesQuery = profilesQuery.or(`display_name.ilike.%${search}%,id.ilike.%${search}%`);
    }

    if (role && role !== 'all') {
      profilesQuery = profilesQuery.eq('role', role);
    }

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const userIds = (profiles || []).map((p) => p.id);

    if (userIds.length === 0) {
      return NextResponse.json({ users: [], total: 0 });
    }

    // 2. Lấy song song dữ liệu Streak, Cards count, Public Collections count
    const [
      { data: streaks },
      { data: cardsData },
      { data: collectionsData },
    ] = await Promise.all([
      supabase.from('user_streaks').select('*').in('user_id', userIds),
      supabase.from('cards').select('owner_id').in('owner_id', userIds),
      supabase.from('collections').select('creator_id').in('creator_id', userIds).eq('is_public', true),
    ]);

    // Map streak theo user_id
    const streakMap = new Map<string, { current_streak: number; longest_streak: number; last_active_date: string | null }>();
    (streaks || []).forEach((s) => {
      streakMap.set(s.user_id, {
        current_streak: s.current_streak,
        longest_streak: s.longest_streak,
        last_active_date: s.last_active_date,
      });
    });

    // Map card count theo user_id
    const cardCountMap = new Map<string, number>();
    (cardsData || []).forEach((c) => {
      if (c.owner_id) {
        cardCountMap.set(c.owner_id, (cardCountMap.get(c.owner_id) || 0) + 1);
      }
    });

    // Map public collection count theo user_id
    const collectionCountMap = new Map<string, number>();
    (collectionsData || []).forEach((c) => {
      if (c.creator_id) {
        collectionCountMap.set(c.creator_id, (collectionCountMap.get(c.creator_id) || 0) + 1);
      }
    });

    // 3. Format dữ liệu trả về
    const users: AdminUserListItem[] = (profiles || []).map((p) => {
      const streakInfo = streakMap.get(p.id);
      return {
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        role: p.role || 'user',
        xp: p.xp || 0,
        created_at: p.created_at,
        current_streak: streakInfo?.current_streak || 0,
        longest_streak: streakInfo?.longest_streak || 0,
        last_active_date: streakInfo?.last_active_date || null,
        total_cards: cardCountMap.get(p.id) || 0,
        public_collections_count: collectionCountMap.get(p.id) || 0,
      };
    });

    return NextResponse.json({ users, total: users.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
