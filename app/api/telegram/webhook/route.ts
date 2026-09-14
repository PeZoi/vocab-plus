import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

interface TelegramFrom {
  id: number;
  first_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
  first_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramFrom;
  chat: TelegramChat;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface LinkRpcResponse {
  success: boolean;
  code?: string;
  message?: string;
  user_id?: string;
  display_name?: string;
}

export async function POST(request: Request) {
  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;

    if (!message || !message.chat || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const isPrivate = message.chat.type === 'private';

    if (!isPrivate) {
      await sendTelegramMessage(
        chatId,
        '🔒 <b>Vocab Plus App</b> chỉ hỗ trợ trò chuyện riêng tư để bảo vệ tiến độ học tập cá nhân của bạn. Vui lòng nhắn tin trực tiếp cho Bot nhé!'
      );
      return NextResponse.json({ ok: true });
    }

    const supabase = await createClient();

    // 1. Xử lý lệnh /start (kèm token kết nối)
    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/);
      const token = parts[1]?.trim();

      if (token) {
        // Thực hiện liên kết qua RPC Database
        const { data: rpcRes, error: rpcErr } = await supabase.rpc(
          'link_telegram_chat' as unknown as 'admin_reset_all_leagues',
          {
            p_token: token,
            p_chat_id: chatId,
          } as unknown as { p_admin_id?: string }
        );

        const linkResult = rpcRes as unknown as LinkRpcResponse;

        if (rpcErr || !linkResult?.success) {
          await sendTelegramMessage(
            chatId,
            '⚠️ <b>Mã liên kết không hợp lệ hoặc đã hết hạn</b>\n\n' +
            'Vui lòng truy cập <b>Vocab Plus App &gt; Cài đặt &gt; Telegram</b> và nhấn <b>"Lấy mã kết nối mới"</b> để thử lại nhé.'
          );
          return NextResponse.json({ ok: true });
        }

        const studentName = linkResult.display_name || message.from?.first_name || 'bạn';
        await sendTelegramMessage(
          chatId,
          `🎉 <b>Chúc mừng ${studentName} đã kết nối thành công!</b>\n\n` +
          `Tài khoản <b>Vocab Plus App</b> của bạn đã được kích hoạt nhận thông báo riêng tư.\n\n` +
          `✨ <b>Bạn sẽ nhận được:</b>\n` +
          `• ⏰ Nhắc nhở từ vựng đến hạn ôn tập hàng ngày (SRS)\n` +
          `• ⚡ Thông báo khung <b>Giờ Vàng x2 XP</b>\n` +
          `• 🏆 Cập nhật thứ hạng giải đấu tuần\n\n` +
          `Chúc bạn học tập thật bứt phá và giữ chuỗi Streak rực rỡ! 🔥`
        );
        return NextResponse.json({ ok: true });
      }

      // /start không có token: Kiểm tra trạng thái hiện tại
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, telegram_notifications_enabled')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (profile) {
        await sendTelegramMessage(
          chatId,
          `👋 <b>Chào bạn, ${profile.display_name || 'Học viên'}!</b>\n\n` +
          `Tài khoản Vocab Plus App của bạn đang được kết nối với Bot này. Bạn sẽ nhận thông báo riêng tư khi có bài ôn tập.\n\n` +
          `• Gõ <b>/status</b> để kiểm tra trạng thái\n` +
          `• Gõ <b>/unlink</b> nếu muốn ngắt kết nối`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `👋 <b>Chào mừng bạn đến với Vocab Plus App Bot!</b>\n\n` +
          `Để nhận thông báo riêng tư khi đến hạn ôn tập từ vựng, bạn hãy liên kết Bot với tài khoản học của mình.\n\n` +
          `👉 <b>Cách làm:</b>\n` +
          `1. Mở trang web <b>Vocab Plus App</b>\n` +
          `2. Vào mục <b>Cài đặt &gt; Telegram</b>\n` +
          `3. Bấm <b>"Kết nối 1-chạm"</b> để tự động kích hoạt.\n\n` +
          `Hẹn gặp lại bạn trong những phiên ôn luyện!`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // 2. Lệnh /status: Kiểm tra trạng thái liên kết
    if (text === '/status') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, telegram_notifications_enabled, xp')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (profile) {
        await sendTelegramMessage(
          chatId,
          `📊 <b>Trạng thái kết nối: Đang hoạt động</b>\n\n` +
          `👤 Học viên: <b>${profile.display_name || 'Học viên'}</b>\n` +
          `✨ Tổng XP tích lũy: <b>${profile.xp ?? 0} XP</b>\n` +
          `🔔 Trạng thái thông báo: <b>${profile.telegram_notifications_enabled ? 'Bật ✅' : 'Tắt ⏸️'
          }</b>\n\n` +
          `Mọi thông báo nhắc học sẽ gửi riêng tư vào hộp thoại này!`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `⚠️ Bạn chưa liên kết tài khoản Vocab Plus App. Vui lòng vào <b>Cài đặt &gt; Telegram</b> trên web để kết nối.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // 3. Lệnh /unlink hoặc /disconnect
    if (text === '/unlink' || text === '/disconnect') {
      await supabase.rpc(
        'unlink_telegram_chat' as unknown as 'admin_reset_all_leagues',
        {
          p_chat_id: chatId,
        } as unknown as { p_admin_id?: string }
      );

      await sendTelegramMessage(
        chatId,
        `👋 Đã ngắt kết nối Telegram với tài khoản Vocab Plus App của bạn. Bạn có thể kết nối lại bất cứ lúc nào từ trang Cài đặt!`
      );
      return NextResponse.json({ ok: true });
    }

    // 4. Các tin nhắn thông thường
    await sendTelegramMessage(
      chatId,
      `🤖 Xin chào! Đây là bot thông báo tự động của <b>Vocab Plus App</b>.\n\n` +
      `• Gõ <b>/status</b> để kiểm tra kết nối\n` +
      `• Gõ <b>/unlink</b> để hủy liên kết\n` +
      `• Mở Vocab Plus App trên trình duyệt để ôn tập từ vựng ngay nhé!`
    );

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('[TELEGRAM_WEBHOOK] Exception:', err);
    return NextResponse.json({ ok: true });
  }
}
