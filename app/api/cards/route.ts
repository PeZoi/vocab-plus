import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEmptyCard } from '@/lib/fsrs';
import type { CreateCardDto } from '@/types/card.types';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('cards')
      .select('*, user_cards(*)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

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
        image_url: body.image_url || null,
        audio_url: body.audio_url || null,
        mnemonic: body.mnemonic || null,
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
      // rollback or log error
      console.error('Error creating user_card:', userCardError);
    }

    return NextResponse.json(card, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
