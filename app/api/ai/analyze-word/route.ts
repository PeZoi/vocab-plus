import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AIWordAnalysisResponse } from '@/types/card.types';

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

    // 1. Lấy AI Provider config đang active/default từ database
    const { data: aiConfig } = await supabase
      .from('ai_provider_configs')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    const apiKey = aiConfig?.api_key || process.env.GROQ_API_KEY;
    const model = aiConfig?.model || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Chưa có API key cho AI Provider! Vui lòng vào trang Quản trị (Admin) để cập nhật API Key cho Groq.',
        },
        { status: 400 }
      );
    }

    // 2. Chuẩn bị prompt phân tích từ vựng kèm quy tắc sửa lỗi chính tả
    const prompt = `Phân tích từ hoặc cụm từ tiếng Anh sau mà người dùng đã nhập: "${word.trim()}".
${context_sentence ? `Ngữ cảnh trong câu: "${context_sentence}". Hãy ưu tiên nghĩa phù hợp nhất với ngữ cảnh này lên đầu danh sách senses.` : ''}

QUY TẮC SỬA LỖI CHÍNH TẢ BẮT BUỘC:
- Nếu người dùng nhập sai chính tả (ví dụ: "proccess" -> "process", "embarass" -> "embarrass", "recive" -> "receive", "defanitely" -> "definitely", "akward" -> "awkward", "occurr" -> "occur"), bạn PHẢI TỰ ĐỘNG SỬA lại từ chính xác trong trường "word". Đặt "is_corrected": true và "original_word": "${word.trim()}".
- Nếu từ đã đúng chính tả, đặt "is_corrected": false và "original_word": "${word.trim()}".

Yêu cầu trả về DUY NHẤT một JSON hợp lệ (không kèm markdown code fence hay chữ giải thích bên ngoài), tuân thủ cấu trúc sau:
{
  "word": "từ tiếng Anh chuẩn xác (đã được sửa đúng chính tả nếu trước đó viết sai)",
  "original_word": "${word.trim()}",
  "is_corrected": false hoặc true,
  "ipa": "phiên âm IPA chuẩn, ví dụ /səkˈses/",
  "card_type": "word" hoặc "phrasal_verb" hoặc "idiom",
  "senses": [
    {
      "part_of_speech": "noun | verb | adjective | adverb | preposition | conjunction | pronoun | interjection",
      "definition": "Định nghĩa bằng tiếng Việt rõ ràng, dễ hiểu",
      "vietnamese_hint": "Nghĩa ngắn gọn 1-3 từ tiếng Việt",
      "example_sentence": "Một câu ví dụ tiếng Anh đơn giản, dùng từ vựng cơ bản A2-B1 để minh họa, dễ hiểu trọn câu"
    }
  ],
  "collocations": ["cụm từ hay đi kèm 1", "cụm từ hay đi kèm 2"],
  "word_family": [
    { "form_word": "dạng từ khác", "part_of_speech": "noun | verb | adjective | adverb" }
  ],
  "mnemonic": "Mẹo liên tưởng / mẹo ghi nhớ bằng tiếng Việt sinh động, dễ nhớ"
}`;

    // 3. Gọi Groq API qua Chat Completions endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
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
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Groq API Error:', errBody);
      return NextResponse.json(
        { error: `Lỗi khi gọi Groq AI: ${response.statusText}` },
        { status: 502 }
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
