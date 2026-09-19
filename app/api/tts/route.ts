import { NextResponse } from 'next/server';

/**
 * GET /api/tts?text=rough&accent=us
 * Proxy audio stream từ Google TTS với header Referer chuẩn để tránh lỗi 404 từ trình duyệt
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text')?.trim();
    const accent = (searchParams.get('accent')?.toLowerCase() === 'uk' ? 'uk' : 'us') as 'us' | 'uk';

    if (!text) {
      return NextResponse.json({ error: 'Thiếu tham số text' }, { status: 400 });
    }

    const tl = accent === 'uk' ? 'en-GB' : 'en-US';
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(text)}`;

    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
      cache: 'force-cache',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Không thể lấy audio từ dịch vụ TTS' },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi xử lý TTS';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
