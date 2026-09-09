import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { SentenceGradeRequest, SentenceGradeResponse } from '@/types/practice.types';
import {
  getProviderEndpoint,
  getDefaultModelForProvider,
  getProviderDisplayName,
  getProviderHeaders,
  parseAIErrorResponse,
  isTransientAIError,
} from './providers';
import { extractAndParseJson } from './json-parser';

export interface RequestAISentenceGradingOptions extends SentenceGradeRequest {
  supabase: SupabaseClient<Database>;
}

export async function requestAISentenceGrading({
  word,
  user_sentence,
  target_meaning,
  supabase,
}: RequestAISentenceGradingOptions): Promise<SentenceGradeResponse> {
  const safeWord = word.trim().slice(0, 100);
  const safeSentence = user_sentence.trim().slice(0, 500);
  const safeMeaning = target_meaning ? target_meaning.trim().slice(0, 200) : '';

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
      `Chưa có API key cho AI Provider (${providerDisplayName})! Vui lòng kiểm tra cài đặt Admin.`
    );
  }

  const prompt = `You are a friendly, expert English teacher evaluating a sentence written by a Vietnamese student.
Target vocabulary word: "${safeWord}"
${safeMeaning ? `Target word meaning: "${safeMeaning}"` : ''}
Student's sentence: "${safeSentence}"

TASK:
1. Verify if the target word "${safeWord}" is used correctly and grammatically in the sentence.
2. Evaluate grammar accuracy (0-100) and vocabulary/collocation naturalness (0-100).
3. Compute an overall score (0-100). If the sentence is grammatically correct and uses the word naturally, score >= 80.
4. If there are errors (tense, agreement, preposition, unnatural phrasing), list each in "errors" array.
5. Provide a constructive, encouraging feedback explanation in Vietnamese ("feedback_vi").
6. Provide an improved, more natural native-speaker version of the sentence ("improved_sentence").

CRITICAL INSTRUCTION:
Return ONLY valid JSON matching this schema with NO markdown code blocks or reasoning:
{
  "score": 85,
  "is_correct": true,
  "grammar_score": 90,
  "vocabulary_score": 80,
  "feedback_vi": "Câu của bạn rất tốt! Bạn đã sử dụng từ chính xác trong ngữ cảnh này...",
  "improved_sentence": "An improved natural sentence",
  "explanation_vi": "Giải thích cấu trúc ngữ pháp ngắn gọn...",
  "errors": [
    {
      "original_part": "part with error",
      "correction": "corrected part",
      "reason": "lý do sửa lỗi bằng tiếng Việt"
    }
  ]
}`;

  const endpoint = getProviderEndpoint(providerName);
  const headers = getProviderHeaders(providerName, apiKey);

  const maxRetries = 4;
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
              'You are an expert English language teacher and grader. Return ONLY pure JSON adhering to the specified schema.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (response.ok) {
      break;
    }

    const errBody = await response.text();
    console.error(`${providerDisplayName} Sentence Grader Error (Lần ${attempt}/${maxRetries}):`, errBody);

    const errMsg = parseAIErrorResponse(response.status, response.statusText, errBody, providerDisplayName);
    lastErrorMsg = errMsg;

    if (isTransientAIError(response.status) && attempt < maxRetries) {
      const delayMs = attempt * 1500;
      await new Promise((res) => setTimeout(res, delayMs));
      continue;
    }

    throw new Error(`Lỗi khi gọi ${providerDisplayName}: ${errMsg}`);
  }

  if (!response || !response.ok) {
    throw new Error(
      `${providerDisplayName} không phản hồi thành công sau ${maxRetries} lần thử lại: ${lastErrorMsg}`
    );
  }

  const resJson = await response.json();
  const rawContent = resJson.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('AI không phản hồi nội dung chấm điểm.');
  }

  const parsed = extractAndParseJson<SentenceGradeResponse>(rawContent);
  return {
    score: typeof parsed.score === 'number' ? parsed.score : 70,
    is_correct: Boolean(parsed.is_correct ?? parsed.score >= 70),
    grammar_score: typeof parsed.grammar_score === 'number' ? parsed.grammar_score : 70,
    vocabulary_score: typeof parsed.vocabulary_score === 'number' ? parsed.vocabulary_score : 70,
    feedback_vi: parsed.feedback_vi || 'Đã hoàn thành chấm điểm câu.',
    improved_sentence: parsed.improved_sentence || safeSentence,
    explanation_vi: parsed.explanation_vi,
    errors: Array.isArray(parsed.errors) ? parsed.errors : [],
  };
}
