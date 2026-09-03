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

    const isAdmin = await checkAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin)' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('ai_provider_configs')
      .select('*')
      .order('is_default', { ascending: false });

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
    const { id, api_key, model, is_active, is_default } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID cấu hình là bắt buộc' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (api_key !== undefined) updatePayload.api_key = api_key;
    if (model !== undefined) updatePayload.model = model;
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (is_default !== undefined) updatePayload.is_default = is_default;

    // Nếu set default, bỏ default các provider khác
    if (is_default) {
      await supabase
        .from('ai_provider_configs')
        .update({ is_default: false })
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('ai_provider_configs')
      .update(updatePayload)
      .eq('id', id)
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
