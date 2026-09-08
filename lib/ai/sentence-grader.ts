import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { SentenceGradeRequest, SentenceGradeResponse } from '@/types/practice.types';
import { getProviderEndpoint } from './word-analyzer';
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
  const providerDisplayName =
    aiConfig?.display_name || (providerName === 'orcarouter' ? 'OrcaRouter' : 'Groq');
  const apiKey = aiConfig?.api_key || process.env.GROQ_API_KEY;
  const defaultModel =
    providerName === 'orcarouter'
      ? 'meta-llama/llama-3.3-70b-instruct'
      : 'llama-3.3-70b-versatile';
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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (providerName === 'orcarouter') {
    headers['HTTP-Referer'] = 'https://vocabapp.plus';
    headers['X-Title'] = 'VocabApp';
  }

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

    let errMsg = response.statusText;
    try {
      const errJson = JSON.parse(errBody);
      errMsg = errJson.error?.message || errBody;
    } catch {
      errMsg = errBody.slice(0, 300);
    }
    lastErrorMsg = errMsg;

    if (response.status === 429 && attempt < maxRetries) {
      const delayMs = attempt * 2000;
      await new Promise((res) => setTimeout(res, delayMs));
      continue;
    }

    throw new Error(`Lỗi AI Grader (${providerDisplayName}): ${errMsg}`);
  }

  if (!response || !response.ok) {
    throw new Error(`Không thể kết nối tới AI Provider: ${lastErrorMsg}`);
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
