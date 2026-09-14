import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

// Bước nhảy milestone thông báo số từ đến hạn (5, 10, 15, 20, ...)
const MILESTONE_STEP = 5;

// Giãn cách gửi nhắc nhở tối thiểu nếu vẫn ở cùng một mốc mà chưa học (24 giờ)
const COOLDOWN_HOURS_SAME_MILESTONE = 24;

interface SampleCardInfo {
  word?: string;
  ipa?: string | null;
  definition?: string | null;
}

function verifyCronSecret(request: Request): boolean {
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

function getMilestoneBadge(milestone: number): { badge: string; encouragement: string } {
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

async function handleSendReminders(request: Request) {
  const isValid = verifyCronSecret(request);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Yêu cầu mã bí mật hợp lệ (CRON_SECRET)' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Lấy danh sách người dùng đã liên kết Telegram và bật thông báo
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select(
        'id, display_name, telegram_chat_id, telegram_last_notified_milestone, telegram_last_notified_at'
      )
      .not('telegram_chat_id', 'is', null)
      .eq('telegram_notifications_enabled', true);

    if (userError) {
      console.error('[CRON_TELEGRAM] Fetch users error:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có người dùng nào liên kết Telegram cần gửi',
        sentCount: 0,
      });
    }

    const nowIso = new Date().toISOString();
    let sentCount = 0;
    let resetCount = 0;

    // 2. Duyệt qua từng học viên và tính toán mốc đến hạn (5, 10, 15, 20...)
    for (const u of users) {
      if (!u.telegram_chat_id) continue;

      const { count: dueCount, error: countErr } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', u.id)
        .lte('due_at', nowIso)
        .neq('state', 'mastered');

      if (countErr) {
        console.error(`[CRON_TELEGRAM] Count error for user ${u.id}:`, countErr);
        continue;
      }

      const totalDue = dueCount ?? 0;
      const lastNotifiedMilestone = u.telegram_last_notified_milestone ?? 0;
      const currentMilestone = Math.floor(totalDue / MILESTONE_STEP) * MILESTONE_STEP;

      // TH1: Học viên đã học bớt từ vựng -> Tự động hạ/reset mốc đã thông báo
      if (currentMilestone < lastNotifiedMilestone) {
        await supabase
          .from('profiles')
          .update({ telegram_last_notified_milestone: currentMilestone })
          .eq('id', u.id);
        resetCount++;
        continue;
      }

      // TH2: Chưa đạt mốc tối thiểu đầu tiên (< 5 từ)
      if (totalDue < MILESTONE_STEP || currentMilestone === 0) {
        continue;
      }

      // TH3: Kiểm tra xem đã vượt mốc mới chưa hoặc đã qua cooldown 24h ở cùng mốc
      const isNewMilestone = currentMilestone > lastNotifiedMilestone;
      const lastNotifiedTime = u.telegram_last_notified_at
        ? new Date(u.telegram_last_notified_at).getTime()
        : 0;
      const hoursSinceLast = (Date.now() - lastNotifiedTime) / (1000 * 60 * 60);
      const isCooldownElapsed = hoursSinceLast >= COOLDOWN_HOURS_SAME_MILESTONE;

      // Nếu chưa đạt mốc cao hơn VÀ chưa hết thời gian giãn cách -> Không spam
      if (!isNewMilestone && !isCooldownElapsed) {
        continue;
      }

      // Lấy 1 từ vựng tiêu biểu để làm teaser gây tò mò
      const { data: sampleCardData } = await supabase
        .from('user_cards')
        .select('cards(word, ipa, definition)')
        .eq('user_id', u.id)
        .lte('due_at', nowIso)
        .neq('state', 'mastered')
        .limit(1)
        .maybeSingle();

      const sampleCard = (sampleCardData?.cards as unknown as SampleCardInfo) ?? null;

      const studentName = u.display_name || 'bạn';
      const { badge, encouragement } = getMilestoneBadge(currentMilestone);

      const appBaseUrl = (
        process.env.NEXT_PUBLIC_APP_URL || 'https://vocab-plus.vercel.app'
      ).replace(/\/$/, '');
      const reviewUrl = `${appBaseUrl}/review`;

      let teaserText = '';
      if (sampleCard?.word) {
        const ipaText = sampleCard.ipa ? ` <code>/${sampleCard.ipa}/</code>` : '';
        teaserText = `\n💡 <i>Gợi ý từ cần nhớ: <b>"${sampleCard.word}"</b>${ipaText}</i>\n`;
      }

      const msg =
        `📚 <b>Nhắc nhở ôn tập — Vocab Plus App</b>\n` +
        `<i>[${badge}]</i>\n\n` +
        `Xin chào <b>${studentName}</b>!\n` +
        `Bạn đang có <b>${totalDue} từ vựng</b> đến hạn ôn tập hôm nay.\n` +
        teaserText +
        `\n⏱️ ${encouragement}\n\n` +
        `👉 <b><a href="${reviewUrl}">Mở App ôn tập ngay</a></b>`;

      const res = await sendTelegramMessage(u.telegram_chat_id, msg);
      if (res.ok) {
        sentCount++;
        // Ghi nhận mốc đã thông báo và thời điểm gửi
        await supabase
          .from('profiles')
          .update({
            telegram_last_notified_milestone: currentMilestone,
            telegram_last_notified_at: new Date().toISOString(),
          })
          .eq('id', u.id);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      resetCount,
      totalChecked: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.error('[CRON_TELEGRAM] Exception:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleSendReminders(request);
}

export async function GET(request: Request) {
  return handleSendReminders(request);
}
