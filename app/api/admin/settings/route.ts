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

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key và Value cấu hình là bắt buộc' }, { status: 400 });
    }

    // Đảm bảo value là object hợp lệ
    const jsonValue = typeof value === 'object' ? value : { value };

    const { data, error } = await supabase
      .from('system_settings')
      .upsert(
        {
          key,
          value: jsonValue,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
