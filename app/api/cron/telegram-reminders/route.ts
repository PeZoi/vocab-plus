import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

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
      .select('id, display_name, telegram_chat_id')
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

    // 2. Kiểm tra số thẻ đến hạn cho từng người dùng và gửi 1-on-1
    for (const u of users) {
      if (!u.telegram_chat_id) continue;

      const { count: dueCount, error: countErr } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', u.id)
        .lte('due_at', nowIso)
        .neq('state', 'mastered');

      if (countErr || !dueCount || dueCount === 0) {
        continue;
      }

      const studentName = u.display_name || 'bạn';
      const msg =
        `📚 <b>Nhắc nhở ôn tập — Vocab Plus App</b>\n\n` +
        `Xin chào <b>${studentName}</b>! Bạn đang có <b>${dueCount} từ vựng</b> đến hạn ôn tập hôm nay.\n\n` +
        `⏱️ Dành 5 phút ôn luyện ngay để củng cố trí nhớ dài hạn và tích lũy thêm XP nhé!\n\n` +
        `👉 Mở app tại: <i>${process.env.NEXT_PUBLIC_APP_URL || 'Vocab Plus App'}</i>`;

      const res = await sendTelegramMessage(u.telegram_chat_id, msg);
      if (res.ok) {
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
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
