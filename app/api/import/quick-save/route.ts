import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requestAIWordAnalysis } from '@/lib/ai/word-analyzer';
import { createEmptyCard } from '@/lib/fsrs';
import {
  normalizePartOfSpeech,
  normalizeCardType,
  normalizeCEFRLevel,
} from '@/utils/card-normalizer';
import type { QuickSaveWordDto } from '@/types/imported-text.types';
import type { Json } from '@/types/database.types';

export const maxDuration = 90;

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

    const body: QuickSaveWordDto = await request.json();
    const word = body.word?.trim();

    if (!word) {
      return NextResponse.json({ error: 'Từ vựng là bắt buộc' }, { status: 400 });
    }

    // 1. Kiểm tra xem từ đã có trong kho từ của user chưa
    const { data: existingCard } = await supabase
      .from('cards')
      .select('*, user_cards(*)')
      .eq('owner_id', user.id)
      .ilike('word', word)
      .maybeSingle();

    if (existingCard) {
      return NextResponse.json({
        card: existingCard,
        is_already_saved: true,
        message: `Từ "${word}" đã có sẵn trong kho từ vựng của bạn!`,
      });
    }

    // 2. Phân tích từ bằng AI Word Analyzer theo ngữ cảnh câu được truyền vào
    const analysis = await requestAIWordAnalysis({
      word,
      context_sentence: body.context_sentence,
      supabase,
    });

    const primarySense = analysis.senses[0] || {
      part_of_speech: 'noun',
      definition_en: word,
      definition: word,
      example_sentence: body.context_sentence || word,
      example_translation: '',
      tags: [],
    };

    // Chuẩn bị tags: chỉ lấy các tags từ AI
    const tagsSet = new Set<string>();
    if (primarySense.tags && Array.isArray(primarySense.tags)) {
      primarySense.tags.forEach((t) => {
        const clean = t.startsWith('#') ? t : `#${t}`;
        tagsSet.add(clean.toLowerCase());
      });
    }

    // 3. Tạo thẻ mới trong bảng cards
    const finalWord = analysis.is_corrected ? analysis.word : word;
    const finalExampleSentence = body.context_sentence || primarySense.example_sentence;
    const finalExampleTranslation =
      (body.context_sentence && analysis.context_translation) ||
      primarySense.example_translation ||
      null;

    const { data: newCard, error: cardError } = await supabase
      .from('cards')
      .insert({
        owner_id: user.id,
        word: finalWord,
        ipa: analysis.ipa || null,
        definition: primarySense.definition || primarySense.definition_en,
        definition_en: primarySense.definition_en || null,
        example_sentence: finalExampleSentence || null,
        example_translation: finalExampleTranslation,
        part_of_speech: normalizePartOfSpeech(primarySense.part_of_speech) || 'noun',
        card_type: normalizeCardType(analysis.card_type, finalWord, primarySense.part_of_speech),
        source_type: 'imported',
        sense_number: 1,
        cefr_level: normalizeCEFRLevel(analysis.cefr_level),
        tags: Array.from(tagsSet),
        mnemonic: analysis.mnemonic || null,
        collocations: (analysis.collocations || []) as unknown as Json,
        word_family: (analysis.word_family || []) as unknown as Json,
      })
      .select()
      .single();

    if (cardError || !newCard) {
      return NextResponse.json({ error: cardError?.message || 'Không thể tạo thẻ mới' }, { status: 500 });
    }

    // 4. Khởi tạo trạng thái FSRS trong bảng user_cards
    const emptyFsrs = createEmptyCard();
    const { data: userCardProgress, error: fsrsError } = await supabase
      .from('user_cards')
      .insert({
        user_id: user.id,
        card_id: newCard.id,
        stability: emptyFsrs.stability,
        difficulty: emptyFsrs.difficulty,
        due_at: emptyFsrs.due.toISOString(),
        state: 'new',
        review_count: 0,
        lapse_count: 0,
        is_leech: false,
      })
      .select()
      .single();

    if (fsrsError) {
      console.error('Lỗi khởi tạo FSRS state:', fsrsError);
    }

    const cardWithProgress = {
      ...newCard,
      user_cards: userCardProgress ? [userCardProgress] : [],
    };

    return NextResponse.json({
      card: cardWithProgress,
      is_already_saved: false,
      message: `Đã lưu thành công từ "${finalWord}" kèm ngữ cảnh vào kho từ!`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
