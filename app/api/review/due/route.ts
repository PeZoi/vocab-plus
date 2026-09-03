import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const now = new Date().toISOString();

    // Lấy các user_cards có due_at <= now() kèm thông tin card
    const { data, error } = await supabase
      .from('user_cards')
      .select('*, card:cards(*)')
      .eq('user_id', user.id)
      .lte('due_at', now)
      .order('due_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format lại thành mảng items [{ card, user_card }]
    const formatted = (data || [])
      .filter((item) => item.card !== null)
      .map((item) => ({
        card: item.card,
        user_card: {
          id: item.id,
          user_id: item.user_id,
          card_id: item.card_id,
          stability: item.stability,
          difficulty: item.difficulty,
          due_at: item.due_at,
          review_count: item.review_count,
          lapse_count: item.lapse_count,
          is_leech: item.is_leech,
          state: item.state,
        },
      }));

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
