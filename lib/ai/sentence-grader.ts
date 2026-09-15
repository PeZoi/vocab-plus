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

  const prompt = `You are a friendly, encouraging English teacher evaluating a sentence written by a Vietnamese student in a vocabulary learning application.

TARGET VOCABULARY WORD TO PRACTICE: "${safeWord}"
${safeMeaning ? `TARGET DEFINITION / SENSE: "${safeMeaning}"` : ''}
STUDENT'S SUBMITTED SENTENCE: "${safeSentence}"

CRITICAL EVALUATION GUIDELINES (PLEASE READ VERY CAREFULLY):

1. ABSOLUTE RULE: DO NOT CARE ABOUT PUNCTUATION OR CAPITALIZATION (HOÀN TOÀN BỎ QUA DẤU CÂU & VIẾT HOA):
   - DO NOT deduct ANY points for missing periods (.), commas (,), question marks (?), or quotation marks at the end of the sentence.
   - DO NOT deduct ANY points if the sentence starts with a lowercase letter (e.g., "my company has a league" vs "My company has a league").
   - DO NOT list missing punctuation or capitalization as an error in "errors".
   - DO NOT complain about or mention "thiếu dấu chấm câu", "dấu chấm ở cuối câu", or "viết hoa đầu câu" in "feedback_vi". Punctuation and capitalization are completely optional for the student.

2. THREE CORE EVALUATION CRITERIA (3 TIÊU CHÍ CHÍNH DUY NHẤT ĐỂ CHẤM ĐIỂM):
   Your evaluation MUST focus ONLY on these 3 aspects:
   a. NGỮ PHÁP (Grammar):
      - Is the sentence grammatically well-formed (subject, verb, agreement)?
      - The student IS FULLY ALLOWED to conjugate "${safeWord}" into any appropriate grammatical form or tense (e.g., past simple: -ed, continuous: -ing, 3rd person singular: -s/-es, perfect, passive voice, plural nouns, etc.). Any valid tense/inflection of "${safeWord}" is 100% accepted.
   b. NGỮ NGHĨA (Semantics & Vocabulary Usage):
      - Is "${safeWord}" used with an appropriate meaning in this sentence context?
      - Does the sentence make logical sense?
   c. CHÍNH TẢ (Spelling):
      - Are words spelled correctly (e.g., "colleague" not "collegue")?

3. FAIR & ENCOURAGING SCORING PHILOSOPHY (KHÔNG TRỪ ĐIỂM VÌ CÂU ĐƠN GIẢN HOẶC CHƯA BẢN XỨ):
   - If the student's sentence has correct grammar, understandable meaning, and correct spelling (such as "My company has a league" or "I like this idea"):
     => It MUST receive a HIGH score (85 - 100) and "is_correct": true!
     => NEVER give a low score (< 70) or fail a student just because their sentence is short, simple, or could be phrased more idiomatically by a native speaker!
   - Native speaker suggestions belong SOLELY in "native_suggestion" and part 2 of "feedback_vi" as helpful, friendly tips for self-improvement. They must NEVER be used to lower the student's score or fail them!

SCORING TIERS (0 - 100):
- Score 85 - 100 ("is_correct": true): Target word "${safeWord}" is used correctly in meaning, grammar is sound, and spelling is correct. Punctuation/capitalization ignored.
- Score 70 - 84 ("is_correct": true): Meaning is clear and target word is used properly, but has minor grammatical slips (e.g., slight article a/an/the misuse or minor typo) that do not hinder understanding.
- Score 50 - 69 ("is_correct": false): Has noticeable grammar mistake or misspelling that weakens clarity, or confused word form.
- Score < 50 ("is_correct": false): Incomprehensible, severe broken grammar, or "${safeWord}" is used with completely wrong meaning.

FEEDBACK FORMAT (in Vietnamese):
In "feedback_vi", format strictly as:
"1. Ngữ pháp & Ngữ nghĩa: [Nhận xét câu bạn viết: từ '${safeWord}' đã dùng đúng nghĩa và chia đúng ngữ pháp chưa, có lỗi ngữ pháp hoặc chính tả nào cần lưu ý không. Tuyệt đối không nhắc về dấu chấm câu hay viết hoa]"
"2. Gợi ý tự nhiên hơn: [Gợi ý thân thiện cách người bản xứ hay diễn đạt tự nhiên hơn trong ngữ cảnh này để học viên tham khảo thêm]"

CRITICAL INSTRUCTION:
Return ONLY valid JSON matching this schema with NO markdown code blocks or reasoning:
{
  "score": 90,
  "is_correct": true,
  "grammar_score": 90,
  "vocabulary_score": 90,
  "feedback_vi": "1. Ngữ pháp & Ngữ nghĩa: ...\\n2. Gợi ý tự nhiên hơn: ...",
  "improved_sentence": "Corrected student sentence strictly keeping \\"${safeWord}\\"",
  "native_suggestion": "Natural native sentence (e.g. how natives naturally say it in this context)",
  "explanation_vi": "Giải thích ngắn gọn cấu trúc sử dụng của từ vựng...",
  "errors": [
    {
      "original_part": "part with error",
      "correction": "corrected part",
      "reason": "lý do sửa lỗi bằng tiếng Việt (chỉ về ngữ pháp, từ vựng hoặc chính tả, tuyệt đối không nhắc dấu câu)"
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
    is_correct: Boolean(parsed.is_correct !== undefined ? parsed.is_correct : (parsed.score ?? 70) >= 60),
    grammar_score: typeof parsed.grammar_score === 'number' ? parsed.grammar_score : 70,
    vocabulary_score: typeof parsed.vocabulary_score === 'number' ? parsed.vocabulary_score : 70,
    feedback_vi: parsed.feedback_vi || 'Đã hoàn thành chấm điểm câu.',
    improved_sentence: parsed.improved_sentence || safeSentence,
    native_suggestion: parsed.native_suggestion,
    explanation_vi: parsed.explanation_vi,
    errors: Array.isArray(parsed.errors) ? parsed.errors : [],
  };
}
