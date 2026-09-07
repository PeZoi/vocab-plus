import type { AIWordAnalysisResponse } from '@/types/card.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { extractAndParseJson } from './json-parser';

export function getProviderEndpoint(providerName?: string): string {
  switch (providerName?.toLowerCase()) {
    case 'orcarouter':
      return 'https://api.orcarouter.ai/v1/chat/completions';
    case 'openrouter':
      return 'https://openrouter.ai/api/v1/chat/completions';
    case 'groq':
    default:
      return 'https://api.groq.com/openai/v1/chat/completions';
  }
}

export interface RequestAIAnalysisOptions {
  word: string;
  context_sentence?: string;
  supabase: SupabaseClient<Database>;
}

export async function requestAIWordAnalysis({
  word,
  context_sentence,
  supabase,
}: RequestAIAnalysisOptions): Promise<AIWordAnalysisResponse> {
  const safeWord = word.trim().slice(0, 100);
  const safeContext = context_sentence && typeof context_sentence === 'string'
    ? context_sentence.trim().slice(0, 500)
    : undefined;

  // 1. Lấy AI Provider config đang active/default từ database
  const { data: aiConfig } = await supabase
    .from('ai_provider_configs')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .single();

  const providerName = aiConfig?.provider_name || 'groq';
  const providerDisplayName = aiConfig?.display_name || (providerName === 'orcarouter' ? 'OrcaRouter' : 'Groq');
  const apiKey = aiConfig?.api_key || process.env.GROQ_API_KEY;
  const defaultModel =
    providerName === 'orcarouter'
      ? 'meta-llama/llama-3.3-70b-instruct'
      : 'llama-3.3-70b-versatile';
  const model = aiConfig?.model || defaultModel;

  if (!apiKey) {
    throw new Error(
      `Chưa có API key cho AI Provider (${providerDisplayName})! Vui lòng vào trang Quản trị (Admin) để cập nhật API Key.`
    );
  }

  const prompt = `Analyze the English word or phrase: "${safeWord}".
${safeContext ? `Context from reading: "${safeContext}".\n` : ''}
REQUIREMENTS:
1. Context priority: ${safeContext ? `Provide the definition and sense matching the context above as the FIRST sense in "senses".` : `Provide the most common sense as the first sense.`}
2. Accurate translation: ${safeContext ? `Translate the full context sentence accurately and naturally into Vietnamese for "context_translation".` : `Provide an empty string "" for "context_translation".`}
3. Spelling rule: If misspelled, correct it in "word" and set "is_corrected": true with "original_word": "${safeWord}". Otherwise set "is_corrected": false.
4. Topic tags: Include 1-3 English topic tags with '#' in "tags" (e.g., ["#work", "#daily"]) if relevant, otherwise an empty array [].

CRITICAL INSTRUCTION:
Do not include <think> tags or internal reasoning. Return ONLY a single valid JSON object adhering to this schema:
{
  "word": "standard English word",
  "original_word": "${safeWord}",
  "is_corrected": false,
  "ipa": "/.../",
  "card_type": "word",
  "cefr_level": "A1 | A2 | B1 | B2 | C1 | C2",
${safeContext ? `  "context_sentence": "${safeContext}",\n  "context_translation": "Bản dịch tiếng Việt chính xác của câu ngữ cảnh trên",` : ''}
  "senses": [
    {
      "part_of_speech": "noun | verb | adjective | adverb | preposition | conjunction | pronoun | interjection",
      "definition_en": "Clear, concise, and accurate English definition explaining the meaning in simple terms",
      "definition": "Định nghĩa bằng tiếng Việt rõ ràng, dễ hiểu",
      "vietnamese_hint": "Nghĩa ngắn gọn 1-3 từ tiếng Việt",
      "example_sentence": "A simple English example sentence",
      "example_translation": "Bản dịch tiếng Việt chính xác của câu ví dụ tiếng Anh trên",
      "tags": ["#tag1", "#tag2"]
    }
  ],
  "collocations": [
    {
      "phrase": "common collocation",
      "meaning": "nghĩa tiếng Việt ngắn",
      "example": "example sentence"
    }
  ],
  "word_family": [
    {
      "word": "từ cùng gốc",
      "part_of_speech": "noun | verb | adjective | adverb",
      "meaning": "nghĩa tiếng Việt ngắn",
      "example": "câu ví dụ tiếng Anh đơn giản minh họa từ này"
    }
  ],
  "mnemonic": "Mẹo liên tưởng / mẹo ghi nhớ bằng tiếng Việt sinh động, dễ nhớ"
}`;

  const endpoint = getProviderEndpoint(providerName);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (providerName === 'orcarouter') {
    headers['HTTP-Referer'] = 'https://vocabapp.plus';
    headers['X-Title'] = 'VocabApp';
  }

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
              'You are an expert English-Vietnamese lexicographer and linguist. Analyze vocabulary accurately and return pure JSON without <think> tags or internal reasoning.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 3500,
      }),
    });

    if (response.ok) {
      break;
    }

    const errBody = await response.text();
    console.error(`${providerDisplayName} API Error (Lần thử ${attempt}/${maxRetries}):`, errBody);

    let errMsg = response.statusText;
    try {
      const errJson = JSON.parse(errBody);
      errMsg = errJson.error?.message || errBody;
    } catch {
      errMsg = errBody;
    }
    lastErrorMsg = errMsg;

    if (response.status !== 429) {
      throw new Error(`Lỗi khi gọi ${providerDisplayName}: ${errMsg}`);
    }

    if (attempt < maxRetries) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfterHeader ? parseFloat(retryAfterHeader) : null;
      const waitMs = retryAfterSeconds && !isNaN(retryAfterSeconds)
        ? Math.min(Math.max(retryAfterSeconds, 1), 6) * 1000
        : attempt * 2000;

      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  if (!response || !response.ok) {
    throw new Error(
      `${providerDisplayName} đạt giới hạn lượt gọi (Rate Limit 429) sau ${maxRetries} lần thử lại: ${lastErrorMsg}.`
    );
  }

  const json = await response.json();
  const choice = json.choices?.[0];
  let rawContent = choice?.message?.content || choice?.text || '';

  // Nếu content rỗng nhưng reasoning_content có chứa JSON hoàn chỉnh
  if (!rawContent && choice?.message?.reasoning_content) {
    const reasoning = choice.message.reasoning_content;
    if (reasoning.includes('{') && reasoning.includes('}')) {
      rawContent = reasoning;
    }
  }

  if (!rawContent) {
    if (choice?.finish_reason === 'length') {
      throw new Error('Mô hình AI đã vượt quá giới hạn token (finish_reason: length) khi suy luận. Vui lòng bấm thử lại.');
    }
    throw new Error('AI không trả về nội dung phân tích từ vựng');
  }

  return extractAndParseJson<AIWordAnalysisResponse>(rawContent);
}

