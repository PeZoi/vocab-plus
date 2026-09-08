import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database.types';

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
    const collectionId = searchParams.get('collection_id');
    const tag = searchParams.get('tag');
    const cefrLevel = searchParams.get('cefr_level');
    const cardIdsParam = searchParams.get('card_ids');

    // 0. Custom Study Session theo danh sách Card IDs được chọn
    if (cardIdsParam) {
      const ids = cardIdsParam.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json([]);
      }

      const { data, error } = await supabase
        .from('cards')
        .select('*, user_cards(*)')
        .in('id', ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const formatted = (data || []).map((card) => {
        const userCards = card.user_cards;
        const userCard = Array.isArray(userCards)
          ? userCards.find((uc) => uc.user_id === user.id) || userCards[0]
          : userCards;

        return {
          card,
          user_card: userCard || null,
        };
      });

      return NextResponse.json(formatted);
    }

    // 1. Custom Study Session theo Collection
    if (collectionId) {
      const { data: colCards, error: colError } = await supabase
        .from('collection_cards')
        .select('card:cards(*, user_cards(*))')
        .eq('collection_id', collectionId)
        .order('display_order', { ascending: true });

      if (colError) {
        return NextResponse.json({ error: colError.message }, { status: 500 });
      }

      type CollectionCardJoin = {
        card: (Tables<'cards'> & { user_cards?: Tables<'user_cards'>[] | Tables<'user_cards'> | null }) | null;
      };

      const formatted = ((colCards || []) as unknown as CollectionCardJoin[])
        .map((item) => {
          if (!item.card) return null;
          const userCards = item.card.user_cards;
          const userCard = Array.isArray(userCards)
            ? userCards.find((uc) => uc.user_id === user.id) || userCards[0]
            : userCards;

          return {
            card: item.card,
            user_card: userCard || null,
          };
        })
        .filter(Boolean);

      return NextResponse.json(formatted);
    }

    // 2. Custom Study Session theo Tag hoặc CEFR Level
    if (tag || cefrLevel) {
      let cardQuery = supabase.from('cards').select('id').eq('owner_id', user.id);
      if (tag && tag !== 'all') {
        const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
        cardQuery = cardQuery.contains('tags', [formattedTag]);
      }
      if (cefrLevel && cefrLevel !== 'all') {
        cardQuery = cardQuery.eq('cefr_level', cefrLevel);
      }
      const { data: matchedCards } = await cardQuery;
      const matchedIds = (matchedCards || []).map((c) => c.id);

      if (matchedIds.length === 0) {
        return NextResponse.json([]);
      }

      const { data, error } = await supabase
        .from('user_cards')
        .select('*, card:cards(*)')
        .eq('user_id', user.id)
        .in('card_id', matchedIds)
        .order('due_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const formatted = (data || [])
        .filter((item) => item.card !== null)
        .map((item) => ({
          card: item.card,
          user_card: item,
        }));

      return NextResponse.json(formatted);
    }

    // 3. Chế độ FSRS Review tiêu chuẩn (lấy các thẻ đến hạn due_at <= now())
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_cards')
      .select('*, card:cards(*)')
      .eq('user_id', user.id)
      .lte('due_at', now)
      .order('due_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || [])
      .filter((item) => item.card !== null)
      .map((item) => ({
        card: item.card,
        user_card: item,
      }));

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
