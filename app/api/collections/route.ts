import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateCollectionDto } from '@/types/collection.types';

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

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'my';
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim();
    const sort_by = searchParams.get('sort_by') || (tab === 'community' ? 'popular' : 'newest');

    let query = supabase
      .from('collections')
      .select(`
        *,
        creator:profiles!collections_creator_id_fkey(id, display_name, avatar_url),
        collection_cards(count),
        collection_likes(user_id),
        user_collections(user_id)
      `);

    if (tab === 'my') {
      // My collections: created by user OR bookmarked/saved by user
      query = query.eq('creator_id', user.id);
    } else {
      // Community library: public collections
      query = query.eq('is_public', true);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (sort_by === 'popular') {
      query = query.order('fork_count', { ascending: false }).order('likes_count', { ascending: false });
    } else if (sort_by === 'alpha') {
      query = query.order('title', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching collections:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format results to include calculated metadata
    const formatted = (data || []).map((col: any) => {
      const cardCount = col.collection_cards?.[0]?.count || 0;
      const isLiked = Array.isArray(col.collection_likes) && col.collection_likes.some((l: any) => l.user_id === user.id);
      const isSaved = Array.isArray(col.user_collections) && col.user_collections.some((s: any) => s.user_id === user.id);
      const isOwner = col.creator_id === user.id;

      const { collection_cards, collection_likes, user_collections, ...rest } = col;

      return {
        ...rest,
        card_count: cardCount,
        is_liked: isLiked,
        is_saved: isSaved,
        is_owner: isOwner,
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error('Collections GET error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}

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

    const body: CreateCollectionDto = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Tiêu đề bộ sưu tập là bắt buộc' }, { status: 400 });
    }

    // Insert collection
    const { data: collection, error: colError } = await supabase
      .from('collections')
      .insert({
        creator_id: user.id,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        cover_image: body.cover_image || null,
        category: body.category || 'other',
        is_public: body.is_public ?? false,
        tags: Array.isArray(body.tags) ? body.tags : [],
      })
      .select('*, creator:profiles!collections_creator_id_fkey(id, display_name, avatar_url)')
      .single();

    if (colError || !collection) {
      console.error('Error inserting collection:', colError);
      return NextResponse.json({ error: colError?.message || 'Không thể tạo bộ sưu tập' }, { status: 500 });
    }

    // If card_ids are provided, associate them in collection_cards
    if (body.card_ids && Array.isArray(body.card_ids) && body.card_ids.length > 0) {
      const cardRows = body.card_ids.map((cardId, index) => ({
        collection_id: collection.id,
        card_id: cardId,
        display_order: index,
      }));

      const { error: cardsError } = await supabase.from('collection_cards').insert(cardRows);
      if (cardsError) {
        console.warn('Warning: error associating initial cards:', cardsError);
      }
    }

    return NextResponse.json({
      ...collection,
      card_count: body.card_ids?.length || 0,
      is_owner: true,
      is_liked: false,
      is_saved: false,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Collections POST error:', err);
    return NextResponse.json({ error: err.message || 'Lỗi hệ thống' }, { status: 500 });
  }
}
