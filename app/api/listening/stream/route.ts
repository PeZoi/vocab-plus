import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { extractYouTubeId } from '@/utils/youtube';

const execFileAsync = promisify(execFile);

interface StreamCacheItem {
  url: string;
  expiresAt: number;
}

// In-memory cache cho luồng stream YouTube (hết hạn sau 50 phút)
const streamCache = new Map<string, StreamCacheItem>();

async function getAudioStreamUrl(videoId: string): Promise<string | null> {
  const now = Date.now();
  const cached = streamCache.get(videoId);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    // Lấy link audio stream tốt nhất (best audio) thông qua yt-dlp
    const { stdout } = await execFileAsync(
      'python',
      ['-m', 'yt_dlp', '-f', 'ba', '-g', videoUrl],
      { timeout: 20000, encoding: 'utf8' }
    );

    const streamUrl = stdout
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('https://'));

    if (streamUrl) {
      // Cache 50 phút
      streamCache.set(videoId, {
        url: streamUrl,
        expiresAt: now + 50 * 60 * 1000,
      });
      return streamUrl;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AudioStream] Lỗi trích xuất audio cho video ${videoId}:`, msg);
  }

  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get('videoId') || searchParams.get('v');

  if (!rawId) {
    return NextResponse.json({ error: 'Thiếu tham số videoId' }, { status: 400 });
  }

  const videoId = extractYouTubeId(rawId) || rawId;

  const streamUrl = await getAudioStreamUrl(videoId);
  if (!streamUrl) {
    return NextResponse.json(
      { error: 'Không thể trích xuất luồng audio từ video này' },
      { status: 502 }
    );
  }

  try {
    const rangeHeader = req.headers.get('range');
    const upstreamHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };

    if (rangeHeader) {
      upstreamHeaders['Range'] = rangeHeader;
    }

    // Gửi request tới Google Video CDN, fetch tự động follow 302 redirect
    const upstreamRes = await fetch(streamUrl, {
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      // Nếu link hết hạn (403/410), xóa cache và thử lấy link mới
      streamCache.delete(videoId);
      return NextResponse.json(
        { error: 'Luồng stream hết hạn, vui lòng thử lại' },
        { status: upstreamRes.status }
      );
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstreamRes.headers.get('content-type') || 'audio/webm');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AudioStream] Lỗi stream audio:`, msg);
    return NextResponse.json({ error: 'Lỗi truyền phát audio' }, { status: 500 });
  }
}
