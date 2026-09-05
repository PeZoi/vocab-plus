import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEmptyCard } from '@/lib/fsrs';
import type { CreateCardDto } from '@/types/card.types';

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
      query = query.or(`word.ilike.%${search}%,definition.ilike.%${search}%,example_sentence.ilike.%${search}%`);
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

    return NextResponse.json(data);
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

    if (!body.word || !body.definition) {
      return NextResponse.json(
        { error: 'Từ vựng và Định nghĩa là bắt buộc' },
        { status: 400 }
      );
    }

    // 1. Tạo bản ghi trong bảng cards
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        owner_id: user.id,
        word: body.word.trim(),
        ipa: body.ipa?.trim() || null,
        definition: body.definition.trim(),
        example_sentence: body.example_sentence?.trim() || null,
        part_of_speech: body.part_of_speech || null,
        card_type: body.card_type || 'word',
        source_type: body.source_type || 'manual',
        sense_number: body.sense_number || 1,
        cefr_level: body.cefr_level || null,
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
