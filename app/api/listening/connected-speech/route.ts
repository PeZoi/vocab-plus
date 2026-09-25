import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getProviderDisplayName,
  getDefaultModelForProvider,
  getProviderHeaders,
  parseAIErrorResponse,
} from '@/lib/ai/providers';
import { extractAndParseJson } from '@/lib/ai/json-parser';
import type { ConnectedSpeechTip } from '@/types/listening.types';

export async function POST(req: Request) {
  try {
    const { sentence } = (await req.json()) as { sentence?: string };
    if (!sentence || sentence.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Thiếu nội dung câu cần phân tích.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Lấy AI config đang active/default
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
      // Fallback cục bộ nếu chưa cấu hình AI Provider
      return NextResponse.json({
        success: true,
        data: {
          sentence,
          phoneticPhantoms: [
            {
              phrase: 'Connected Speech',
              spokenSound: 'Nối âm tự nhiên',
              ruleType: 'linking',
              explanation:
                'Người bản xứ thường nối phụ âm cuối của từ đứng trước vào nguyên âm đầu của từ đứng sau để phát âm mượt mà hơn.',
            },
          ],
          generalTip: 'Hãy chú ý lắng nghe nhịp điệu trọng âm (stress-timed rhythm) thay vì bắt từng âm tiết rời rạc.',
        },
      });
    }

    const prompt = `You are an expert native English phonetics and pronunciation coach for Vietnamese learners.
Analyze the following English sentence to identify key Connected Speech phenomena (linking sounds, elision/dropped sounds, flap-T, weak forms of prepositions/auxiliaries, assimilation).

SENTENCE: "${sentence.trim().slice(0, 300)}"

Return STRICTLY a JSON object matching this schema:
{
  "sentence": "${sentence.trim().slice(0, 300)}",
  "phoneticPhantoms": [
    {
      "phrase": "Words involved (e.g. 'kick-start their', 'rely on', 'it is')",
      "spokenSound": "How it actually sounds in IPA or phonetic approximation (e.g. [ɪ-tɪz], [kɪk-stɑːt ðeə])",
      "ruleType": "linking" | "elision" | "assimilation" | "weak_form" | "flap_t",
      "explanation": "Clear, concise Vietnamese explanation (1-2 sentences) of why native speakers pronounce it this way and how to catch it."
    }
  ],
  "generalTip": "One practical, encouraging tip in Vietnamese for listening to this sentence."
}`;

    const headers = getProviderHeaders(providerName, apiKey);
    const endpoint = aiConfig?.endpoint || 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional phonetics assistant. Always return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const rawText = await response.text();
      const errorMsg = parseAIErrorResponse(
        response.status,
        response.statusText,
        rawText,
        providerDisplayName
      );
      throw new Error(errorMsg);
    }

    const aiRes = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = aiRes.choices?.[0]?.message?.content || '';
    const parsedData = extractAndParseJson<ConnectedSpeechTip>(content);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Lỗi phân tích nối âm AI';
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
