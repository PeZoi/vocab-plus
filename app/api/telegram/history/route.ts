import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Vui lòng đăng nhập để xem lịch sử' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '5', 10);
    const limit = isNaN(limitParam) ? 5 : Math.min(Math.max(1, limitParam), 20);

    const { data: logs, error: dbError } = await supabase
      .from('telegram_notification_logs')
      .select('id, user_id, chat_id, title, message, type, status, error_message, metadata, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (dbError) {
      console.error('[TELEGRAM_HISTORY] Fetch error:', dbError);
      return NextResponse.json(
        { error: 'DatabaseError', message: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: logs || [],
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    console.error('[TELEGRAM_HISTORY] Exception:', err);
    return NextResponse.json(
      { error: 'InternalServerError', message: errorMsg },
      { status: 500 }
    );
  }
}
