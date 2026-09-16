import type { CronPreset } from '@/types/admin-cron.types';

/**
 * Danh sách cấu hình mẫu (Preset Templates) phổ biến cho Vocab App Plus
 */
export const CRON_PRESET_TEMPLATES: CronPreset[] = [
  {
    id: 'auto-reset-rank',
    name: 'Chốt Sổ Giải Đấu Tuần (auto-reset-rank)',
    description: 'Tự động tính điểm xếp hạng, thăng/hạ hạng người chơi và bắt đầu mùa giải tuần mới lúc 00:00 Thứ Hai giờ VN (17:00 Chủ Nhật UTC).',
    schedule: '0 17 * * 0',
    command: 'SELECT public.admin_reset_all_leagues(NULL);',
    tag: 'Giải đấu',
  },
  {
    id: 'telegram-reminders-cron',
    name: 'Nhắc Nhở Ôn Tập Telegram (Mỗi 30 Phút)',
    description: 'Tự động quét học viên có từ vựng đến hạn chạm mốc 5, 10, 15, 20 từ và gửi tin nhắn Telegram trực tiếp qua Supabase Cloud.',
    schedule: '*/30 * * * *',
    command: 'SELECT public.send_telegram_due_reminders();',
    tag: 'Telegram',
  },
  {
    id: 'cleanup-old-notification-logs',
    name: 'Dọn Dẹp Nhật Ký Thông Báo Cũ (> 60 ngày)',
    description: 'Xóa tự động các bản ghi nhật ký thông báo Telegram cũ hơn 60 ngày nhằm giải phóng dung lượng cơ sở dữ liệu.',
    schedule: '0 3 * * *',
    command: "DELETE FROM public.telegram_notification_logs WHERE created_at < now() - interval '60 days';",
    tag: 'Bảo trì',
  },
  {
    id: 'daily-midnight-maintenance',
    name: 'Bảo Trì Cơ Sở Dữ Liệu Hàng Ngày',
    description: 'Chạy VACUUM ANALYZE các bảng trọng yếu (cards, review_logs, user_cards) vào lúc 04:00 sáng hàng ngày để tối ưu chỉ mục.',
    schedule: '0 21 * * *',
    command: 'ANALYZE public.user_cards, public.review_logs;',
    tag: 'Tối ưu',
  },
];

/**
 * Giải thích biểu thức cron thành ngôn ngữ tiếng Việt tự nhiên dễ hiểu
 */
export function explainCronExpression(cronStr: string): string {
  if (!cronStr) return 'Chưa thiết lập';
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return `Biểu thức tùy chỉnh (${cronStr})`;
  }

  const [min, hour, dom, month, dow] = parts;

  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    return 'Mỗi phút (Cẩn thận: Tần suất rất cao)';
  }

  if (min.startsWith('*/') && hour === '*' && dom === '*' && month === '*' && dow === '*') {
    const step = min.replace('*/', '');
    return `Mỗi ${step} phút một lần`;
  }

  if (min === '0' && hour.startsWith('*/') && dom === '*' && month === '*' && dow === '*') {
    const step = hour.replace('*/', '');
    return `Mỗi ${step} giờ một lần (vào phút thứ 0)`;
  }

  if (min === '0' && hour === '0' && dom === '*' && month === '*' && dow === '*') {
    return 'Hàng ngày lúc 00:00 UTC (07:00 sáng VN)';
  }

  if (dom === '*' && month === '*' && dow === '*') {
    const h = parseInt(hour, 10);
    const vnHour = !isNaN(h) ? (h + 7) % 24 : null;
    const vnTime = vnHour !== null ? ` (~${String(vnHour).padStart(2, '0')}:${min.padStart(2, '0')} VN)` : '';
    return `Hàng ngày lúc ${hour.padStart(2, '0')}:${min.padStart(2, '0')} UTC${vnTime}`;
  }

  if (dom === '*' && month === '*' && dow !== '*') {
    const dayNames: Record<string, string> = {
      '0': 'Chủ Nhật',
      '1': 'Thứ Hai',
      '2': 'Thứ Ba',
      '3': 'Thứ Tư',
      '4': 'Thứ Năm',
      '5': 'Thứ Sáu',
      '6': 'Thứ Bảy',
      '7': 'Chủ Nhật',
    };
    const dayName = dayNames[dow] || `Thứ ${dow}`;
    const h = parseInt(hour, 10);
    const vnHour = !isNaN(h) ? (h + 7) % 24 : null;
    const vnTime = vnHour !== null ? ` (~${String(vnHour).padStart(2, '0')}:${min.padStart(2, '0')} VN)` : '';

    if (dow === '0' && hour === '17' && min === '0') {
      return 'Mỗi Chủ Nhật lúc 17:00 UTC (00:00 Thứ Hai giờ VN - Chốt Rank tuần)';
    }

    return `Mỗi ${dayName} hàng tuần lúc ${hour}:${min} UTC${vnTime}`;
  }

  return `Lịch định kỳ: ${cronStr}`;
}

/**
 * Kiểm tra tính hợp lệ cơ bản của chuỗi Cron Expression
 */
export function isValidCronExpression(cronStr: string): boolean {
  if (!cronStr) return false;
  const parts = cronStr.trim().split(/\s+/);
  return parts.length === 5;
}

/**
 * Xác thực Secret của Cron Job từ Request
 * Hỗ trợ: Authorization Bearer, x-cron-secret header, hoặc ?secret query parameter
 */
export function verifyCronSecret(request: Request): boolean {
  const expectedSecret =
    process.env.CRON_SECRET || 'vocab_league_cron_secure_secret_2026';

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === expectedSecret) return true;
  }

  const customHeader = request.headers.get('x-cron-secret');
  if (customHeader && customHeader.trim() === expectedSecret) {
    return true;
  }

  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  if (querySecret && querySecret.trim() === expectedSecret) {
    return true;
  }

  return false;
}

