import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Check if collection exists
    const { data: collection, error: colError } = await supabase
      .from('collections')
      .select('likes_count')
      .eq('id', id)
      .single();

    if (colError || !collection) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập' }, { status: 404 });
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('collection_likes')
      .select('created_at')
      .eq('collection_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    let isLiked = false;
    let newCount = collection.likes_count || 0;

    if (existingLike) {
      // Unlike
      await supabase
        .from('collection_likes')
        .delete()
        .eq('collection_id', id)
        .eq('user_id', user.id);

      newCount = Math.max(newCount - 1, 0);
      isLiked = false;
    } else {
      // Like
      await supabase
        .from('collection_likes')
        .insert({
          collection_id: id,
          user_id: user.id,
        });

      newCount = newCount + 1;
      isLiked = true;
    }

    // Update collection likes_count
    await supabase
      .from('collections')
      .update({ likes_count: newCount })
      .eq('id', id);

    return NextResponse.json({ is_liked: isLiked, likes_count: newCount });
  } catch (err: any) {
    console.error('Like toggle error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
