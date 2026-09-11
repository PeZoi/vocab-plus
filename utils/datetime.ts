import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Định dạng ngày giờ thân thiện theo locale tiếng Việt
 */
export function formatDateTime(
  date: Date | string,
  pattern: string = 'dd/MM/yyyy HH:mm',
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(d, timeZone, pattern, { locale: vi });
}

/**
 * Hiển thị khoảng cách thời gian tương đối (vd: "2 giờ trước", "trong 3 ngày")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: vi });
}

/**
 * Tính và hiển thị thời gian còn lại đến một thời điểm trong tương lai bằng tiếng Việt
 * Ví dụ: "Còn 30 phút nữa", "Còn 2 tiếng nữa", "Còn 3 ngày nữa", "Còn 1 tháng nữa"
 */
export function formatRemainingTime(
  targetDate: Date | string,
  baseDate: Date | number = new Date()
): string {
  const d = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const targetTime = d.getTime();
  const baseTime = typeof baseDate === 'number' ? baseDate : baseDate.getTime();
  const diffMs = targetTime - baseTime;

  if (diffMs <= 0) {
    return 'Đến hạn ôn';
  }

  const minutes = Math.round(diffMs / (60 * 1000));
  if (minutes < 60) {
    return `Còn ${Math.max(1, minutes)} phút nữa`;
  }

  const hours = Math.round(diffMs / (60 * 60 * 1000));
  if (hours < 24) {
    return `Còn ${hours} tiếng nữa`;
  }

  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (days < 30) {
    return `Còn ${days} ngày nữa`;
  }

  const months = Math.round(diffMs / (30 * 24 * 60 * 60 * 1000));
  if (months < 12) {
    return `Còn ${months} tháng nữa`;
  }

  const years = Math.round(diffMs / (365 * 24 * 60 * 60 * 1000));
  return `Còn ${years} năm nữa`;
}

/**
 * Kiểm tra xem một thời điểm có nằm trong danh sách giờ vàng không
 * Golden hours format: ["07:00-08:00", "12:00-13:00", "21:00-22:00"]
 */
export function isCurrentTimeInGoldenHours(
  goldenHours: string[] = ['07:00-08:00', '12:00-13:00', '21:00-22:00'],
  timeZone: string = DEFAULT_TIMEZONE
): boolean {
  const nowZoned = toZonedTime(new Date(), timeZone);
  const currentHour = nowZoned.getHours();
  const currentMinute = nowZoned.getMinutes();
  const currentMinutesTotal = currentHour * 60 + currentMinute;

  return goldenHours.some((window) => {
    const [start, end] = window.split('-');
    if (!start || !end) return false;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    return currentMinutesTotal >= startTotal && currentMinutesTotal <= endTotal;
  });
}
