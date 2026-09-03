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
