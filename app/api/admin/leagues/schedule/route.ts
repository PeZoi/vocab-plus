import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'admin';
}

export interface RankResetScheduleConfig {
  enabled: boolean;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ...
  time: string; // HH:mm (e.g. '00:00')
  timezone: string;
  cronExpr?: string;
}

const DEFAULT_SCHEDULE: RankResetScheduleConfig = {
  enabled: true,
  dayOfWeek: 1, // Thứ Hai
  time: '00:00',
  timezone: 'Asia/Ho_Chi_Minh',
  cronExpr: '0 17 * * 0',
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const { data: setting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'rank_reset_schedule')
      .maybeSingle();

    const config = (setting?.value as unknown as RankResetScheduleConfig) || DEFAULT_SCHEDULE;

    return NextResponse.json({
      success: true,
      schedule: config,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const isAdmin = await checkAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin)' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const enabled = Boolean(body?.enabled ?? true);
    const dayOfWeek = Number(body?.dayOfWeek ?? 1);
    const time = String(body?.time || '00:00');
    const timezone = String(body?.timezone || 'Asia/Ho_Chi_Minh');

    // Gọi RPC cập nhật pg_cron
    const { data: rpcRes, error: rpcErr } = await supabase.rpc(
      'admin_update_rank_reset_schedule',
      {
        p_enabled: enabled,
        p_day_of_week: dayOfWeek,
        p_time: time,
        p_timezone: timezone,
      }
    );

    if (rpcErr) {
      console.error('[ADMIN_UPDATE_RANK_RESET_SCHEDULE] RPC error:', rpcErr);
      return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      result: rpcRes,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
