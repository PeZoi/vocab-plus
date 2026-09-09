import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { GenerateStoryRequest, GenerateStoryResponse } from '@/types/imported-text.types';
import {
  getProviderEndpoint,
  getDefaultModelForProvider,
  getProviderDisplayName,
  getProviderHeaders,
  parseAIErrorResponse,
  isTransientAIError,
} from './providers';
import { extractAndParseJson } from './json-parser';

export interface RequestAIStoryOptions extends GenerateStoryRequest {
  supabase: SupabaseClient<Database>;
}

export async function requestAIStoryGeneration({
  level,
  genre = 'Daily Life',
  topic,
  target_words = [],
  supabase,
}: RequestAIStoryOptions): Promise<GenerateStoryResponse> {
  const safeLevel = level || 'B1';
  const safeGenre = genre.trim().slice(0, 50);
  const safeTopic = topic ? topic.trim().slice(0, 200) : undefined;
  const safeWords = Array.isArray(target_words)
    ? target_words.map((w) => String(w).trim().slice(0, 50)).filter(Boolean).slice(0, 15)
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

  const prompt = `Write an engaging, high-quality English story tailored for an English language learner.

SPECIFICATIONS:
- CEFR Target Level: ${safeLevel}
  * A1/A2: Simple present/past tense, short sentences, everyday fundamental vocabulary.
  * B1/B2: Moderate sentence variety, standard tenses, accessible descriptive adjectives and adverbs.
  * C1/C2: Rich vocabulary, complex sentence structures, nuance, and advanced idiomatic expressions.
- Genre: ${safeGenre}
${safeTopic ? `- Topic / Premise: "${safeTopic}"` : `- Topic: Create a fascinating, relatable scenario appropriate for the ${safeGenre} genre.`}
${
  safeWords.length > 0
    ? `- TARGET VOCABULARY TO RECYCLE & HIGHLIGHT: You MUST naturally incorporate the following ${safeWords.length} words/phrases into the story:
${safeWords.map((w) => `  * ${w}`).join('\n')}
Make sure these target words fit seamlessly into the narrative without feeling forced.`
    : ''
}
- WORD COUNT REQUIREMENT: Strictly between 100 and 250 words total. Do NOT write fewer than 100 words, and do NOT exceed 250 words.

IMPORTANT INSTRUCTION:
Do not include <think> tags or internal reasoning. Return ONLY a single valid JSON object (no markdown backticks, no text before or after).
{
  "title": "A captivating, concise English title (3-7 words)",
  "text": "The full English story with 2-3 paragraphs, natural dialogue or narrative flow (100 - 250 words).",
  "used_words": [${safeWords.map((w) => `"${w}"`).join(', ')}]
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
              'You are an expert English linguist, creative novelist, and educator for Vietnamese English learners. You write vivid, educational stories at specified CEFR levels and return pure JSON without <think> tags.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3500, // Tăng token để đáp ứng reasoning models (DeepSeek R1) không bị nghẽn ngắt giữa chừng
      }),
    });

    if (response.ok) {
      break;
    }

    const errBody = await response.text();
    console.error(`${providerDisplayName} Story API Error (Lần thử ${attempt}/${maxRetries}):`, errBody);

    const errMsg = parseAIErrorResponse(response.status, response.statusText, errBody, providerDisplayName);
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

  // Trường hợp model reasoning (DeepSeek R1) trả nội dung vào reasoning_content khi content rỗng
  if (!rawContent && choice?.message?.reasoning_content) {
    rawContent = choice.message.reasoning_content;
  }

  if (!rawContent) {
    throw new Error('AI không trả về nội dung câu chuyện');
  }

  try {
    const parsed = extractAndParseJson<{
      title?: string;
      text?: string;
      used_words?: string[];
    }>(rawContent);

    return {
      title: parsed.title || 'Untitled Story',
      text: parsed.text || '',
      used_words: Array.isArray(parsed.used_words) ? parsed.used_words : safeWords,
    };
  } catch (parseError) {
    console.warn('extractAndParseJson thất bại, kích hoạt cơ chế fallback regex:', parseError);

    // Fallback: Trích xuất bằng Regular Expression nếu JSON có ký tự trích dẫn đối thoại lồng nhau
    const cleanStr = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    const titleMatch = cleanStr.match(/"title"\s*:\s*"([^"\n\r]*)"/i);
    const textMatch = cleanStr.match(
      /"text"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:used_words|target_words|words)"|"\s*\}|$)/i
    );

    const title = titleMatch ? titleMatch[1].trim() : 'AI Story';
    const text = textMatch
      ? textMatch[1]
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, ' ')
          .trim()
      : cleanStr.replace(/\{[\s\S]*?\}/g, '').trim() || cleanStr;

    return {
      title,
      text,
      used_words: safeWords,
    };
  }
}

