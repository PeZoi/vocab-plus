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

  const prompt = `You are a friendly, expert English teacher evaluating a sentence written by a Vietnamese student in a vocabulary learning application.

TARGET VOCABULARY WORD TO PRACTICE: "${safeWord}"
${safeMeaning ? `TARGET DEFINITION / SENSE: "${safeMeaning}"` : ''}
STUDENT'S SUBMITTED SENTENCE: "${safeSentence}"

CONTEXT & CORE RULES:
1. GRAMMATICAL INFLECTIONS / TENSES ALLOWED:
   - The student IS FULLY ALLOWED to conjugate "${safeWord}" into any appropriate tense or grammatical form (e.g., past simple: -ed, 3rd person singular: -s/-es, continuous: -ing, perfect: has/have + V3, passive voice, plurals, etc.) matching their sentence context.
   - Any correct grammatical form/tense of "${safeWord}" is 100% valid and welcomed.

2. TWO-STEP EVALUATION METHODOLOGY:
   When evaluating the student's sentence, ALWAYS follow these 2 DISTINCT STEPS:

   - BƯỚC 1: ĐÁNH GIÁ NGỮ PHÁP & CHÍNH TẢ CỦA CÂU HỌC VIÊN
     * Check if the student's sentence has correct grammar, proper tense conjugation of "${safeWord}", correct spelling (e.g. "collegue" -> "colleague"), and correct punctuation (e.g. no unnecessary commas).
     * Even if a native speaker might phrase the thought differently in daily conversation, if the student's sentence is grammatically sound and correctly spelled, score it fairly based on grammatical accuracy and effort!
     * In "improved_sentence": Provide the corrected version of THE STUDENT'S OWN SENTENCE, STRICTLY KEEPING "${safeWord}" (conjugated appropriately), fixing only grammar, spelling, and punctuation errors.

   - BƯỚC 2: LỜI KHUYÊN CÁCH DÙNG TỰ NHIÊN CỦA NGƯỜI BẢN XỨ
     * In "feedback_vi": Structure your Vietnamese feedback with two clear labeled parts:
       "1. Ngữ pháp & Chính tả: [Nhận xét câu bạn viết: từ '${safeWord}' đã chia thì đúng chưa, có lỗi chính tả hoặc dấu câu nào cần sửa không]"
       "2. Lời khuyên người bản xứ: [Giải thích trong ngữ cảnh thực tế này, người bản xứ thường diễn đạt thế nào, sắc thái văn cảnh của từ '${safeWord}' ra sao]"
     * In "native_suggestion": Provide the most authentic, natural sentence that a native English speaker would actually say in this real-life situation (for example, if the student wrote "I present myself every time I meet a new colleague", the native suggestion would be "I introduce myself every time I meet a new colleague." because "present oneself" is overly formal for daily peer greetings). If the student's sentence using "${safeWord}" is already the most natural native way, set "native_suggestion" to the same as "improved_sentence".

SCORING GUIDELINE (0 - 100):
- Score >= 80: "${safeWord}" is used in a good context with proper tense, and the sentence has correct grammar and spelling.
- Score 65 - 79: The target word is used with good intent, but has minor spelling errors (e.g., "collegue"), comma splices, or awkward phrasing.
- Score < 60: "${safeWord}" is severely ungrammatical, contradicts the target meaning, or is incomprehensible.

CRITICAL INSTRUCTION:
Return ONLY valid JSON matching this schema with NO markdown code blocks or reasoning:
{
  "score": 80,
  "is_correct": true,
  "grammar_score": 85,
  "vocabulary_score": 75,
  "feedback_vi": "1. Ngữ pháp & Chính tả: Câu của bạn đã chia thì cho '${safeWord}' đúng...\\n2. Lời khuyên người bản xứ: Trong ngữ cảnh này, người bản xứ thường dùng...",
  "improved_sentence": "Corrected student sentence strictly keeping \\"${safeWord}\\"",
  "native_suggestion": "Natural native sentence (e.g. how natives naturally say it in this context)",
  "explanation_vi": "Giải thích ngắn gọn cấu trúc sử dụng của từ vựng...",
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
    native_suggestion: parsed.native_suggestion,
    explanation_vi: parsed.explanation_vi,
    errors: Array.isArray(parsed.errors) ? parsed.errors : [],
  };
}
