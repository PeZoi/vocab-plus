import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập để thực hiện' },
        { status: 401 }
      );
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('display_name, telegram_chat_id, telegram_notifications_enabled, timezone')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile?.telegram_chat_id) {
      return NextResponse.json(
        {
          error: 'NotConnected',
          message: 'Bạn chưa kết nối tài khoản với Telegram Bot. Vui lòng bấm "Kết nối 1-chạm" trước.',
        },
        { status: 400 }
      );
    }

    const studentName = profile.display_name || 'Học viên';
    const nowStr = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: profile.timezone || 'Asia/Ho_Chi_Minh',
    });

    const messageText =
      `🔔 <b>Kiểm tra kết nối Vocab Plus App</b>\n\n` +
      `Xin chào <b>${studentName}</b>! Đây là tin nhắn thử nghiệm gửi lúc <b>${nowStr}</b>.\n\n` +
      `✅ Kết nối riêng tư của bạn đang hoạt động hoàn hảo.\n` +
      `📚 Hệ thống sẽ gửi thông báo vào hộp thoại này mỗi khi bạn có từ vựng đến hạn ôn tập.\n\n` +
      `<i>Chúc bạn một ngày học tập thật hiệu quả!</i> 🌟`;

    const res = await sendTelegramMessage(profile.telegram_chat_id, messageText);

    // Ghi nhận lịch sử thông báo
    await supabase.from('telegram_notification_logs').insert({
      user_id: user.id,
      chat_id: profile.telegram_chat_id,
      title: 'Kiểm tra kết nối Bot',
      message: messageText,
      type: 'test',
      status: res.ok ? 'sent' : 'failed',
      error_message: res.ok ? null : res.description,
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: 'SendFailed',
          message: res.description || 'Không thể gửi tin nhắn Telegram. Vui lòng kiểm tra lại bot.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã gửi thông báo thử nghiệm thành công tới Telegram của bạn!',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.error('[TELEGRAM_TEST] Exception:', err);
    return NextResponse.json(
      { error: 'InternalServerError', message: errorMsg },
      { status: 500 }
    );
  }
}
