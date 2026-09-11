import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AdminUserDetail, UserLearningStats } from '@/types/admin-user.types';
import type { Collection } from '@/types/collection.types';

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

    // Kiểm tra quyền Admin (hoặc chính chủ xem profile của mình)
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = currentProfile?.role === 'admin';
    const isSelf = user.id === targetUserId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Từ chối truy cập: Cần quyền Quản trị viên' }, { status: 403 });
    }

    // 1. Lấy thông tin profile
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // 2. Lấy dữ liệu Streak, User Cards, Review Logs và Public Collections song song
    const [
      { data: streakData },
      { data: userCardsData },
      { count: totalCardsCount },
      { count: totalReviewsCount },
      { data: collectionsData },
    ] = await Promise.all([
      supabase.from('user_streaks').select('*').eq('user_id', targetUserId).maybeSingle(),
      supabase.from('user_cards').select('state, stability').eq('user_id', targetUserId),
      supabase.from('cards').select('*', { count: 'exact', head: true }).eq('owner_id', targetUserId),
      supabase.from('review_logs').select('*', { count: 'exact', head: true }).eq('user_id', targetUserId),
      supabase.from('collections').select('*').eq('creator_id', targetUserId).eq('is_public', true).order('created_at', { ascending: false }),
    ]);

    // Tính toán thống kê học tập
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
    // Những từ chưa có bản ghi user_cards cũng tính là new
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

    const publicCollections: Collection[] = (collectionsData || []).map((col) => ({
      ...col,
      creator: {
        id: targetProfile.id,
        display_name: targetProfile.display_name,
        avatar_url: targetProfile.avatar_url,
      },
    }));

    const detail: AdminUserDetail = {
      id: targetProfile.id,
      display_name: targetProfile.display_name,
      avatar_url: targetProfile.avatar_url,
      role: targetProfile.role || 'user',
      xp: targetProfile.xp || 0,
      created_at: targetProfile.created_at,
      timezone: targetProfile.timezone,
      current_streak: streakData?.current_streak || 0,
      longest_streak: streakData?.longest_streak || 0,
      last_active_date: streakData?.last_active_date || null,
      freezes_available: streakData?.freezes_available || 0,
      stats,
      public_collections: publicCollections,
    };

    return NextResponse.json(detail);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
