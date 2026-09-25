import { cleanTranscriptText } from '@/utils/youtube';
import type { TimedSegment } from '@/types/listening.types';

interface RawCue {
  start: number;
  duration: number;
  text: string;
}

interface CaptionTrackInfo {
  baseUrl: string;
  languageCode?: string;
  kind?: string;
}

interface InnertubeResponse {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrackInfo[];
    };
  };
}

const STRONG_STARTERS = new Set([
  "i'm", "i've", "i'll", "i'd", "we'll", "we're", "we've", "you'll", "you're", "they're",
  "it's", "that's", "there's", "let's", "today", "now", "also", "first", "second", "next",
  "finally", "however", "what", "why", "where", "how", "who", "when", "mike", "john",
  "make", "grab", "listen", "remember", "choose", "hopefully",
]);

const NO_SPLIT_ENDS = new Set([
  'of', 'to', 'in', 'on', 'at', 'for', 'with', 'about', 'by', 'from', 'into', 'through', 'as',
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'our', 'their',
  'and', 'or', 'but', 'because', 'so', 'than', 'if', 'though', 'although',
  'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should',
  "i'm", "you're", "we're", "they're", "it's", "that's", "i've", "we've", "i'll", "we'll",
  'it', 'me', 'us', 'him', 'her', 'them',
  'special', 'free', 'beloved', 'physical', 'favorite', 'dark', 'warm', 'cold', 'plain', 'badminton',
  '8', 'minute', 'english', 'podcast', 'learn', 'very', 'really', 'too', 'more',
]);

/**
 * Dịch hàng loạt câu từ tiếng Anh sang tiếng Việt thông qua endpoint Google Translate
 */
export async function translateBatch(texts: string[], batchSize = 15): Promise<Record<string, string>> {
  const translations: Record<string, string> = {};

  for (let i = 0; i < texts.length; i += batchSize) {
    const chunk = texts.slice(i, i + batchSize);
    const combined = chunk.join(' ||| ');

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(
        combined
      )}`;

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (res.ok) {
        const data = (await res.json()) as unknown[][];
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const fullVi = data[0]
            .map((item) => (Array.isArray(item) && typeof item[0] === 'string' ? item[0] : ''))
            .join('');

          const parts = fullVi.split('|||').map((p) => p.trim());
          chunk.forEach((text, idx) => {
            if (parts[idx]) {
              translations[text] = parts[idx];
            }
          });
        }
      }
    } catch {
      // Bỏ qua lỗi dịch, không làm gián đoạn việc tải bài học
    }
  }

  return translations;
}

/**
 * Lấy CaptionTracks thông qua YouTube Innertube Android Client (Không bị chặn, không cần đăng nhập)
 */
async function fetchCaptionTracks(videoId: string): Promise<CaptionTrackInfo[]> {
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'com.google.android.youtube/20.10.38 (Linux; U; Android 14)',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'ANDROID',
            clientVersion: '20.10.38',
          },
        },
        videoId,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as InnertubeResponse;
      const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (Array.isArray(tracks) && tracks.length > 0) {
        return tracks;
      }
    }
  } catch {
    // ignore
  }

  // Fallback: Quét HTML thông thường
  try {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageRes = await fetch(youtubeUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const match = html.match(/"captionTracks":\s*(\[.*?\])/);
      if (match && match[1]) {
        return JSON.parse(match[1]) as CaptionTrackInfo[];
      }
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Trích xuất các mẩu phụ đề thô (Raw Cues) với timestamp chuẩn xác
 */
async function fetchRawCues(videoId: string): Promise<RawCue[]> {
  const captionTracks = await fetchCaptionTracks(videoId);
  if (!captionTracks || captionTracks.length === 0) return [];

  // Ưu tiên track tiếng Anh (en, en-US, en-GB), không phải tự động sinh (asr) nếu có track thủ công
  const englishTracks = captionTracks.filter((t) => (t.languageCode || '').startsWith('en'));
  const chosenTrack =
    englishTracks.find((t) => t.kind !== 'asr') || englishTracks[0] || captionTracks[0];

  if (!chosenTrack || !chosenTrack.baseUrl) return [];

  // Định dạng srv1 chuẩn XML của YouTube transcript
  const targetUrl = `${chosenTrack.baseUrl.replace(/&fmt=\w+/g, '')}&fmt=srv1`;

  try {
    const subRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!subRes.ok) return [];

    const rawText = await subRes.text();
    if (!rawText || rawText.trim().length === 0) return [];

    const rawCues: RawCue[] = [];
    const regex = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/gi;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawText)) !== null) {
      const start = parseFloat(match[1]);
      const duration = match[2] ? parseFloat(match[2]) : 2.5;
      const text = cleanTranscriptText(match[3]);
      if (text) {
        rawCues.push({ start, duration, text });
      }
    }

    return rawCues;
  } catch {
    return [];
  }
}

/**
 * Thuật toán phân tích từ & ghép câu thông minh (100% Pure TypeScript, Zero-Python)
 */
export async function extractTranscriptPureTS(
  videoId: string,
  maxSentences = 0,
  doTranslate = true
): Promise<TimedSegment[]> {
  const rawCues = await fetchRawCues(videoId);
  if (!rawCues || rawCues.length === 0) return [];

  // 1. Phân tách thành từng từ có timestamp chuẩn xác, không chồng chéo (non-overlapping)
  interface WordTime {
    word: string;
    start: number;
    end: number;
  }

  const wordsWithTime: WordTime[] = [];

  for (let i = 0; i < rawCues.length; i++) {
    const item = rawCues[i];
    const text = item.text.replace(/\n/g, ' ').trim();
    if (!text || (text.startsWith('[') && text.endsWith(']'))) continue;

    const tokens = text.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) continue;

    // Tính thời lượng thực tế của cue dựa trên start của cue kế tiếp (tránh visual display overlap của YouTube)
    let realDur = 0;
    if (i + 1 < rawCues.length) {
      realDur = Math.max(0.4, rawCues[i + 1].start - item.start);
    } else {
      realDur = Math.max(0.4, item.duration);
    }

    // Giới hạn an toàn tối đa 4.5s cho 1 cue
    realDur = Math.min(realDur, 4.5);
    const wDur = realDur / tokens.length;

    for (let idx = 0; idx < tokens.length; idx++) {
      const wStart = item.start + idx * wDur;
      const wEnd = wStart + wDur;
      wordsWithTime.push({
        word: tokens[idx],
        start: wStart,
        end: wEnd,
      });
    }
  }

  if (wordsWithTime.length === 0) return [];

  // 2. Phân tách câu thông minh theo ngữ pháp & dấu hiệu hội thoại tự nhiên
  const rawSentences: { start: number; end: number; text: string }[] = [];
  let curWords: WordTime[] = [];
  const totalW = wordsWithTime.length;

  for (let idx = 0; idx < totalW; idx++) {
    const wObj = wordsWithTime[idx];
    curWords.push(wObj);

    const dur = curWords[curWords.length - 1].end - curWords[0].start;
    const count = curWords.length;

    if (idx + 1 < totalW) {
      const nextWord = wordsWithTime[idx + 1].word.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
      const curWord = wObj.word.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
      const hasTerminalPunct = /[.?!]$/.test(wObj.word);
      const isStrongStarter = STRONG_STARTERS.has(nextWord);
      const isNoSplit = NO_SPLIT_ENDS.has(curWord);

      let shouldSplit = false;

      // Trường hợp 1: Có dấu câu kết thúc thực sự (nếu có)
      if (hasTerminalPunct && !isNoSplit && (dur >= 2.5 || count >= 5)) {
        shouldSplit = true;
      }
      // Trường hợp 2: Từ tiếp theo là từ mở đầu câu mạnh và câu hiện tại đã đủ dài
      else if (isStrongStarter && !isNoSplit && (dur >= 3.8 || count >= 8)) {
        shouldSplit = true;
      }
      // Trường hợp 3: Câu đang dài (>= 7.5s và >= 14 từ), ngắt an toàn trước liên từ
      else if (
        dur >= 7.5 &&
        count >= 14 &&
        !isNoSplit &&
        ['and', 'but', 'so', 'because', 'if', 'when', 'which', 'while'].includes(nextWord)
      ) {
        shouldSplit = true;
      }
      // Trường hợp 4: Giới hạn an toàn cho câu quá dài (>= 9.5s)
      else if (dur >= 9.5 && count >= 18 && !isNoSplit) {
        shouldSplit = true;
      }

      if (shouldSplit) {
        let sText = curWords.map((item) => item.word).join(' ').trim();
        sText = sText.length > 1 ? sText[0].toUpperCase() + sText.slice(1) : sText.toUpperCase();
        if (!/[.?!]$/.test(sText)) {
          sText += '.';
        }

        rawSentences.push({
          start: curWords[0].start,
          end: curWords[curWords.length - 1].end,
          text: sText,
        });
        curWords = [];
      }
    }
  }

  if (curWords.length > 0) {
    let sText = curWords.map((item) => item.word).join(' ').trim();
    sText = sText.length > 1 ? sText[0].toUpperCase() + sText.slice(1) : sText.toUpperCase();
    if (!/[.?!]$/.test(sText)) {
      sText += '.';
    }
    rawSentences.push({
      start: curWords[0].start,
      end: curWords[curWords.length - 1].end,
      text: sText,
    });
  }

  // 3. Thêm padding an toàn:
  // - Lead-in: -0.2s để không bao giờ bị cắt phụ âm đầu của từ đầu tiên
  // - Tail buffer: +0.35s để âm đuôi ngân trọn vẹn, không bị cắt cụt từ cuối
  const finalSegments: TimedSegment[] = [];

  for (let idx = 0; idx < rawSentences.length; idx++) {
    const s = rawSentences[idx];
    const sStart = Math.max(0, Math.round((s.start - 0.2) * 100) / 100);
    const sEnd = Math.round((s.end + 0.35) * 100) / 100;

    finalSegments.push({
      id: `seg-${idx + 1}-${Math.round(sStart)}`,
      start: sStart,
      end: Math.max(Math.round((sStart + 1.8) * 100) / 100, sEnd),
      text: s.text,
      cleanText: s.text,
      words: s.text.split(/\s+/).filter(Boolean),
    });
  }

  let result = finalSegments;
  if (maxSentences > 0 && result.length > maxSentences) {
    result = result.slice(0, maxSentences);
  }

  // 4. Dịch song ngữ tiếng Việt
  if (doTranslate && result.length > 0) {
    const allTexts = result.map((seg) => seg.text);
    const translations = await translateBatch(allTexts);
    for (const seg of result) {
      if (translations[seg.text]) {
        seg.vietnameseTranslation = translations[seg.text];
      }
    }
  }

  return result;
}
