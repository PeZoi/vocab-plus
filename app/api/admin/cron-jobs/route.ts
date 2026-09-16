import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SaveCronJobPayload } from '@/types/admin-cron.types';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('admin_get_cron_jobs', {});

    if (error) {
      console.error('[ADMIN_CRON_GET] RPC Error:', error);
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

    const body = (await request.json()) as SaveCronJobPayload;
    if (!body.jobname?.trim() || !body.schedule?.trim() || !body.command?.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ tên job, biểu thức cron và câu lệnh SQL' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc('admin_save_cron_job', {
      p_jobname: body.jobname.trim(),
      p_schedule: body.schedule.trim(),
      p_command: body.command.trim(),
      p_active: body.active !== false,
    });

    if (error) {
      console.error('[ADMIN_CRON_SAVE] RPC Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const jobname = searchParams.get('jobname');

    if (!jobname?.trim()) {
      return NextResponse.json({ error: 'Thiếu tham số jobname' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('admin_delete_cron_job', {
      p_jobname: jobname.trim(),
    });

    if (error) {
      console.error('[ADMIN_CRON_DELETE] RPC Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
