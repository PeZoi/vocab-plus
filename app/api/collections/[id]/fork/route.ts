import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEmptyCard } from '@/lib/fsrs';
import type { Tables } from '@/types/database.types';

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

    // 1. Fetch original collection
    const { data: original, error: colError } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (colError || !original) {
      return NextResponse.json({ error: 'Không tìm thấy bộ sưu tập để clone' }, { status: 404 });
    }

    if (!original.is_public && original.creator_id !== user.id) {
      return NextResponse.json({ error: 'Bộ sưu tập này không công khai' }, { status: 403 });
    }

    // 2. Fetch all cards in the original collection
    const { data: cardLinks, error: linksError } = await supabase
      .from('collection_cards')
      .select('card:cards(*)')
      .eq('collection_id', id)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Error fetching cards for fork:', linksError);
      return NextResponse.json({ error: linksError.message }, { status: 500 });
    }

    type RawForkCardLink = {
      card: Tables<'cards'> | null;
    };

    const allCards = ((cardLinks || []) as unknown as RawForkCardLink[])
      .map((l) => l.card)
      .filter((card): card is Tables<'cards'> => card !== null);

    // Đọc body nếu có truyền danh sách thẻ cụ thể cần clone
    let selectedCardIds: string[] | null = null;
    try {
      const body = await request.json();
      if (body && Array.isArray(body.selected_card_ids)) {
        selectedCardIds = body.selected_card_ids;
      }
    } catch {
      // Gọi thông thường không có body JSON
    }

    const cardsToClone = selectedCardIds !== null
      ? allCards.filter((c) => selectedCardIds!.includes(c.id))
      : allCards;
    const skippedCount = allCards.length - cardsToClone.length;

    // 3. Create a personal cloned collection for the user
    const { data: clonedCollection, error: createColError } = await supabase
      .from('collections')
      .insert({
        creator_id: user.id,
        title: `${original.title} (Bản sao)`,
        description: original.description,
        cover_image: original.cover_image,
        category: original.category,
        is_public: false,
        tags: original.tags || [],
      })
      .select()
      .single();

    if (createColError || !clonedCollection) {
      console.error('Error creating cloned collection:', createColError);
      return NextResponse.json({ error: createColError?.message || 'Không thể tạo bộ sưu tập mới' }, { status: 500 });
    }

    // 4. Clone cards and initialize FSRS states
    let clonedCount = 0;
    const initialFsrsCard = createEmptyCard();

    for (let i = 0; i < cardsToClone.length; i++) {
      const srcCard = cardsToClone[i];

      // Insert new card belonging to the current user
      const { data: newCard, error: cardInsertError } = await supabase
        .from('cards')
        .insert({
          owner_id: user.id,
          word: srcCard.word,
          definition: srcCard.definition,
          definition_en: srcCard.definition_en,
          ipa: srcCard.ipa,
          example_sentence: srcCard.example_sentence,
          example_translation: srcCard.example_translation,
          part_of_speech: srcCard.part_of_speech,
          card_type: srcCard.card_type || 'word',
          cefr_level: srcCard.cefr_level,
          tags: srcCard.tags || [],
          source_type: 'imported',
          audio_url: srcCard.audio_url,
          image_url: srcCard.image_url,
          mnemonic: srcCard.mnemonic,
          collocations: srcCard.collocations,
          word_family: srcCard.word_family,
        })
        .select()
        .single();

      if (cardInsertError || !newCard) {
        console.warn('Error cloning card:', cardInsertError);
        continue;
      }

      // Initialize FSRS user_cards record
      await supabase.from('user_cards').insert({
        user_id: user.id,
        card_id: newCard.id,
        state: 'new',
        due_at: initialFsrsCard.due.toISOString(),
        stability: initialFsrsCard.stability,
        difficulty: initialFsrsCard.difficulty,
        review_count: 0,
        lapse_count: 0,
        is_leech: false,
      });

      // Link into the new user collection
      await supabase.from('collection_cards').insert({
        collection_id: clonedCollection.id,
        card_id: newCard.id,
        display_order: i,
      });

      clonedCount++;
    }

    // 5. Increment fork_count on original collection
    await supabase
      .from('collections')
      .update({
        fork_count: (original.fork_count || 0) + 1,
      })
      .eq('id', id);

    const successMsg = skippedCount > 0
      ? `Đã sao chép thành công ${clonedCount} thẻ từ vựng vào kho cá nhân (đã bỏ qua ${skippedCount} từ trùng lặp)!`
      : `Đã sao chép thành công ${clonedCount} thẻ từ vựng vào kho cá nhân!`;

    return NextResponse.json({
      success: true,
      message: successMsg,
      collection: clonedCollection,
      cards_cloned: clonedCount,
      cards_skipped: skippedCount,
    }, { status: 201 });
  } catch (err: unknown) {
    console.error('Fork collection error:', err);
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi clone bộ từ';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
