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
