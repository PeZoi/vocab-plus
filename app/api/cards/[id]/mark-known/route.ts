import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { awardXp, incrementQuestProgress } from '@/lib/gamification';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const now = new Date();
    const futureDue = new Date(now.getTime() + 14 * 86400000); // 14 ngày sau mới cần ôn

    // 1. Cập nhật hoặc tạo mới user_cards cho thẻ này
    const { data: existingUserCard } = await supabase
      .from('user_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('card_id', id)
      .maybeSingle();

    let updatedUserCard;

    if (existingUserCard) {
      const { data, error } = await supabase
        .from('user_cards')
        .update({
          state: 'review',
          stability: 14,
          difficulty: 3.0,
          due_at: futureDue.toISOString(),
          review_count: Math.max(existingUserCard.review_count || 0, 5),
          lapse_count: 0,
          is_leech: false,
        })
        .eq('id', existingUserCard.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      updatedUserCard = data;
    } else {
      const { data, error } = await supabase
        .from('user_cards')
        .insert({
          user_id: user.id,
          card_id: id,
          state: 'review',
          stability: 14,
          difficulty: 3.0,
          due_at: futureDue.toISOString(),
          review_count: 5,
          lapse_count: 0,
          is_leech: false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      updatedUserCard = data;
    }

    // 2. Ghi log ôn tập
    await supabase.from('review_logs').insert({
      user_id: user.id,
      card_id: id,
      rating: 4,
      reviewed_at: now.toISOString(),
      review_mode: 'flashcard',
    });

    // 3. Thưởng XP khích lệ và cập nhật nhiệm vụ
    const xpAwarded = await awardXp(user.id, 15, 'review');
    await incrementQuestProgress(user.id, 'review_cards', 1);
    await incrementQuestProgress(user.id, 'learn_new', 1);

    return NextResponse.json({
      success: true,
      message: 'Đã đánh dấu thuộc từ này thành công!',
      user_card: updatedUserCard,
      xp_awarded: xpAwarded,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
