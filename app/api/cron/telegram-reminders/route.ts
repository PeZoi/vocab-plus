import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { verifyCronSecret } from '@/utils/cron';
import {
  TELEGRAM_REMINDER_MILESTONE_STEP,
  TELEGRAM_REMINDER_COOLDOWN_HOURS,
  getTelegramMilestoneBadge,
  formatTelegramDueReminderMessage,
} from '@/utils/telegram';
import type { DueReminderUser } from '@/types/telegram.types';

async function handleSendReminders(request: Request): Promise<NextResponse> {
  const isValid = verifyCronSecret(request);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Yêu cầu mã bí mật hợp lệ (CRON_SECRET)' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Lấy danh sách học viên cần nhắc nhở qua Database Function bảo mật (SECURITY DEFINER)
    const { data: users, error: userError } = await supabase.rpc(
      'cron_get_telegram_due_reminders'
    );

    if (userError) {
      console.error('[CRON_TELEGRAM] Fetch reminders error:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    const dueUsers: DueReminderUser[] = users || [];

    if (dueUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có học viên nào đạt mốc từ vựng cần gửi thông báo nhắc nhở',
        sentCount: 0,
        resetCount: 0,
        totalChecked: 0,
      });
    }

    let sentCount = 0;
    let resetCount = 0;

    // 2. Duyệt qua từng học viên và tính toán mốc đến hạn (5, 10, 15, 20...)
    for (const u of dueUsers) {
      if (!u.telegram_chat_id) continue;

      const totalDue = Number(u.total_due ?? 0);
      const lastNotifiedMilestone = Number(u.telegram_last_notified_milestone ?? 0);
      const currentMilestone =
        Math.floor(totalDue / TELEGRAM_REMINDER_MILESTONE_STEP) *
        TELEGRAM_REMINDER_MILESTONE_STEP;

      // TH1: Học viên đã học bớt từ vựng -> Tự động hạ/reset mốc đã thông báo
      if (currentMilestone < lastNotifiedMilestone) {
        await supabase.rpc('cron_update_telegram_last_notified', {
          p_user_id: u.user_id,
          p_milestone: currentMilestone,
          p_notified_at: u.telegram_last_notified_at || new Date().toISOString(),
        });
        resetCount++;
        continue;
      }

      // TH2: Chưa đạt mốc tối thiểu đầu tiên (< 5 từ)
      if (totalDue < TELEGRAM_REMINDER_MILESTONE_STEP || currentMilestone === 0) {
        continue;
      }

      // TH3: Kiểm tra xem đã vượt mốc mới chưa hoặc đã qua cooldown 24h ở cùng mốc
      const isNewMilestone = currentMilestone > lastNotifiedMilestone;
      const lastNotifiedTime = u.telegram_last_notified_at
        ? new Date(u.telegram_last_notified_at).getTime()
        : 0;
      const hoursSinceLast = (Date.now() - lastNotifiedTime) / (1000 * 60 * 60);
      const isCooldownElapsed =
        hoursSinceLast >= TELEGRAM_REMINDER_COOLDOWN_HOURS;

      // Nếu chưa đạt mốc cao hơn VÀ chưa hết thời gian giãn cách -> Không spam
      if (!isNewMilestone && !isCooldownElapsed) {
        continue;
      }

      const studentName = u.display_name || 'bạn';
      const { badge, encouragement } = getTelegramMilestoneBadge(currentMilestone);

      const appBaseUrl =
        process.env.NEXT_PUBLIC_APP_URL || 'https://vocab-plus.vercel.app';

      const msg = formatTelegramDueReminderMessage({
        studentName,
        totalDue,
        badge,
        encouragement,
        sampleWord: u.sample_word,
        sampleIpa: u.sample_ipa,
        appUrl: appBaseUrl,
      });

      const res = await sendTelegramMessage(u.telegram_chat_id, msg);

      // Ghi nhận lịch sử thông báo qua RPC bảo mật
      await supabase.rpc('log_telegram_notification', {
        p_user_id: u.user_id,
        p_chat_id: u.telegram_chat_id,
        p_title: `Nhắc nhở ôn tập (${totalDue} từ)`,
        p_message: msg,
        p_type: 'reminder',
        p_status: res.ok ? 'sent' : 'failed',
        p_error_message: res.ok ? null : res.description,
        p_metadata: { due_count: totalDue, milestone: currentMilestone },
      });

      if (res.ok) {
        sentCount++;
        // Ghi nhận mốc đã thông báo và thời điểm gửi
        await supabase.rpc('cron_update_telegram_last_notified', {
          p_user_id: u.user_id,
          p_milestone: currentMilestone,
          p_notified_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      resetCount,
      totalChecked: dueUsers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.error('[CRON_TELEGRAM] Exception:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  return handleSendReminders(request);
}

export async function GET(request: Request): Promise<NextResponse> {
  return handleSendReminders(request);
}
