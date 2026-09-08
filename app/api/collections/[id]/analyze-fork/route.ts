import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateWordSimilarity } from '@/utils/text-similarity';
import type { Tables } from '@/types/database.types';

export async function POST(
  _request: Request,
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

    // 1. Kiểm tra bộ sưu tập gốc
    const { data: original, error: colError } = await supabase
      .from('collections')
      .select('id, title, is_public, creator_id')
      .eq('id', id)
      .single();

    if (colError || !original) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập' }, { status: 404 });
    }

    if (!original.is_public && original.creator_id !== user.id) {
      return NextResponse.json({ error: 'Bộ sưu tập này không công khai' }, { status: 403 });
    }

    // 2. Lấy cấu hình ngưỡng tương đồng (%) từ system_settings
    let threshold = 80;
    try {
      const { data: settingData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'fork_similarity_threshold')
        .maybeSingle();

      if (settingData?.value && typeof settingData.value === 'object') {
        const valObj = settingData.value as Record<string, unknown>;
        if (typeof valObj.threshold === 'number') {
          threshold = Math.max(50, Math.min(100, Math.round(valObj.threshold)));
        }
      }
    } catch (e) {
      console.warn('Cannot read system_settings, fallback to 80%:', e);
    }

    // 3. Lấy tất cả cards trong bộ sưu tập nguồn
    const { data: cardLinks, error: linksError } = await supabase
      .from('collection_cards')
      .select('card:cards(*)')
      .eq('collection_id', id)
      .order('display_order', { ascending: true });

    if (linksError) {
      return NextResponse.json({ error: linksError.message }, { status: 500 });
    }

    type RawForkCardLink = {
      card: Tables<'cards'> | null;
    };

    const sourceCards = ((cardLinks || []) as unknown as RawForkCardLink[])
      .map((l) => l.card)
      .filter((card): card is Tables<'cards'> => card !== null);

    if (sourceCards.length === 0) {
      return NextResponse.json({
        has_duplicates: false,
        threshold,
        total_cards: 0,
        new_cards_count: 0,
        duplicates_count: 0,
        duplicate_items: [],
        new_card_ids: [],
      });
    }

    // 4. Lấy danh sách từ hiện có trong kho cá nhân của user
    const { data: userCards, error: userCardsError } = await supabase
      .from('cards')
      .select('id, word, part_of_speech, definition')
      .eq('owner_id', user.id);

    if (userCardsError) {
      return NextResponse.json({ error: userCardsError.message }, { status: 500 });
    }

    const myCards = userCards || [];

    // 5. Phân tích tương đồng
    const duplicate_items: Array<{
      source_card_id: string;
      source_word: string;
      source_pos: string | null;
      source_definition: string;
      matched_card_id: string;
      matched_word: string;
      matched_pos: string | null;
      matched_definition: string;
      similarity: number;
    }> = [];

    const new_card_ids: string[] = [];

    for (const src of sourceCards) {
      let bestMatch: (typeof myCards)[0] | null = null;
      let maxSimilarity = 0;

      for (const myCard of myCards) {
        const sim = calculateWordSimilarity(src.word, myCard.word);
        if (sim > maxSimilarity) {
          maxSimilarity = sim;
          bestMatch = myCard;
        }
        // Nếu trùng tuyệt đối 100% thì dừng sớm vòng lặp
        if (maxSimilarity === 100) break;
      }

      if (maxSimilarity >= threshold && bestMatch) {
        duplicate_items.push({
          source_card_id: src.id,
          source_word: src.word,
          source_pos: src.part_of_speech,
          source_definition: src.definition,
          matched_card_id: bestMatch.id,
          matched_word: bestMatch.word,
          matched_pos: bestMatch.part_of_speech,
          matched_definition: bestMatch.definition,
          similarity: maxSimilarity,
        });
      } else {
        new_card_ids.push(src.id);
      }
    }

    return NextResponse.json({
      has_duplicates: duplicate_items.length > 0,
      threshold,
      total_cards: sourceCards.length,
      new_cards_count: new_card_ids.length,
      duplicates_count: duplicate_items.length,
      duplicate_items,
      new_card_ids,
    });
  } catch (err: unknown) {
    console.error('Analyze fork error:', err);
    const msg = err instanceof Error ? err.message : 'Lỗi phân tích trùng lặp khi clone';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
