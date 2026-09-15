import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  GenerateTopicWordsRequest,
  GenerateTopicWordsResponse,
  TopicGeneratedWord,
} from '@/types/ai-topic.types';
import type { CollocationItem, WordFamilyItem } from '@/types/card.types';
import {
  getProviderEndpoint,
  getDefaultModelForProvider,
  getProviderDisplayName,
  getProviderHeaders,
  parseAIErrorResponse,
  isTransientAIError,
} from './providers';
import { extractAndParseJson } from './json-parser';
import {
  normalizePartOfSpeech,
  normalizeCardType,
  normalizeCEFRLevel,
} from '@/utils/card-normalizer';

export interface RequestAITopicWordsOptions extends GenerateTopicWordsRequest {
  userId?: string;
  supabase: SupabaseClient<Database>;
}

export async function requestAITopicWords({
  topic,
  description,
  cefr_levels = [],
  count = 12,
  userId,
  supabase,
}: RequestAITopicWordsOptions): Promise<GenerateTopicWordsResponse> {
  const safeTopic = topic.trim().slice(0, 150);
  const safeDescription = description ? description.trim().slice(0, 400) : undefined;
  const targetCount = Math.min(Math.max(Math.round(count) || 12, 10), 15);
  const safeLevels = Array.isArray(cefr_levels) && cefr_levels.length > 0
    ? cefr_levels.filter(Boolean)
    : [];

  // 1. Lấy AI Provider config đang active/default từ database
  const { data: aiConfig } = await supabase
    .from('ai_provider_configs')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  const providerName = aiConfig?.provider_name || 'groq';
  const providerDisplayName = getProviderDisplayName(providerName, aiConfig?.display_name);
  const apiKey = aiConfig?.api_key || process.env.GROQ_API_KEY;
  const defaultModel = getDefaultModelForProvider(providerName);
  const model = aiConfig?.model || defaultModel;

  if (!apiKey) {
    throw new Error(
      `Chưa có API key cho AI Provider (${providerDisplayName})! Vui lòng vào trang Quản trị (Admin) để cập nhật API Key.`
    );
  }

  const prompt = `Generate a curated list of exactly ${targetCount} essential English vocabulary items (words, phrasal verbs, collocations, idioms) related to the topic: "${safeTopic}".
${safeDescription ? `Detailed Context / Topic Description: "${safeDescription}".\n` : ''}
${safeLevels.length > 0
      ? `CEFR Level Requirement: Strictly choose vocabulary items whose difficulty matches one of the following levels: ${safeLevels.join(', ')}.\n`
      : 'CEFR Level Requirement: Provide a balanced, useful mix from B1 to C1 levels.\n'
    }
REQUIREMENTS FOR EACH VOCABULARY ITEM:
1. "word": Standard dictionary base form (lemma) in English (e.g. "buy" instead of "bought", "go" instead of "goes").
2. "ipa": International Phonetic Alphabet pronunciation (e.g. "/.../").
3. "card_type": "word" (single word), "phrasal_verb", or "idiom".
4. "cefr_level": One of "A1", "A2", "B1", "B2", "C1", "C2".
5. "part_of_speech": One of "noun", "verb", "adjective", "adverb", "preposition", "conjunction", "pronoun", "interjection".
6. "definition_en": Clear, concise, and accurate English definition explaining the meaning in simple terms.
7. "definition": Định nghĩa bằng tiếng Việt rõ ràng, dễ hiểu.
8. "vietnamese_hint": Nghĩa của từ tiếng Anh đó (e.g. "buy: mua", "look after: chăm sóc").
9. "example_sentence": A simple English example sentence illustrating the word in the context of "${safeTopic}".
10. "example_translation": Bản dịch tiếng Việt chính xác của câu ví dụ tiếng Anh trên.
11. "tags": Array of 1-3 lowercase hashtag strings including the topic (e.g. "#vocab"]).
12. "collocations": 1-2 common collocations with meaning and example:
    [ { "phrase": "common collocation", "meaning": "nghĩa tiếng Việt ngắn", "example": "example sentence" } ]
13. "word_family": 1-2 related words in the same word family:
    [ { "word": "từ cùng gốc", "part_of_speech": "noun | verb | adjective | adverb", "meaning": "nghĩa tiếng Việt ngắn", "example": "câu ví dụ tiếng Anh" } ]
14. "mnemonic": Mẹo liên tưởng / mẹo ghi nhớ bằng tiếng Việt sinh động, dễ nhớ.

CRITICAL INSTRUCTION:
Do not include <think> tags or internal reasoning. Return ONLY a single valid JSON object adhering strictly to this schema:
{
  "topic": "${safeTopic}",
  "words": [
    {
      "word": "dictionary base form in standard English",
      "ipa": "/.../",
      "card_type": "word | phrasal_verb | idiom",
      "cefr_level": "A1 | A2 | B1 | B2 | C1 | C2",
      "part_of_speech": "noun | verb | adjective | adverb | preposition | conjunction | pronoun | interjection",
      "definition_en": "Clear, concise, and accurate English definition explaining the meaning in simple terms",
      "definition": "Định nghĩa bằng tiếng Việt rõ ràng, dễ hiểu",
      "vietnamese_hint": "nghĩa vắn tắt (vd: innovate: đổi mới, sáng tạo)",
      "example_sentence": "A simple English example sentence",
      "example_translation": "Bản dịch tiếng Việt chính xác của câu ví dụ",
      "tags": ["#tag1", "#tag2"],
      "collocations": [
        { "phrase": "phrase", "meaning": "nghĩa tiếng Việt", "example": "example" }
      ],
      "word_family": [
        { "word": "từ cùng gốc", "part_of_speech": "noun", "meaning": "nghĩa", "example": "example" }
      ],
      "mnemonic": "Mẹo ghi nhớ tiếng Việt sinh động"
    }
  ]
}`;

  const endpoint = getProviderEndpoint(providerName);
  const headers = getProviderHeaders(providerName, apiKey);

  const maxRetries = 5;
  let response: Response | null = null;
  let lastErrorMsg = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert English-Vietnamese lexicographer and linguist. You generate practical, high-value vocabulary lists for given topics and return pure JSON without <think> tags or internal reasoning.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 4500,
      }),
    });

    if (response.ok) {
      break;
    }

    const errBody = await response.text();
    console.error(
      `${providerDisplayName} Topic Words API Error (Lần thử ${attempt}/${maxRetries}):`,
      errBody
    );

    const errMsg = parseAIErrorResponse(
      response.status,
      response.statusText,
      errBody,
      providerDisplayName
    );
    lastErrorMsg = errMsg;

    if (!isTransientAIError(response.status)) {
      throw new Error(`Lỗi khi gọi ${providerDisplayName}: ${errMsg}`);
    }

    if (attempt < maxRetries) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfterHeader ? parseFloat(retryAfterHeader) : null;
      const waitMs =
        retryAfterSeconds && !isNaN(retryAfterSeconds)
          ? Math.min(Math.max(retryAfterSeconds, 1), 6) * 1000
          : attempt * 1500;

      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  if (!response || !response.ok) {
    throw new Error(
      `${providerDisplayName} không phản hồi thành công sau ${maxRetries} lần thử lại: ${lastErrorMsg}`
    );
  }

  const json = await response.json();
  const choice = json.choices?.[0];
  let rawContent = choice?.message?.content || choice?.text || '';

  if (!rawContent && choice?.message?.reasoning_content) {
    rawContent = choice.message.reasoning_content;
  }

  if (!rawContent) {
    throw new Error('AI không trả về dữ liệu danh sách từ vựng');
  }

  interface RawAITopicResponse {
    topic?: string;
    words?: unknown[];
  }

  const parsed = extractAndParseJson<RawAITopicResponse>(rawContent);
  const rawWords = Array.isArray(parsed.words) ? parsed.words : [];

  if (rawWords.length === 0) {
    throw new Error('Không thể trích xuất danh sách từ vựng từ phản hồi của AI');
  }

  // 2. Kiểm tra các từ đã có sẵn trong kho của người dùng (nếu có userId)
  const existingWordMap = new Map<string, string>();
  if (userId) {
    try {
      const { data: userCards } = await supabase
        .from('cards')
        .select('id, word')
        .eq('owner_id', userId);

      if (userCards && userCards.length > 0) {
        for (const c of userCards) {
          existingWordMap.set(c.word.trim().toLowerCase(), c.id);
        }
      }
    } catch (dbErr) {
      console.warn('Không thể kiểm tra từ trùng lặp từ DB:', dbErr);
    }
  }

  // 3. Chuẩn hóa từng từ đồng bộ với cấu trúc của word-analyzer
  const normalizedWords: TopicGeneratedWord[] = [];

  for (const item of rawWords) {
    if (!item || typeof item !== 'object') continue;
    const wordObj = item as Record<string, unknown>;

    const wordStr = typeof wordObj.word === 'string' ? wordObj.word.trim() : '';
    if (!wordStr) continue;

    const lowerWord = wordStr.toLowerCase();
    const isExisting = existingWordMap.has(lowerWord);
    const existingCardId = existingWordMap.get(lowerWord);

    const pos = normalizePartOfSpeech(wordObj.part_of_speech) || 'noun';
    const cardType = normalizeCardType(wordObj.card_type, wordStr, pos);
    const cefr = normalizeCEFRLevel(wordObj.cefr_level) || safeLevels[0] || 'B1';

    const definition =
      typeof wordObj.definition === 'string' && wordObj.definition.trim()
        ? wordObj.definition.trim()
        : typeof wordObj.definition_en === 'string'
          ? wordObj.definition_en.trim()
          : wordStr;

    const definitionEn =
      typeof wordObj.definition_en === 'string' && wordObj.definition_en.trim()
        ? wordObj.definition_en.trim()
        : undefined;

    const vietnameseHint =
      typeof wordObj.vietnamese_hint === 'string' && wordObj.vietnamese_hint.trim()
        ? wordObj.vietnamese_hint.trim()
        : undefined;

    const exampleSentence =
      typeof wordObj.example_sentence === 'string' && wordObj.example_sentence.trim()
        ? wordObj.example_sentence.trim()
        : `This is an example of ${wordStr}.`;

    const exampleTranslation =
      typeof wordObj.example_translation === 'string' && wordObj.example_translation.trim()
        ? wordObj.example_translation.trim()
        : undefined;

    const rawTags = Array.isArray(wordObj.tags) ? wordObj.tags : [];
    const formattedTags: string[] = [];
    for (const t of rawTags) {
      if (typeof t === 'string' && t.trim()) {
        const cleanT = t.trim();
        formattedTags.push(cleanT.startsWith('#') ? cleanT : `#${cleanT}`);
      }
    }

    if (formattedTags.length === 0) {
      const topicTag = safeTopic.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (topicTag) formattedTags.push(`#${topicTag}`);
    }

    const collocations: CollocationItem[] = [];
    if (Array.isArray(wordObj.collocations)) {
      for (const col of wordObj.collocations) {
        if (col && typeof col === 'object') {
          const colRecord = col as Record<string, unknown>;
          if (typeof colRecord.phrase === 'string' && colRecord.phrase.trim()) {
            collocations.push({
              phrase: colRecord.phrase.trim(),
              meaning: typeof colRecord.meaning === 'string' ? colRecord.meaning.trim() : undefined,
              example: typeof colRecord.example === 'string' ? colRecord.example.trim() : undefined,
            });
          }
        }
      }
    }

    const wordFamily: WordFamilyItem[] = [];
    if (Array.isArray(wordObj.word_family)) {
      for (const wf of wordObj.word_family) {
        if (wf && typeof wf === 'object') {
          const wfRecord = wf as Record<string, unknown>;
          if (typeof wfRecord.word === 'string' && wfRecord.word.trim()) {
            wordFamily.push({
              word: wfRecord.word.trim(),
              part_of_speech: typeof wfRecord.part_of_speech === 'string' ? wfRecord.part_of_speech.trim() : 'noun',
              meaning: typeof wfRecord.meaning === 'string' ? wfRecord.meaning.trim() : undefined,
              example: typeof wfRecord.example === 'string' ? wfRecord.example.trim() : undefined,
            });
          }
        }
      }
    }

    const mnemonic =
      typeof wordObj.mnemonic === 'string' && wordObj.mnemonic.trim()
        ? wordObj.mnemonic.trim()
        : undefined;

    normalizedWords.push({
      word: wordStr,
      ipa: typeof wordObj.ipa === 'string' ? wordObj.ipa.trim() : undefined,
      card_type: cardType,
      cefr_level: cefr,
      part_of_speech: pos,
      definition,
      definition_en: definitionEn,
      vietnamese_hint: vietnameseHint,
      example_sentence: exampleSentence,
      example_translation: exampleTranslation,
      tags: formattedTags,
      collocations: collocations.length > 0 ? collocations : undefined,
      word_family: wordFamily.length > 0 ? wordFamily : undefined,
      mnemonic,
      is_existing: isExisting,
      existing_card_id: existingCardId,
    });
  }

  return {
    topic: parsed.topic || safeTopic,
    description: safeDescription,
    cefr_levels: safeLevels,
    words: normalizedWords.slice(0, 15),
  };
}
