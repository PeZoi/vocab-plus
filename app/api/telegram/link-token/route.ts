import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTelegramBotUsername } from '@/lib/telegram';
import crypto from 'crypto';

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

    const botUsername = getTelegramBotUsername();

    // Sinh token ngẫu nhiên an toàn: 12 ký tự hex
    const randomHex = crypto.randomBytes(6).toString('hex');
    const token = `vcb_${randomHex}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 phút

    // Xóa các token cũ của user để tránh rác
    await supabase
      .from('telegram_link_tokens')
      .delete()
      .eq('user_id', user.id);

    // Lưu token mới
    const { error: insertError } = await supabase
      .from('telegram_link_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('[TELEGRAM_LINK_TOKEN] Insert error:', insertError);
      return NextResponse.json(
        { error: 'DatabaseError', message: 'Không thể tạo mã liên kết' },
        { status: 500 }
      );
    }

    const deepLink = botUsername ? `https://t.me/${botUsername}?start=${token}` : '';

    return NextResponse.json({
      success: true,
      token,
      botUsername,
      deepLink,
      expiresAt,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.error('[TELEGRAM_LINK_TOKEN] Exception:', err);
    return NextResponse.json(
      { error: 'InternalServerError', message: errorMsg },
      { status: 500 }
    );
  }
}
