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
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobidParam = searchParams.get('jobid');
    const jobid = jobidParam && !isNaN(parseInt(jobidParam, 10)) ? parseInt(jobidParam, 10) : null;
    const statusParam = searchParams.get('status') || null;
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = isNaN(limitParam) ? 50 : Math.min(Math.max(1, limitParam), 100);

    const { data, error } = await supabase.rpc('admin_get_cron_run_details', {
      p_jobid: jobid ?? undefined,
      p_status: statusParam === 'all' || !statusParam ? undefined : statusParam,
      p_limit: limit,
    });

    if (error) {
      console.error('[ADMIN_CRON_RUNS] RPC Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
