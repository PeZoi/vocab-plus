import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AIWordAnalysisResponse } from '@/types/card.types';

export const maxDuration = 90; // Cho phép route chạy tối đa 90s khi có nhiều vòng lặp retry 429

function getProviderEndpoint(providerName?: string): string {
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const { word, context_sentence } = await request.json();

    if (!word || typeof word !== 'string' || !word.trim()) {
      return NextResponse.json({ error: 'Từ vựng cần phân tích là bắt buộc' }, { status: 400 });
    }

    // Giới hạn độ dài để tránh lỗi payload quá lớn (413 Request Entity Too Large)
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
      return NextResponse.json(
        {
          error:
            `Chưa có API key cho AI Provider (${providerDisplayName})! Vui lòng vào trang Quản trị (Admin) để cập nhật API Key.`,
        },
        { status: 400 }
      );
    }

    // 2. Chuẩn bị prompt phân tích từ vựng kèm quy tắc sửa lỗi chính tả
    const prompt = `Phân tích từ hoặc cụm từ tiếng Anh sau mà người dùng đã nhập: "${safeWord}".
${safeContext ? `Ngữ cảnh trong câu: "${safeContext}". Hãy ưu tiên nghĩa phù hợp nhất với ngữ cảnh này lên đầu danh sách senses.` : ''}

QUY TẮC SỬA LỖI CHÍNH TẢ BẮT BUỘC:
- Nếu người dùng nhập sai chính tả (ví dụ: "proccess" -> "process", "embarass" -> "embarrass", "recive" -> "receive", "defanitely" -> "definitely", "akward" -> "awkward", "occurr" -> "occur"), bạn PHẢI TỰ ĐỘNG SỬA lại từ chính xác trong trường "word". Đặt "is_corrected": true và "original_word": "${safeWord}".
- Nếu từ đã đúng chính tả, đặt "is_corrected": false và "original_word": "${safeWord}".

Yêu cầu trả về DUY NHẤT một JSON hợp lệ (không kèm markdown code fence hay chữ giải thích bên ngoài), tuân thủ cấu trúc sau:
{
  "word": "từ tiếng Anh chuẩn xác (đã được sửa đúng chính tả nếu trước đó viết sai)",
  "original_word": "${word.trim()}",
  "is_corrected": false hoặc true,
  "ipa": "phiên âm IPA chuẩn, ví dụ /səkˈses/",
  "card_type": "word" hoặc "phrasal_verb" hoặc "idiom",
  "cefr_level": "A1 | A2 | B1 | B2 | C1 | C2",
  "senses": [
    {
      "part_of_speech": "noun | verb | adjective | adverb | preposition | conjunction | pronoun | interjection",
      "definition": "Định nghĩa bằng tiếng Việt rõ ràng, dễ hiểu",
      "vietnamese_hint": "Nghĩa ngắn gọn 1-3 từ tiếng Việt",
      "example_sentence": "Một câu ví dụ tiếng Anh đơn giản, dùng từ vựng cơ bản A2-B1 để minh họa, dễ hiểu trọn câu",
      "tags": ["#tag1", "#tag2"] (từ nào phổ biến tag được thì ghi không thì để rỗng, tag viết bằng tiếng anh)
    }
  ],
  "collocations": [
    {
      "phrase": "cụm từ hay đi kèm thông dụng",
      "meaning": "nghĩa tiếng Việt ngắn",
      "example": "câu ví dụ tiếng Anh đơn giản minh họa cách dùng cụm từ này"
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

    // 3. Chuẩn bị headers & endpoint tương ứng với provider đang chạy
    const endpoint = getProviderEndpoint(providerName);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (providerName === 'orcarouter') {
      headers['HTTP-Referer'] = 'https://vocabapp.plus';
      headers['X-Title'] = 'VocabApp';
    }

    // 4. Gọi Chat Completions endpoint (Tự động thử lại tối đa 5 lần nếu gặp 429)
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
                'Bạn là chuyên gia ngôn ngữ học và từ điển tiếng Anh cho người Việt. Nhiệm vụ của bạn là phân tích từ vựng và trả về dữ liệu định dạng JSON hợp lệ.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 2048,
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

      // Nếu không phải lỗi 429 (Too Many Requests), không cần retry mà báo lỗi ngay
      if (response.status !== 429) {
        return NextResponse.json(
          { error: `Lỗi khi gọi ${providerDisplayName}: ${errMsg}` },
          { status: response.status >= 500 ? 502 : response.status }
        );
      }

      // Nếu là lỗi 429 và chưa hết số lần thử, chờ theo retry-after hoặc backoff
      if (attempt < maxRetries) {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterSeconds = retryAfterHeader ? parseFloat(retryAfterHeader) : null;
        const waitMs = retryAfterSeconds && !isNaN(retryAfterSeconds)
          ? Math.min(Math.max(retryAfterSeconds, 1), 6) * 1000
          : attempt * 2000;

        console.log(`Gặp lỗi 429 từ ${providerDisplayName}. Đợi ${waitMs}ms trước khi thử lại lần ${attempt + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        {
          error: `${providerDisplayName} đạt giới hạn lượt gọi (Rate Limit 429) sau ${maxRetries} lần thử lại: ${lastErrorMsg}.`,
        },
        { status: 429 }
      );
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'AI không trả về nội dung' }, { status: 500 });
    }

    const parsed: AIWordAnalysisResponse = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
