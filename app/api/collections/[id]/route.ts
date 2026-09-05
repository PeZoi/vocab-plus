import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UpdateCollectionDto } from '@/types/collection.types';

export async function GET(
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

    // 1. Fetch collection details
    const { data: collection, error: colError } = await supabase
      .from('collections')
      .select(`
        *,
        creator:profiles!collections_creator_id_fkey(id, display_name, avatar_url),
        collection_likes(user_id),
        user_collections(user_id)
      `)
      .eq('id', id)
      .single();

    if (colError || !collection) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập' }, { status: 404 });
    }

    // Check permission: public or owner
    if (!collection.is_public && collection.creator_id !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập bộ sưu tập này' }, { status: 403 });
    }

    // 2. Fetch cards inside collection
    const { data: cardLinks, error: linksError } = await supabase
      .from('collection_cards')
      .select(`
        display_order,
        added_at,
        card:cards(
          *,
          user_cards(*)
        )
      `)
      .eq('collection_id', id)
      .order('display_order', { ascending: true })
      .order('added_at', { ascending: true });

    if (linksError) {
      console.error('Error fetching collection cards:', linksError);
    }

    const cards = (cardLinks || [])
      .map((link: any) => {
        if (!link.card) return null;
        const userCard = Array.isArray(link.card.user_cards) ? link.card.user_cards[0] : link.card.user_cards;
        return {
          ...link.card,
          user_card: userCard || null,
        };
      })
      .filter(Boolean);

    const isLiked = Array.isArray(collection.collection_likes) && collection.collection_likes.some((l: any) => l.user_id === user.id);
    const isSaved = Array.isArray(collection.user_collections) && collection.user_collections.some((s: any) => s.user_id === user.id);
    const isOwner = collection.creator_id === user.id;

    const { collection_likes, user_collections, ...rest } = collection;

    return NextResponse.json({
      ...rest,
      cards,
      card_count: cards.length,
      is_liked: isLiked,
      is_saved: isSaved,
      is_owner: isOwner,
    });
  } catch (err: any) {
    console.error('Collection GET [id] error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function PUT(
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
    const { data: existing, error: checkError } = await supabase
      .from('collections')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập' }, { status: 404 });
    }

    if (existing.creator_id !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền chỉnh sửa bộ sưu tập này' }, { status: 403 });
    }

    const body: UpdateCollectionDto = await request.json();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updatePayload.title = body.title.trim();
    if (body.description !== undefined) updatePayload.description = body.description?.trim() || null;
    if (body.cover_image !== undefined) updatePayload.cover_image = body.cover_image;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.is_public !== undefined) updatePayload.is_public = body.is_public;
    if (body.tags !== undefined) updatePayload.tags = Array.isArray(body.tags) ? body.tags : [];

    const { data, error } = await supabase
      .from('collections')
      .update(updatePayload)
      .eq('id', id)
      .select('*, creator:profiles!collections_creator_id_fkey(id, display_name, avatar_url)')
      .single();

    if (error) {
      console.error('Error updating collection:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Collection PUT [id] error:', err);
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
    const { data: existing, error: checkError } = await supabase
      .from('collections')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập' }, { status: 404 });
    }

    if (existing.creator_id !== user.id) {
      return NextResponse.json({ error: 'Bạn không có quyền xóa bộ sưu tập này' }, { status: 403 });
    }

    const { error } = await supabase.from('collections').delete().eq('id', id);

    if (error) {
      console.error('Error deleting collection:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa bộ sưu tập thành công' });
  } catch (err: any) {
    console.error('Collection DELETE [id] error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
