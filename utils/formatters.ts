/**
 * Viết hoa chữ cái đầu tiên
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format điểm kinh nghiệm (XP) hiển thị đẹp mắt (vd: 1,250 XP)
 */
export function formatXP(xp: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(xp)} XP`;
}

/**
 * Rút gọn chuỗi dài kèm dấu ba chấm
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Chuẩn hóa phiên âm IPA (đảm bảo bọc trong dấu gạch chéo /.../)
 */
export function formatIPA(ipa?: string | null): string {
  if (!ipa) return '';
  const trimmed = ipa.trim();
  if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}/`;
}

/**
 * Chuẩn hóa các ký tự điều khiển (xuống dòng \n, tab \t, carriage return \r)
 * Tự động chuyển đổi cả ký tự thực tế lẫn chuỗi escaped dạng literal ("\n", "\t")
 * thành định dạng văn bản hiển thị trực quan chuẩn xác.
 */
export function normalizeEscapedText(raw?: string | null): string {
  if (!raw) return '';

  return raw
    // 1. Chuẩn hóa chuỗi escaped literal \r\n, \n, \r, \t thành ký tự chuẩn
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, '\t')
    // 2. Chuẩn hóa Windows CRLF sang LF
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

