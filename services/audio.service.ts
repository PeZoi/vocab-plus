/**
 * Service quản lý và lấy file âm thanh phát âm từ người bản xứ thật (Real Human Audio)
 * cho cả 2 chuẩn Anh - Mỹ (US) và Anh - Anh (UK) từ các kho dữ liệu từ điển quốc tế.
 */

import { apiClient } from '@/lib/axios';

export interface NativeWordAudio {
  usAudioUrl?: string;
  ukAudioUrl?: string;
  usIpa?: string;
  ukIpa?: string;
}

const CACHE_KEY_PREFIX = 'vocab_audio_cache_v1_';
const memoryCache = new Map<string, NativeWordAudio>();

/**
 * Bóc tách và tìm kiếm link phát âm US và UK từ kết quả Free Dictionary API
 */
function parseDictionaryApiResponse(data: unknown): NativeWordAudio {
  const result: NativeWordAudio = {};

  if (!Array.isArray(data) || data.length === 0) {
    return result;
  }

  const firstEntry = data[0];
  if (typeof firstEntry !== 'object' || firstEntry === null) {
    return result;
  }

  const phonetics = (firstEntry as { phonetics?: unknown[] }).phonetics;
  if (!Array.isArray(phonetics) || phonetics.length === 0) {
    return result;
  }

  // Quét qua danh sách phonetics để tìm audio US & UK
  for (const item of phonetics) {
    if (typeof item !== 'object' || item === null) continue;
    const phoneticObj = item as { audio?: string; text?: string };
    const audioUrl = (phoneticObj.audio || '').trim();
    if (!audioUrl) continue;

    const lowerAudio = audioUrl.toLowerCase();
    const lowerText = (phoneticObj.text || '').toLowerCase();

    // Nhận diện US Audio: chứa '-us.mp3', '/us/', hoặc có text/phonetic liên quan US
    if (
      lowerAudio.includes('-us.mp3') ||
      lowerAudio.includes('/us/') ||
      lowerAudio.includes('en-us') ||
      lowerText.includes('us')
    ) {
      if (!result.usAudioUrl) {
        result.usAudioUrl = audioUrl;
        if (phoneticObj.text) result.usIpa = phoneticObj.text;
      }
    }
    // Nhận diện UK Audio: chứa '-uk.mp3', '/uk/', 'en-gb', hoặc có text liên quan UK
    else if (
      lowerAudio.includes('-uk.mp3') ||
      lowerAudio.includes('/uk/') ||
      lowerAudio.includes('en-gb') ||
      lowerText.includes('uk')
    ) {
      if (!result.ukAudioUrl) {
        result.ukAudioUrl = audioUrl;
        if (phoneticObj.text) result.ukIpa = phoneticObj.text;
      }
    }
    // Fallback: nếu audio hợp lệ nhưng chưa phân loại rõ
    else if (!result.usAudioUrl) {
      result.usAudioUrl = audioUrl;
    } else if (!result.ukAudioUrl && result.usAudioUrl !== audioUrl) {
      result.ukAudioUrl = audioUrl;
    }
  }

  // Nếu chỉ tìm thấy 1 trong 2, dùng làm fallback cho bên còn lại nếu cần
  if (result.usAudioUrl && !result.ukAudioUrl) {
    result.ukAudioUrl = result.usAudioUrl;
  } else if (result.ukAudioUrl && !result.usAudioUrl) {
    result.usAudioUrl = result.ukAudioUrl;
  }

  return result;
}

/**
 * Tạo URL file âm thanh phát âm chất lượng cao qua Next.js Proxy (/api/tts)
 * Khắc phục triệt để lỗi 404 từ Google và hỗ trợ 100% mọi từ đơn, cụm từ ("bend down", "small talk") và câu dài
 */
export function getGoogleTtsAudioUrl(text: string, accent: 'us' | 'uk'): string {
  return `/api/tts?text=${encodeURIComponent(text.trim())}&accent=${accent}`;
}

/**
 * Lấy file phát âm chuẩn người bản xứ (US & UK) qua hệ thống đa tầng Multi-tier:
 * - Tầng 1: Nếu là cụm từ (phrasal verb, idiom có dấu cách) -> Dùng ngay Google TTS (< 50ms, tránh triệt để lỗi 522 của Free Dictionary)
 * - Tầng 2: Nếu là từ đơn -> Ưu tiên Free Dictionary API lấy file thu âm người thật Oxford/Cambridge (kèm AbortController 2.5s)
 * - Tầng 3: Nếu Dictionary API lỗi hoặc quá 2.5s không phản hồi -> Tự động Fallback sang Google TTS
 */
export async function getNativeWordAudio(word: string): Promise<NativeWordAudio> {
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) return {};

  // 1. Kiểm tra memory cache trước
  if (memoryCache.has(cleanWord)) {
    return memoryCache.get(cleanWord)!;
  }

  // 2. Kiểm tra localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${cleanWord}`);
      if (cached) {
        const parsed: NativeWordAudio = JSON.parse(cached);
        memoryCache.set(cleanWord, parsed);
        return parsed;
      }
    } catch {
      // Bỏ qua lỗi truy cập storage
    }
  }

  // 3. NHẬN DIỆN CỤM TỪ (PHRASAL VERBS / IDIOMS NHƯ "bend down")
  // Free Dictionary API chỉ hỗ trợ từ đơn; khi nhận cụm từ có dấu cách, server của họ bị nghẽn
  // và trả về Cloudflare Error 522 sau 20 - 40 giây. Vì vậy ta chuyển thẳng sang Google TTS (< 50ms).
  if (cleanWord.includes(' ') || cleanWord.includes('_')) {
    const phraseAudio: NativeWordAudio = {
      usAudioUrl: getGoogleTtsAudioUrl(cleanWord, 'us'),
      ukAudioUrl: getGoogleTtsAudioUrl(cleanWord, 'uk'),
    };

    memoryCache.set(cleanWord, phraseAudio);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${CACHE_KEY_PREFIX}${cleanWord}`, JSON.stringify(phraseAudio));
      } catch {
        // Bỏ qua nếu localStorage đầy
      }
    }
    return phraseAudio;
  }

  // 4. VỚI TỪ ĐƠN: Ưu tiên Free Dictionary API với AbortController Timeout (2500ms)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
      {
        cache: 'force-cache',
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const parsedAudio = parseDictionaryApiResponse(json);

      // Nếu có ít nhất 1 audio từ điển
      if (parsedAudio.usAudioUrl || parsedAudio.ukAudioUrl) {
        // Nếu thiếu một trong hai bên, bổ sung bằng Google TTS tương ứng
        if (!parsedAudio.usAudioUrl) {
          parsedAudio.usAudioUrl = getGoogleTtsAudioUrl(cleanWord, 'us');
        }
        if (!parsedAudio.ukAudioUrl) {
          parsedAudio.ukAudioUrl = getGoogleTtsAudioUrl(cleanWord, 'uk');
        }

        memoryCache.set(cleanWord, parsedAudio);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`${CACHE_KEY_PREFIX}${cleanWord}`, JSON.stringify(parsedAudio));
          } catch {
            // Bỏ qua
          }
        }
        return parsedAudio;
      }
    }
  } catch {
    clearTimeout(timeoutId);
    // Bỏ qua lỗi timeout hoặc lỗi mạng để đi tiếp xuống fallback
  }

  // 5. TẦNG FALLBACK: Sử dụng Google TTS khi Dictionary API lỗi 404, 522 hoặc timeout
  const fallbackAudio: NativeWordAudio = {
    usAudioUrl: getGoogleTtsAudioUrl(cleanWord, 'us'),
    ukAudioUrl: getGoogleTtsAudioUrl(cleanWord, 'uk'),
  };

  memoryCache.set(cleanWord, fallbackAudio);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${cleanWord}`, JSON.stringify(fallbackAudio));
    } catch {
      // Bỏ qua
    }
  }

  return fallbackAudio;
}

export interface CardAudioPayload {
  us?: string;
  uk?: string;
}

/**
 * Bóc tách dữ liệu audio US & UK từ trường audio_url của bảng cards trong DB
 */
export function parseCardAudio(audioUrl: string | null | undefined): CardAudioPayload {
  if (!audioUrl) return {};
  const trimmed = audioUrl.trim();
  if (!trimmed) return {};

  // Nếu chuỗi là JSON serialized: {"us":"...","uk":"..."}
  if (trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        const obj = parsed as Record<string, unknown>;
        return {
          us: typeof obj.us === 'string' ? obj.us : undefined,
          uk: typeof obj.uk === 'string' ? obj.uk : undefined,
        };
      }
    } catch {
      // Bỏ qua nếu parse JSON lỗi
    }
  }

  // Nếu chuỗi là URL thông thường (legacy audio_url hoặc relative proxy)
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
    if (trimmed.includes('-uk.mp3') || trimmed.includes('/uk/')) {
      return { uk: trimmed, us: trimmed };
    }
    return { us: trimmed, uk: trimmed };
  }

  return {};
}

/**
 * Chuẩn hóa object audio thành chuỗi JSON để lưu vào cột cards.audio_url
 */
export function serializeCardAudio(audio: CardAudioPayload): string | null {
  if (!audio.us && !audio.uk) return null;
  return JSON.stringify({
    us: audio.us || audio.uk || undefined,
    uk: audio.uk || audio.us || undefined,
  });
}

/**
 * Ghi ngầm dữ liệu audio vào Database khi lần đầu bấm nghe (Lazy-sync)
 */
export async function syncCardAudioToDb(cardId: string, audio: CardAudioPayload): Promise<void> {
  if (!cardId || (!audio.us && !audio.uk)) return;
  try {
    const serialized = serializeCardAudio(audio);
    if (!serialized) return;

    await apiClient.patch(`/cards/${cardId}/audio`, { audio_url: serialized });
  } catch (error) {
    console.warn(`Lỗi khi lazy-sync audio cho thẻ ${cardId}:`, error);
  }
}

