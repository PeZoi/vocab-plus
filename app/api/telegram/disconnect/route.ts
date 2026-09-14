import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_chat_id: null,
        telegram_notifications_enabled: false,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[TELEGRAM_DISCONNECT] Update error:', updateError);
      return NextResponse.json(
        { error: 'DatabaseError', message: 'Không thể ngắt kết nối' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã ngắt kết nối tài khoản với Telegram Bot thành công.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.error('[TELEGRAM_DISCONNECT] Exception:', err);
    return NextResponse.json(
      { error: 'InternalServerError', message: errorMsg },
      { status: 500 }
    );
  }
}
