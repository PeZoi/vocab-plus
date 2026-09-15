import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEmptyCard } from '@/lib/fsrs';
import {
  normalizePartOfSpeech,
  normalizeCardType,
  normalizeCEFRLevel,
} from '@/utils/card-normalizer';
import type { BulkCreateCardsDto, BulkCreateCardsResponse } from '@/types/ai-topic.types';
import type { Card } from '@/types/card.types';
import type { Json } from '@/types/database.types';

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

    const body: BulkCreateCardsDto = await request.json();
    const cardsToCreate = Array.isArray(body?.cards) ? body.cards : [];

    if (cardsToCreate.length === 0) {
      return NextResponse.json(
        { error: 'Danh sách thẻ từ vựng không được rỗng' },
        { status: 400 }
      );
    }

    const createdCards: Card[] = [];
    const now = new Date();

    for (const item of cardsToCreate) {
      const trimmedWord = item.word?.trim();
      if (!trimmedWord) continue;

      const { data: card, error: cardError } = await supabase
        .from('cards')
        .insert({
          owner_id: user.id,
          word: trimmedWord,
          ipa: item.ipa?.trim() || null,
          definition: item.definition?.trim() || item.definition_en?.trim() || '',
          definition_en: item.definition_en?.trim() || null,
          example_sentence: item.example_sentence?.trim() || null,
          example_translation: item.example_translation?.trim() || null,
          part_of_speech: normalizePartOfSpeech(item.part_of_speech),
          card_type: normalizeCardType(item.card_type, trimmedWord, item.part_of_speech),
          source_type: item.source_type || 'ai_generated',
          sense_number: item.sense_number || 1,
          cefr_level: normalizeCEFRLevel(item.cefr_level),
          tags: Array.isArray(item.tags) ? item.tags : [],
          image_url: item.image_url || null,
          audio_url: item.audio_url || null,
          mnemonic: item.mnemonic || null,
          collocations: Array.isArray(item.collocations)
            ? (item.collocations as unknown as Json)
            : [],
          word_family: Array.isArray(item.word_family)
            ? (item.word_family as unknown as Json)
            : [],
        })
        .select()
        .single();

      if (cardError || !card) {
        console.error('Lỗi tạo thẻ trong batch:', cardError);
        continue;
      }

      // Khởi tạo trạng thái FSRS trong bảng user_cards
      const emptyFsrs = createEmptyCard(now);
      await supabase.from('user_cards').insert({
        user_id: user.id,
        card_id: card.id,
        stability: emptyFsrs.stability,
        difficulty: emptyFsrs.difficulty,
        due_at: emptyFsrs.due.toISOString(),
        state: 'new',
        review_count: 0,
        lapse_count: 0,
      });

      createdCards.push(card);
    }

    const responseData: BulkCreateCardsResponse = {
      success: true,
      message: `Đã lưu thành công ${createdCards.length} từ vựng vào kho!`,
      created_count: createdCards.length,
      cards: createdCards,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo thẻ hàng loạt';
    console.error('[CARDS_BULK] Error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
