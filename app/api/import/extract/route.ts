import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  cleanWord,
  isValidEnglishWord,
  ENGLISH_STOP_WORDS,
  extractSentenceAroundWord,
  calculateReadingStats,
} from '@/utils/text-extractor';
import type { DetectedWord, ExtractWordsResponse } from '@/types/imported-text.types';

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

    const { raw_text } = await request.json();

    if (!raw_text || typeof raw_text !== 'string' || !raw_text.trim()) {
      return NextResponse.json({ error: 'Nội dung văn bản không hợp lệ' }, { status: 400 });
    }

    const trimmedText = raw_text.trim();
    const baseStats = calculateReadingStats(trimmedText);

    // 1. Lấy toàn bộ từ vựng hiện có trong kho của user để đối chiếu
    const { data: userCards, error: cardsError } = await supabase
      .from('cards')
      .select('id, word, cefr_level, definition_en, definition')
      .eq('owner_id', user.id);

    if (cardsError) {
      return NextResponse.json({ error: cardsError.message }, { status: 500 });
    }

    // Tạo lookup map cho các từ đã học
    const knownWordsMap = new Map<string, {
      id: string;
      cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
      definition_en?: string;
      definition?: string;
    }>();

    if (userCards) {
      for (const card of userCards) {
        if (card.word) {
          knownWordsMap.set(card.word.toLowerCase().trim(), {
            id: card.id,
            cefr_level: (card.cefr_level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2') || null,
            definition_en: card.definition_en || undefined,
            definition: card.definition || undefined,
          });
        }
      }
    }

    // 2. Bóc tách toàn bộ từ tiếng Anh trong văn bản và đếm tần suất
    const rawWordMatches = trimmedText.match(/[a-zA-Z]+(?:['’-][a-zA-Z]+)*/g) || [];
    const frequencyMap = new Map<string, number>();

    for (const rawMatch of rawWordMatches) {
      if (isValidEnglishWord(rawMatch)) {
        const cleaned = cleanWord(rawMatch);
        if (cleaned && cleaned.length >= 2 && !ENGLISH_STOP_WORDS.has(cleaned)) {
          frequencyMap.set(cleaned, (frequencyMap.get(cleaned) || 0) + 1);
        }
      }
    }

    // 3. Xây dựng danh sách DetectedWord
    const detectedWords: DetectedWord[] = [];
    let knownCount = 0;
    let newCount = 0;

    for (const [word, frequency] of frequencyMap.entries()) {
      const knownInfo = knownWordsMap.get(word);
      const is_known = Boolean(knownInfo);

      if (is_known) {
        knownCount++;
      } else {
        newCount++;
      }

      const context_sentence = extractSentenceAroundWord(trimmedText, word);

      detectedWords.push({
        word,
        frequency,
        is_known,
        known_card_id: knownInfo?.id,
        cefr_level: knownInfo?.cefr_level || null,
        definition_en: knownInfo?.definition_en,
        definition: knownInfo?.definition,
        context_sentence,
      });
    }

    // 4. Sắp xếp: Từ mới chưa học lên trước, sau đó sắp xếp theo tần suất xuất hiện giảm dần
    detectedWords.sort((a, b) => {
      if (a.is_known !== b.is_known) {
        return a.is_known ? 1 : -1; // Chưa học (is_known = false) đứng trước
      }
      return b.frequency - a.frequency; // Tần suất cao hơn đứng trước
    });

    const responseData: ExtractWordsResponse = {
      words: detectedWords,
      stats: {
        total_words: baseStats.total_words,
        unique_words: frequencyMap.size,
        known_words: knownCount,
        new_words: newCount,
        reading_time_minutes: baseStats.reading_time_minutes,
      },
    };

    return NextResponse.json(responseData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
