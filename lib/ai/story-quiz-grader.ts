import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  GradeStoryEssayRequest,
  GradeStoryEssayResponse,
} from '@/types/story-quiz.types';
import {
  getProviderEndpoint,
  getDefaultModelForProvider,
  getProviderDisplayName,
  getProviderHeaders,
  parseAIErrorResponse,
  isTransientAIError,
} from './providers';
import { extractAndParseJson } from './json-parser';

export interface RequestAIStoryEssayGradingOptions extends GradeStoryEssayRequest {
  supabase: SupabaseClient<Database>;
}

export async function requestAIStoryEssayGrading({
  story_text,
  question,
  sample_answer,
  user_answer,
  supabase,
}: RequestAIStoryEssayGradingOptions): Promise<GradeStoryEssayResponse> {
  const safeStory = story_text.trim().slice(0, 6000);
  const safeQuestion = question.trim().slice(0, 500);
  const safeSample = sample_answer.trim().slice(0, 1000);
  const safeAnswer = user_answer.trim().slice(0, 1500);

  if (!safeAnswer) {
    return {
      score: 0,
      is_correct: false,
      feedback_vi: 'Bạn chưa nhập câu trả lời.',
      suggestions_vi: 'Hãy đọc lại đoạn văn liên quan trong câu chuyện và viết câu trả lời bằng tiếng Anh.',
    };
  }

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

  const prompt = `You are an encouraging, experienced English reading instructor assessing a Vietnamese student's reading comprehension essay response.

CONTEXT STORY:
"""
${safeStory}
"""

READING COMPREHENSION QUESTION:
"${safeQuestion}"

REFERENCE / SAMPLE ANSWER:
"${safeSample}"

STUDENT'S SUBMITTED RESPONSE:
"${safeAnswer}"

EVALUATION RULES:
1. FACTUAL ACCURACY: Check if the student's answer correctly reflects the events, motives, or facts in the story.
2. LENIENCY ON MINOR MECHANICS: Do NOT penalize strictly for missing punctuation or capitalization. Focus on reading comprehension and clear expression.
3. SCORING (0 to 100):
   * 85 - 100: Accurate, complete, well-expressed.
   * 65 - 84: Correct main ideas, minor wording or detail omissions (PASS).
   * 40 - 64: Partially correct, misses key details or slight misunderstanding.
   * 0 - 39: Inaccurate, irrelevant, or contradicts the story.
4. "is_correct": true if score >= 60, false otherwise.
5. "feedback_vi": Clear, supportive evaluation in Vietnamese. Point out what they got right and what was missing or incorrect compared to the story.
6. "suggestions_vi": Helpful tips in Vietnamese to write a stronger answer.
7. "corrected_answer": A polished, natural English version of their answer.

Return ONLY a valid JSON object matching this schema (no <think> tags, no markdown backticks):

{
  "score": 85,
  "is_correct": true,
  "feedback_vi": "Nhận xét chi tiết bằng tiếng Việt...",
  "suggestions_vi": "Gợi ý cách diễn đạt hoặc bổ sung ý...",
  "corrected_answer": "A polished English sentence..."
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
              'You are an expert English teacher evaluating reading comprehension answers. Return strictly pure JSON without reasoning text or <think> tags.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (response.ok) {
      break;
    }

    const errBody = await response.text();
    console.error(`${providerDisplayName} Story Grading API Error (Attempt ${attempt}/${maxRetries}):`, errBody);

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
  const rawContent = choice?.message?.content || choice?.text || '';

  const parsed = extractAndParseJson<GradeStoryEssayResponse>(rawContent);

  if (!parsed || typeof parsed.score !== 'number') {
    throw new Error('AI không trả về kết quả chấm điểm hợp lệ.');
  }

  const normalizedScore = Math.max(0, Math.min(100, Math.round(parsed.score)));

  return {
    score: normalizedScore,
    is_correct: parsed.is_correct ?? (normalizedScore >= 60),
    feedback_vi: parsed.feedback_vi || 'Đã chấm điểm câu trả lời.',
    suggestions_vi: parsed.suggestions_vi || 'Xem lại câu trả lời mẫu để củng cố kỹ năng đọc hiểu.',
    corrected_answer: parsed.corrected_answer || safeSample,
  };
}
