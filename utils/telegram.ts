import type { DueReminderBadge } from '@/types/telegram.types';

/**
 * Bước nhảy milestone thông báo số từ đến hạn (5, 10, 15, 20, ...)
 */
export const TELEGRAM_REMINDER_MILESTONE_STEP = 5;

/**
 * Giãn cách gửi nhắc nhở tối thiểu nếu vẫn ở cùng một mốc mà chưa học (24 giờ)
 */
export const TELEGRAM_REMINDER_COOLDOWN_HOURS = 24;

/**
 * Lấy Badge huy hiệu và lời động viên theo mốc từ vựng đến hạn
 */
export function getTelegramMilestoneBadge(milestone: number): DueReminderBadge {
  if (milestone >= 20) {
    return {
      badge: `🔥 Mốc ${milestone}+ từ vựng`,
      encouragement:
        'Số lượng từ đến hạn đã tích lũy khá nhiều! Dành 5-10 phút ôn tập ngay để tránh quên lãng và duy trì chuỗi Streak nhé!',
    };
  }
  if (milestone >= 15) {
    return {
      badge: `⚡ Mốc ${milestone} từ vựng`,
      encouragement:
        'Đã có 15 từ cần củng cố lại. Một phiên ôn ngắn 5 phút sẽ giúp não bộ khắc sâu trí nhớ dài hạn!',
    };
  }
  if (milestone >= 10) {
    return {
      badge: `✨ Mốc ${milestone} từ vựng`,
      encouragement:
        'Khoảng 10 từ đang chờ bạn. Bắt đầu một phiên ôn tập nhẹ nhàng ngay thôi!',
    };
  }
  return {
    badge: `🎯 Mốc ${milestone} từ vựng`,
    encouragement:
      'Dành 2-3 phút ôn nhanh để củng cố trí nhớ vi mô (micro-learning) nhé!',
  };
}

/**
 * Định dạng nội dung tin nhắn HTML gửi qua Telegram
 */
export function formatTelegramDueReminderMessage(params: {
  studentName: string;
  totalDue: number;
  badge: string;
  encouragement: string;
  sampleWord?: string | null;
  sampleIpa?: string | null;
  appUrl: string;
}): string {
  const {
    studentName,
    totalDue,
    badge,
    encouragement,
    sampleWord,
    sampleIpa,
    appUrl,
  } = params;

  let teaserText = '';
  if (sampleWord) {
    const ipaText = sampleIpa ? ` <code>/${sampleIpa}/</code>` : '';
    teaserText = `\n💡 <i>Gợi ý từ cần nhớ: <b>"${sampleWord}"</b>${ipaText}</i>\n`;
  }

  const reviewUrl = `${appUrl.replace(/\/$/, '')}/review`;

  return (
    `📚 <b>Nhắc nhở ôn tập — Vocab Plus App</b>\n` +
    `<i>[${badge}]</i>\n\n` +
    `Xin chào <b>${studentName}</b>!\n` +
    `Bạn đang có <b>${totalDue} từ vựng</b> đến hạn ôn tập hôm nay.\n` +
    teaserText +
    `\n⏱️ ${encouragement}\n\n` +
    `👉 <b><a href="${reviewUrl}">Mở App ôn tập ngay</a></b>`
  );
}
