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

    // Verify ownership
    const { data: collection, error: colError } = await supabase
      .from('collections')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (colError || !collection) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập' }, { status: 404 });
    }

    if (collection.creator_id !== user.id) {
      return NextResponse.json({ error: 'Chỉ chủ sở hữu mới có quyền thêm thẻ vào bộ từ' }, { status: 403 });
    }

    const body = await request.json();
    const cardIds: string[] = Array.isArray(body.card_ids) ? body.card_ids : body.card_id ? [body.card_id] : [];

    if (cardIds.length === 0) {
      return NextResponse.json({ error: 'Danh sách card_ids không được rỗng' }, { status: 400 });
    }

    // Get current max display_order
    const { data: existingLinks } = await supabase
      .from('collection_cards')
      .select('display_order')
      .eq('collection_id', id)
      .order('display_order', { ascending: false })
      .limit(1);

    const startOrder = (existingLinks?.[0]?.display_order ?? -1) + 1;

    const rows = cardIds.map((cardId, index) => ({
      collection_id: id,
      card_id: cardId,
      display_order: startOrder + index,
    }));

    const { error: insertError } = await supabase
      .from('collection_cards')
      .upsert(rows, { onConflict: 'collection_id,card_id' });

    if (insertError) {
      console.error('Error adding cards to collection:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: cardIds.length });
  } catch (err: any) {
    console.error('Add cards error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Verify ownership
    const { data: collection, error: colError } = await supabase
      .from('collections')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (colError || !collection) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập' }, { status: 404 });
    }

    if (collection.creator_id !== user.id) {
      return NextResponse.json({ error: 'Chỉ chủ sở hữu mới có quyền xóa thẻ khỏi bộ từ' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('card_id');

    if (!cardId) {
      return NextResponse.json({ error: 'Thiếu card_id cần xóa' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('collection_cards')
      .delete()
      .eq('collection_id', id)
      .eq('card_id', cardId);

    if (deleteError) {
      console.error('Error removing card from collection:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete card from collection error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
