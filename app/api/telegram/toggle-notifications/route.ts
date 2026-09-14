import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
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

    const body = await request.json();
    const enabled = Boolean(body?.enabled);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_notifications_enabled: enabled,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[TELEGRAM_TOGGLE] Update error:', updateError);
      return NextResponse.json(
        { error: 'DatabaseError', message: 'Không thể cập nhật cài đặt thông báo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enabled,
      message: enabled
        ? 'Đã bật nhận thông báo ôn tập qua Telegram.'
        : 'Đã tạm dừng nhận thông báo ôn tập qua Telegram.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.error('[TELEGRAM_TOGGLE] Exception:', err);
    return NextResponse.json(
      { error: 'InternalServerError', message: errorMsg },
      { status: 500 }
    );
  }
}
