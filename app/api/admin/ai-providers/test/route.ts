import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin)' },
        { status: 403 }
      );
    }

    const { api_key, model } = await request.json();

    if (!api_key || typeof api_key !== 'string' || !api_key.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập API Key để kiểm tra kết nối' },
        { status: 400 }
      );
    }

    const modelToUse = model?.trim() || 'llama-3.3-70b-versatile';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api_key.trim()}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: 'user',
            content:
              'Chào bạn! Kết nối kiểm tra thành công. Bạn là model gì, được phát triển bởi ai và sẵn sàng hỗ trợ người học từ vựng tiếng Anh như thế nào trong 1-2 câu ngắn gọn?',
          },
        ],
        temperature: 0.5,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = response.statusText;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errText;
      } catch {
        errMsg = errText;
      }
      return NextResponse.json(
        { error: `Groq báo lỗi: ${errMsg}` },
        { status: response.status >= 500 ? 502 : 400 }
      );
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || 'Kết nối thành công (không có nội dung phản hồi).';

    return NextResponse.json({
      success: true,
      reply,
      model: modelToUse,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
