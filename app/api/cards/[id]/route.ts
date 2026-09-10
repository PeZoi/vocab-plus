import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  normalizePartOfSpeech,
  normalizeCardType,
  normalizeCEFRLevel,
} from '@/utils/card-normalizer';
import type { Card, CardWithProgress, UpdateCardDto, UserCard } from '@/types/card.types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
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

    const { data, error } = await supabase
      .from('cards')
      .select('*, user_cards(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Không tìm thấy thẻ từ vựng' }, { status: 404 });
    }

    type CardWithUserCards = Card & {
      user_cards?: UserCard[] | UserCard | null;
    };

    const cardData = data as unknown as CardWithUserCards;
    const userCards = cardData.user_cards;
    const userCard: UserCard | null = Array.isArray(userCards)
      ? userCards.find((uc) => uc.user_id === user.id) || userCards[0] || null
      : userCards || null;

    const responseData: CardWithProgress = {
      ...cardData,
      user_card: userCard,
      is_owner: cardData.owner_id === user.id,
    };

    return NextResponse.json(responseData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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

    const body: UpdateCardDto = await request.json();

    const updatePayload: Record<string, unknown> = {};
    if (body.word !== undefined) updatePayload.word = body.word.trim();
    if (body.ipa !== undefined) updatePayload.ipa = body.ipa?.trim() || null;
    if (body.definition !== undefined) updatePayload.definition = body.definition.trim();
    if (body.definition_en !== undefined) updatePayload.definition_en = body.definition_en?.trim() || null;
    if (body.example_sentence !== undefined) updatePayload.example_sentence = body.example_sentence?.trim() || null;
    if (body.example_translation !== undefined) updatePayload.example_translation = body.example_translation?.trim() || null;
    if (body.part_of_speech !== undefined) updatePayload.part_of_speech = normalizePartOfSpeech(body.part_of_speech);
    if (body.card_type !== undefined) updatePayload.card_type = normalizeCardType(body.card_type, body.word, body.part_of_speech);
    if (body.cefr_level !== undefined) updatePayload.cefr_level = normalizeCEFRLevel(body.cefr_level);
    if (body.tags !== undefined) updatePayload.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.image_url !== undefined) updatePayload.image_url = body.image_url;
    if (body.audio_url !== undefined) updatePayload.audio_url = body.audio_url;
    if (body.mnemonic !== undefined) updatePayload.mnemonic = body.mnemonic?.trim() || null;
    if (body.collocations !== undefined) updatePayload.collocations = body.collocations;
    if (body.word_family !== undefined) updatePayload.word_family = body.word_family;

    const { data, error } = await supabase
      .from('cards')
      .update(updatePayload)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('*, user_cards(*)')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Không thể cập nhật thẻ' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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

    // Xóa card (cascade sẽ xóa user_cards và review_logs liên quan nếu có FK cascade, hoặc xóa trực tiếp)
    await supabase.from('user_cards').delete().eq('card_id', id).eq('user_id', user.id);
    await supabase.from('review_logs').delete().eq('card_id', id).eq('user_id', user.id);

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa thẻ từ vựng' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
