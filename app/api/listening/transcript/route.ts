import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractYouTubeId, cleanTranscriptText } from '@/utils/youtube';
import { CURATED_PODCASTS } from '@/constants/curated-podcasts';
import { extractTranscriptPureTS } from '@/lib/youtube/transcript-extractor';
import type { TimedSegment, VideoMetadata } from '@/types/listening.types';

interface YouTubeOEmbedResponse {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
}

interface RawJson3Event {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: { utf8?: string }[];
}

interface RawCaptionTrack {
  baseUrl: string;
  name?: { simpleText?: string };
  vssId?: string;
  languageCode?: string;
  kind?: string;
}

/**
 * Lấy metadata chuẩn thông qua YouTube oEmbed API
 */
async function fetchYouTubeMetadata(videoId: string): Promise<VideoMetadata> {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  try {
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = (await res.json()) as YouTubeOEmbedResponse;
      return {
        id: videoId,
        title: data.title || 'YouTube Video',
        channelTitle: data.author_name || 'YouTube Creator',
        thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch {
    // ignore oembed error and fallback
  }

  return {
    id: videoId,
    title: 'YouTube Video',
    channelTitle: 'YouTube Creator',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

/**
 * Gộp các mẩu phụ đề JSON vụn vặt (cues) thành các câu hoàn chỉnh tự nhiên
 */
function assembleSentencesFromEvents(events: RawJson3Event[]): TimedSegment[] {
  const segments: TimedSegment[] = [];

  let currentStart = -1;
  let currentEnd = 0;
  let accumulatedText = '';

  for (const ev of events) {
    if (!ev.segs || ev.segs.length === 0) continue;

    const textPart = ev.segs.map((s) => s.utf8 || '').join('');
    const cleaned = cleanTranscriptText(textPart);
    if (!cleaned) continue;

    const startSec = (ev.tStartMs || 0) / 1000;
    const durSec = (ev.dDurationMs || 0) / 1000;
    const endSec = startSec + durSec;

    if (currentStart === -1) {
      currentStart = startSec;
    }
    currentEnd = endSec;

    accumulatedText = accumulatedText ? `${accumulatedText} ${cleaned}` : cleaned;

    const hasPunctuationEnd = /[.?!]$/.test(accumulatedText.trim());
    const isLongEnough = accumulatedText.length >= 80 || currentEnd - currentStart >= 7.5;

    if (hasPunctuationEnd || isLongEnough) {
      const fullText = accumulatedText.trim();
      if (fullText.length > 5) {
        segments.push({
          id: `seg-${segments.length + 1}-${Math.round(currentStart)}`,
          start: Math.round(currentStart * 10) / 10,
          end: Math.round((currentEnd + 0.6) * 10) / 10,
          text: fullText,
          cleanText: fullText,
          words: fullText.split(/\s+/).filter(Boolean),
        });
      }
      accumulatedText = '';
      currentStart = -1;
    }
  }

  if (accumulatedText.trim().length > 5 && currentStart !== -1) {
    const fullText = accumulatedText.trim();
    segments.push({
      id: `seg-${segments.length + 1}-${Math.round(currentStart)}`,
      start: Math.round(currentStart * 10) / 10,
      end: Math.round((currentEnd + 0.6) * 10) / 10,
      text: fullText,
      cleanText: fullText,
      words: fullText.split(/\s+/).filter(Boolean),
    });
  }

  return segments;
}

/**
 * Phân tích phụ đề định dạng XML (fallback nếu YouTube không trả về json3)
 */
function parseXmlTimedText(xml: string): TimedSegment[] {
  const segments: TimedSegment[] = [];
  const regex = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/gi;
  let match: RegExpExecArray | null;
  let accumulated = '';
  let startSec = -1;
  let endSec = 0;

  while ((match = regex.exec(xml)) !== null) {
    const s = parseFloat(match[1]);
    const d = match[2] ? parseFloat(match[2]) : 2.5;
    const t = cleanTranscriptText(match[3]);

    if (!t) continue;
    if (startSec === -1) startSec = s;
    endSec = s + d;
    accumulated = accumulated ? `${accumulated} ${t}` : t;

    const hasEnd = /[.?!]$/.test(accumulated.trim());
    if (hasEnd || accumulated.length >= 80 || endSec - startSec >= 7.5) {
      const clean = accumulated.trim();
      if (clean.length > 5) {
        segments.push({
          id: `seg-${segments.length + 1}-${Math.round(startSec)}`,
          start: Math.round(startSec * 10) / 10,
          end: Math.round((endSec + 0.6) * 10) / 10,
          text: clean,
          cleanText: clean,
          words: clean.split(/\s+/).filter(Boolean),
        });
      }
      accumulated = '';
      startSec = -1;
    }
  }

  return segments;
}

/**
 * Phân tích đoạn văn bản thô do người dùng dán thành các câu có timestamp ước lượng
 */
function parseCustomTextToSegments(text: string): TimedSegment[] {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  let currentSec = 0;
  return sentences.map((sentence, idx) => {
    const wordCount = sentence.split(/\s+/).length;
    const duration = Math.max(3, Math.round((wordCount / 2.5) * 10) / 10);
    const start = currentSec;
    const end = Math.round((start + duration) * 10) / 10;
    currentSec = end + 0.5;

    return {
      id: `custom-seg-${idx + 1}`,
      start,
      end,
      text: sentence,
      cleanText: sentence,
      words: sentence.split(/\s+/).filter(Boolean),
    };
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      videoUrl?: string;
      videoId?: string;
      customTranscript?: string;
    };
    const rawInput = body.videoId || body.videoUrl;

    if (!rawInput) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp đường dẫn hoặc ID video YouTube.' },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeId(rawInput);
    if (!videoId) {
      return NextResponse.json(
        { success: false, message: 'Đường dẫn YouTube không hợp lệ.' },
        { status: 400 }
      );
    }

    // 1. Kiểm tra trong danh mục mẫu Curated Podcasts
    const curatedMatch = CURATED_PODCASTS.find((p) => p.youtubeId === videoId);
    if (curatedMatch && curatedMatch.sampleSegments && curatedMatch.sampleSegments.length > 0) {
      const metadata: VideoMetadata = {
        id: videoId,
        title: curatedMatch.title,
        channelTitle: curatedMatch.channelName,
        thumbnailUrl: curatedMatch.thumbnailUrl,
        cefrLevel: curatedMatch.cefrLevel,
        category: curatedMatch.topic,
      };

      return NextResponse.json({
        success: true,
        metadata,
        segments: curatedMatch.sampleSegments,
        isCurated: true,
      });
    }

    // 2. Kiểm tra trong Supabase Cache (listening_podcasts)
    try {
      const supabase = await createClient();
      const { data: dbPodcast } = await supabase
        .from('listening_podcasts')
        .select('*')
        .eq('youtube_id', videoId)
        .maybeSingle();

      if (dbPodcast && Array.isArray(dbPodcast.segments) && dbPodcast.segments.length > 0) {
        const cachedMetadata: VideoMetadata = {
          id: videoId,
          title: dbPodcast.title,
          channelTitle: dbPodcast.channel_name || 'YouTube Creator',
          thumbnailUrl: dbPodcast.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          cefrLevel: dbPodcast.cefr_level as VideoMetadata['cefrLevel'],
          category: dbPodcast.topic,
        };

        return NextResponse.json({
          success: true,
          metadata: cachedMetadata,
          segments: dbPodcast.segments as TimedSegment[],
          hasCaptions: true,
          isCached: true,
        });
      }
    } catch (dbErr: unknown) {
      console.warn('[TranscriptRoute] Lỗi đọc Supabase Cache:', dbErr);
    }

    // 3. Nếu người dùng tự dán Transcript tùy chỉnh
    if (body.customTranscript && body.customTranscript.trim().length > 10) {
      const customSegments = parseCustomTextToSegments(body.customTranscript.trim());
      const metadata = await fetchYouTubeMetadata(videoId);

      return NextResponse.json({
        success: true,
        metadata,
        segments: customSegments,
        isCustom: true,
      });
    }

    // 4. Lấy metadata video qua oEmbed
    const metadata = await fetchYouTubeMetadata(videoId);

    // Helper lưu transcript vào Supabase cache ngầm không chặn response
    const saveToSupabaseCache = async (segs: TimedSegment[]) => {
      try {
        const supabase = await createClient();
        await supabase.from('listening_podcasts').upsert(
          {
            youtube_id: videoId,
            title: metadata.title,
            channel_name: metadata.channelTitle,
            thumbnail_url: metadata.thumbnailUrl,
            cefr_level: metadata.cefrLevel || 'B1',
            topic: metadata.category,
            segments: segs,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'youtube_id' }
        );
      } catch (cacheErr: unknown) {
        console.warn('[TranscriptRoute] Lỗi ghi cache Supabase:', cacheErr);
      }
    };

    // 5. Trích xuất subtitle bằng Pure TypeScript Extractor (100% Zero-Python)
    const tsSegments = await extractTranscriptPureTS(videoId, 0, true);
    if (tsSegments.length > 0) {
      await saveToSupabaseCache(tsSegments);
      return NextResponse.json({
        success: true,
        metadata,
        segments: tsSegments,
        hasCaptions: true,
      });
    }

    // 6. Fallback: Quét HTML của YouTube tìm CaptionTracks
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    try {
      const pageRes = await fetch(youtubeUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
        let fallbackSegments: TimedSegment[] = [];

        if (captionsMatch && captionsMatch[1]) {
          let captionTracks: RawCaptionTrack[] = [];
          try {
            captionTracks = JSON.parse(captionsMatch[1]) as RawCaptionTrack[];
          } catch {
            captionTracks = [];
          }

          const englishTracks = captionTracks.filter((t) => (t.languageCode || '').startsWith('en'));
          const chosenTrack =
            englishTracks.find((t) => t.kind !== 'asr') || englishTracks[0] || captionTracks[0];

          if (chosenTrack && chosenTrack.baseUrl) {
            const subRes = await fetch(chosenTrack.baseUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            });

            if (subRes.ok) {
              const rawBody = await subRes.text();
              if (rawBody && rawBody.trim().length > 0) {
                if (rawBody.trim().startsWith('{')) {
                  const transcriptData = JSON.parse(rawBody) as { events?: RawJson3Event[] };
                  fallbackSegments = assembleSentencesFromEvents(transcriptData.events || []);
                } else if (rawBody.includes('<text')) {
                  fallbackSegments = parseXmlTimedText(rawBody);
                }
              }
            }
          }
        }

        if (fallbackSegments.length > 0) {
          await saveToSupabaseCache(fallbackSegments);
          return NextResponse.json({
            success: true,
            metadata,
            segments: fallbackSegments.slice(0, 50),
            hasCaptions: true,
          });
        }
      }
    } catch {
      // ignore
    }

    // 6. Nếu video hoàn toàn không có phụ đề
    return NextResponse.json({
      success: false,
      message: 'Video này không có phụ đề tiếng Anh hoặc người tạo video đã tắt phụ đề. Vui lòng thử video khác hoặc tự dán nội dung transcript.',
      metadata,
    }, { status: 404 });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Lỗi xử lý phụ đề YouTube';
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 500 }
    );
  }
}
