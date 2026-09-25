/**
 * Tiện ích xử lý link YouTube, bóc tách ID, format timestamp
 */

/**
 * Trích xuất YouTube Video ID từ mọi định dạng link URL phổ biến
 */
export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Nếu người dùng nhập trực tiếp 11 ký tự YouTube ID (vd: M7lc1UVf-VE)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex bao phủ: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);

  return match ? match[1] : null;
}

/**
 * Chuyển số giây thành định dạng mm:ss hoặc hh:mm:ss
 */
export function formatTimestamp(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';

  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const paddedHrs = String(hrs).padStart(2, '0');
    return `${paddedHrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Lấy ảnh Thumbnail chất lượng cao từ YouTube Video ID
 */
export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Chuẩn hóa chuỗi phụ đề (loại bỏ ký tự HTML entity, thẻ [Music], [Laughter]...)
 */
export function cleanTranscriptText(text: string): string {
  if (!text) return '';

  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\[(?:Music|Applause|Laughter|Inaudible|Whispering|Silence)\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}
