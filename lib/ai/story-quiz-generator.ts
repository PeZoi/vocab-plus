import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type {
  GenerateStoryQuizRequest,
  GenerateStoryQuizResponse,
  StoryQuizQuestion,
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

export interface RequestAIStoryQuizOptions extends GenerateStoryQuizRequest {
  supabase: SupabaseClient<Database>;
}

export async function requestAIStoryQuizGeneration({
  story_text,
  story_title,
  mode = 'multiple_choice',
  question_count,
  supabase,
}: RequestAIStoryQuizOptions): Promise<GenerateStoryQuizResponse> {
  const safeText = story_text.trim().slice(0, 8000);
  const safeTitle = story_title ? story_title.trim().slice(0, 200) : 'Story';
  const targetCount = question_count && question_count >= 5 ? question_count : (mode === 'mixed' ? 6 : 5);

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

  let promptInstruction = '';
  if (mode === 'multiple_choice') {
    promptInstruction = `Generate exactly ${targetCount} MULTIPLE-CHOICE reading comprehension questions.
Each question MUST have:
- "id": "q1", "q2", etc.
- "type": "multiple_choice"
- "question": A clear, meaningful English question about main ideas, specific details, character actions, or vocabulary in context.
- "options": An array of exactly 4 distinct options [A, B, C, D] in English.
- "correct_index": Integer 0, 1, 2, or 3 corresponding to the correct option.
- "explanation_vi": A thorough, friendly explanation in Vietnamese quoting or referencing the exact part of the story explaining why this answer is correct.`;
  } else if (mode === 'essay') {
    promptInstruction = `Generate exactly ${targetCount} OPEN-ENDED / SHORT-ESSAY reading comprehension questions.
Each question MUST have:
- "id": "q1", "q2", etc.
- "type": "essay"
- "question": A clear English question testing reading comprehension (e.g., summarizing an event, analyzing a character's motive, explaining a cause-and-effect).
- "sample_answer": A high-quality model answer in English (1-3 sentences) directly answering the question based on the text.
- "evaluation_criteria": Brief English criteria specifying the key factual points or keywords required for full credit.`;
  } else {
    // mixed mode
    const mcqCount = Math.ceil(targetCount / 2);
    const essayCount = targetCount - mcqCount;
    promptInstruction = `Generate a MIXED set of exactly ${targetCount} reading comprehension questions: ${mcqCount} multiple-choice questions followed by ${essayCount} short-essay questions.
- For multiple_choice questions: "type": "multiple_choice", "question", "options" (4 options), "correct_index" (0-3), "explanation_vi" in Vietnamese.
- For essay questions: "type": "essay", "question", "sample_answer" in English, "evaluation_criteria" in English.`;
  }

  const prompt = `You are an expert English language educator and reading comprehension specialist for Vietnamese students.
Create a set of high-quality reading comprehension questions based STRICTLY and ENTIRELY on the following English story.

STORY TITLE: "${safeTitle}"
STORY CONTENT:
"""
${safeText}
"""

TASK:
${promptInstruction}

CRITICAL RULES:
1. Every question MUST be answerable using facts, events, or vocabulary directly found in the story. Do NOT invent details outside the text.
2. The questions should vary in difficulty (literal recall, inference, vocabulary in context).
3. "explanation_vi" MUST be written in natural, helpful Vietnamese.
4. Return ONLY a valid JSON object matching this schema (no <think> tags, no markdown codeblocks):

{
  "story_title": "${safeTitle}",
  "mode": "${mode}",
  "questions": [
    // Array of ${targetCount} questions matching the requested mode
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
              'You are a professional IELTS / CEFR English reading exam writer. You design rigorous reading comprehension quizzes and always return strictly pure JSON without <think> tags or reasoning text.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 3500,
      }),
    });

    if (response.ok) {
      break;
    }

    const errBody = await response.text();
    console.error(`${providerDisplayName} Story Quiz API Error (Attempt ${attempt}/${maxRetries}):`, errBody);

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

  const parsed = extractAndParseJson<GenerateStoryQuizResponse>(rawContent);

  if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('AI không trả về cấu trúc câu hỏi hợp lệ. Vui lòng thử lại!');
  }

  // Chuẩn hóa và gán id cho từng câu hỏi
  const normalizedQuestions: StoryQuizQuestion[] = parsed.questions.map((q, idx) => {
    const qId = q.id || `q-${idx + 1}-${Date.now()}`;
    if (q.type === 'essay') {
      return {
        id: qId,
        type: 'essay',
        question: q.question || 'Answer based on the story',
        sample_answer: q.sample_answer || '',
        evaluation_criteria: q.evaluation_criteria || 'Relevance to story content',
      };
    }

    // Default to multiple_choice
    const options = Array.isArray(q.options) && q.options.length >= 4
      ? (q.options.slice(0, 4) as [string, string, string, string])
      : ['A', 'B', 'C', 'D'] as [string, string, string, string];

    return {
      id: qId,
      type: 'multiple_choice',
      question: q.question || 'Choose the correct answer',
      options,
      correct_index: typeof q.correct_index === 'number' && q.correct_index >= 0 && q.correct_index < 4
        ? q.correct_index
        : 0,
      explanation_vi: q.explanation_vi || 'Đáp án chính xác được rút ra từ bài đọc.',
    };
  });

  return {
    story_title: parsed.story_title || safeTitle,
    mode: mode,
    questions: normalizedQuestions,
  };
}
