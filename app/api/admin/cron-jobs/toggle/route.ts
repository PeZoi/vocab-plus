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
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = (await request.json()) as { jobid: number; active: boolean };
    if (body.jobid === undefined || body.active === undefined) {
      return NextResponse.json({ error: 'Thiếu tham số jobid hoặc active' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('admin_toggle_cron_job', {
      p_jobid: body.jobid,
      p_active: Boolean(body.active),
    });

    if (error) {
      console.error('[ADMIN_CRON_TOGGLE] RPC Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
