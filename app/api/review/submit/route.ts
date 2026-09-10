import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  calculateNextReviews,
  createEmptyCard,
  Rating,
  State,
  type FSRSCard,
} from '@/lib/fsrs';
import type { SubmitReviewDto } from '@/types/review.types';
import { incrementQuestProgress } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const body: SubmitReviewDto = await request.json();
    const { card_id, rating, response_ms } = body;

    if (!card_id || !rating || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json(
        { error: 'card_id và rating (1-4) là bắt buộc' },
        { status: 400 }
      );
    }

    // 1. Lấy thông tin user_cards hiện tại (hoặc tự tạo nếu chưa có cho phép ôn tập on-demand)
    let { data: userCard } = await supabase
      .from('user_cards')
      .select('*')
      .eq('user_id', user.id)
      .eq('card_id', card_id)
      .maybeSingle();

    if (!userCard) {
      const initialEmpty = createEmptyCard();
      const { data: createdUserCard, error: insertError } = await supabase
        .from('user_cards')
        .insert({
          user_id: user.id,
          card_id: card_id,
          state: 'new',
          due_at: initialEmpty.due.toISOString(),
          stability: initialEmpty.stability,
          difficulty: initialEmpty.difficulty,
          review_count: 0,
          lapse_count: 0,
          is_leech: false,
        })
        .select()
        .single();

      if (insertError || !createdUserCard) {
        return NextResponse.json(
          { error: 'Không thể khởi tạo tiến trình học cho thẻ này' },
          { status: 500 }
        );
      }
      userCard = createdUserCard;
    }

    // 2. Chuyển đổi sang FSRSCard model
    const stateMap: Record<string, State> = {
      new: State.New,
      learning: State.Learning,
      review: State.Review,
      relearning: State.Relearning,
    };

    const currentFSRSCard: FSRSCard = {
      due: new Date(userCard.due_at || Date.now()),
      stability: Number(userCard.stability) || 0,
      difficulty: Number(userCard.difficulty) || 0,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: userCard.review_count || 0,
      lapses: userCard.lapse_count || 0,
      state: stateMap[userCard.state || 'new'] ?? State.New,
      last_review: new Date(),
    };

    // 3. Tính toán trạng thái tiếp theo qua FSRS
    const now = new Date();
    const schedulingCards = calculateNextReviews(currentFSRSCard, now);
    const grade = rating as unknown as Rating;
    const nextRecord = schedulingCards[grade as 1 | 2 | 3 | 4];

    if (!nextRecord) {
      return NextResponse.json(
        { error: 'Lỗi tính toán lịch ôn tập FSRS' },
        { status: 500 }
      );
    }

    const nextCard = nextRecord.card;
    const stateRevMap: Record<State, string> = {
      [State.New]: 'new',
      [State.Learning]: 'learning',
      [State.Review]: 'review',
      [State.Relearning]: 'relearning',
    };

    // Kiểm tra xem thẻ có thực sự ở trạng thái cần ôn tập hay không
    // (Đến hạn due_at <= now hoặc là thẻ mới)
    const isDue =
      userCard.state === 'new' ||
      !userCard.due_at ||
      new Date(userCard.due_at).getTime() <= Date.now() + 60 * 1000;

    const newReviewCount = isDue
      ? (userCard.review_count || 0) + 1
      : (userCard.review_count || 0); // Bảo toàn review_count nếu từ chưa đến hạn ôn tập!

    const newLapseCount = isDue
      ? rating === 1
        ? (userCard.lapse_count || 0) + 1
        : userCard.lapse_count || 0
      : (userCard.lapse_count || 0); // Bảo toàn lapse_count nếu đang học tự do chưa đến hạn

    const isLeech = newLapseCount >= 4;

    // 4. Cập nhật bảng user_cards
    // Nếu chưa đến hạn (Not Due), bảo toàn trạng thái FSRS và cấp độ
    const updatePayload = isDue
      ? {
          stability: nextCard.stability,
          difficulty: nextCard.difficulty,
          due_at: nextCard.due.toISOString(),
          state: stateRevMap[nextCard.state],
          review_count: newReviewCount,
          lapse_count: newLapseCount,
          is_leech: isLeech,
        }
      : {
          // Bảo toàn cấp độ: không tăng review_count, không đổi due_at/stability
          review_count: newReviewCount,
          lapse_count: newLapseCount,
        };

    const { error: updateError } = await supabase
      .from('user_cards')
      .update(updatePayload)
      .eq('id', userCard.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 5. Ghi log ôn tập
    await supabase.from('review_logs').insert({
      user_id: user.id,
      card_id: card_id,
      rating: rating,
      reviewed_at: now.toISOString(),
      response_ms: response_ms || null,
    });

    // 6. Cập nhật tiến độ nhiệm vụ hàng ngày (XP sẽ được tổng kết và cập nhật một lần khi kết thúc phiên)
    await incrementQuestProgress(user.id, 'review_cards', 1);
    if ((userCard.review_count || 0) === 0) {
      await incrementQuestProgress(user.id, 'learn_new', 1);
    }

    return NextResponse.json({
      success: true,
      due_at: isDue ? nextCard.due.toISOString() : (userCard.due_at || new Date().toISOString()),
      state: isDue ? stateRevMap[nextCard.state] : (userCard.state || 'new'),
      is_due: isDue,
      level_preserved: !isDue,
      xp_added: 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
