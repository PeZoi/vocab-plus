import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Xác thực Secret của Cron Job
 * Chấp nhận qua:
 * 1. Header: Authorization: Bearer <CRON_SECRET>
 * 2. Header: x-cron-secret: <CRON_SECRET>
 * 3. Query Param: ?secret=<CRON_SECRET>
 */
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

async function handleSettleLeagues(request: Request) {
  // 1. Kiểm tra xác thực Cron Secret
  const isValid = verifyCronSecret(request);
  if (!isValid) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message:
          'Yêu cầu mã bí mật hợp lệ (CRON_SECRET). Cung cấp qua Header Authorization: Bearer <token>, x-cron-secret, hoặc query ?secret=<token>',
      },
      { status: 401 }
    );
  }

  try {
    // 2. Khởi tạo Supabase client
    const supabase = await createClient();

    // 3. Thực thi Database Function Atomic RPC
    const { data, error } = await supabase.rpc('settle_weekly_leagues');

    if (error) {
      console.error('[CRON_SETTLE_LEAGUES] Database RPC error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Đã chốt sổ giải đấu tuần và phân định bậc rank thành công!',
        result: data,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống không xác định';
    console.error('[CRON_SETTLE_LEAGUES] Unexpected error:', err);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/settle-leagues
 * Endpoint tiêu chuẩn cho các dịch vụ cron webhook bên ngoài (CronJob.org, EasyCron, GitHub Actions...)
 */
export async function POST(request: Request) {
  return handleSettleLeagues(request);
}

/**
 * GET /api/cron/settle-leagues?secret=...
 * Endpoint dự phòng hỗ trợ trigger kiểm tra nhanh qua URL trình duyệt hoặc Webhook GET
 */
export async function GET(request: Request) {
  return handleSettleLeagues(request);
}
