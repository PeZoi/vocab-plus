import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEmptyCard } from '@/lib/fsrs';
import { calculateWordSimilarity } from '@/utils/text-similarity';
import {
  normalizePartOfSpeech,
  normalizeCardType,
  normalizeCEFRLevel,
} from '@/utils/card-normalizer';
import type { Card, CardWithProgress, CreateCardDto, UserCard } from '@/types/card.types';

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
    const search = searchParams.get('search')?.trim();
    const cefr_level = searchParams.get('cefr_level');
    const tag = searchParams.get('tag');
    const part_of_speech = searchParams.get('part_of_speech');
    const sort_by = searchParams.get('sort_by') || 'created_desc';

    let query = supabase
      .from('cards')
      .select('*, user_cards(*)')
      .eq('owner_id', user.id);

    if (search) {
      query = query.or(`word.ilike.%${search}%,definition.ilike.%${search}%,definition_en.ilike.%${search}%,example_sentence.ilike.%${search}%`);
    }

    if (cefr_level && cefr_level !== 'all') {
      query = query.eq('cefr_level', cefr_level);
    }

    if (tag && tag !== 'all') {
      const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
      query = query.contains('tags', [formattedTag]);
    }

    if (part_of_speech && part_of_speech !== 'all') {
      query = query.eq('part_of_speech', part_of_speech);
    }

    // Sort order
    if (sort_by === 'created_asc') {
      query = query.order('created_at', { ascending: true });
    } else if (sort_by === 'alpha_asc') {
      query = query.order('word', { ascending: true });
    } else if (sort_by === 'alpha_desc') {
      query = query.order('word', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    type CardWithUserCards = Card & {
      user_cards?: UserCard[] | UserCard | null;
    };

    const formatted: CardWithProgress[] = ((data || []) as unknown as CardWithUserCards[]).map((card) => {
      const userCards = card.user_cards;
      const userCard: UserCard | null = Array.isArray(userCards)
        ? userCards.find((uc) => uc.user_id === user.id) || userCards[0] || null
        : userCards || null;

      return {
        ...card,
        user_card: userCard,
        is_owner: card.owner_id === user.id,
      };
    });

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
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

    const body: CreateCardDto = await request.json();

    if (!body.word || (!body.definition && !body.definition_en)) {
      return NextResponse.json(
        { error: 'Từ vựng và Định nghĩa là bắt buộc' },
        { status: 400 }
      );
    }

    const trimmedWord = body.word.trim();

    // 0. Kiểm tra trùng lặp nếu không có cờ force
    if (!body.force) {
      // Đọc threshold từ system_settings
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
        console.warn('Cannot read threshold setting, fallback to 80%:', e);
      }

      // Lấy danh sách từ của user
      const { data: existingCards } = await supabase
        .from('cards')
        .select('id, word, part_of_speech, definition')
        .eq('owner_id', user.id);

      if (existingCards && existingCards.length > 0) {
        let bestMatch: (typeof existingCards)[0] | null = null;
        let maxSimilarity = 0;

        for (const ec of existingCards) {
          const sim = calculateWordSimilarity(trimmedWord, ec.word);
          if (sim > maxSimilarity) {
            maxSimilarity = sim;
            bestMatch = ec;
          }
          if (maxSimilarity === 100) break;
        }

        if (maxSimilarity >= threshold && bestMatch) {
          return NextResponse.json(
            {
              error: 'DUPLICATE_WORD_DETECTED',
              message: `Từ vựng "${trimmedWord}" có độ tương đồng ${maxSimilarity}% với từ "${bestMatch.word}" trong kho của bạn.`,
              similarity: maxSimilarity,
              threshold,
              matched_card: bestMatch,
            },
            { status: 409 }
          );
        }
      }
    }

    // 1. Tạo bản ghi trong bảng cards
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        owner_id: user.id,
        word: trimmedWord,
        ipa: body.ipa?.trim() || null,
        definition: body.definition?.trim() || body.definition_en?.trim() || '',
        definition_en: body.definition_en?.trim() || null,
        example_sentence: body.example_sentence?.trim() || null,
        example_translation: body.example_translation?.trim() || null,
        part_of_speech: normalizePartOfSpeech(body.part_of_speech),
        card_type: normalizeCardType(body.card_type, trimmedWord, body.part_of_speech),
        source_type: body.source_type || 'manual',
        sense_number: body.sense_number || 1,
        cefr_level: normalizeCEFRLevel(body.cefr_level),
        tags: body.tags && Array.isArray(body.tags) ? body.tags : [],
        image_url: body.image_url || null,
        audio_url: body.audio_url || null,
        mnemonic: body.mnemonic || null,
        collocations: body.collocations && Array.isArray(body.collocations) ? (body.collocations as unknown as import('@/types/database.types').Json) : [],
        word_family: body.word_family && Array.isArray(body.word_family) ? (body.word_family as unknown as import('@/types/database.types').Json) : [],
      })
      .select()
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: cardError?.message }, { status: 500 });
    }

    // 2. Khởi tạo trạng thái FSRS trong bảng user_cards
    const emptyFsrs = createEmptyCard(new Date());
    const { error: userCardError } = await supabase
      .from('user_cards')
      .insert({
        user_id: user.id,
        card_id: card.id,
        stability: emptyFsrs.stability,
        difficulty: emptyFsrs.difficulty,
        due_at: emptyFsrs.due.toISOString(),
        state: 'new',
        review_count: 0,
        lapse_count: 0,
        is_leech: false,
      });

    if (userCardError) {
      console.error('Error creating user_card:', userCardError);
    }

    return NextResponse.json(card, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const body = await request.json();
    const { card_ids } = body;

    if (!Array.isArray(card_ids) || card_ids.length === 0) {
      return NextResponse.json(
        { error: 'Danh sách card_ids không hợp lệ hoặc rỗng' },
        { status: 400 }
      );
    }

    // 1. Xóa các bản ghi liên quan trong user_cards, review_logs, collection_cards
    await supabase.from('user_cards').delete().in('card_id', card_ids).eq('user_id', user.id);
    await supabase.from('review_logs').delete().in('card_id', card_ids).eq('user_id', user.id);
    await supabase.from('collection_cards').delete().in('card_id', card_ids);

    // 2. Xóa các cards thuộc quyền sở hữu của user
    const { error, count } = await supabase
      .from('cards')
      .delete({ count: 'exact' })
      .in('id', card_ids)
      .eq('owner_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa thành công ${count ?? card_ids.length} thẻ từ vựng`,
      deleted_count: count ?? card_ids.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
