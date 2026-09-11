import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await props.params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    // Kiểm tra quyền Admin
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (currentProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Từ chối truy cập: Cần quyền Quản trị viên' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { role } = body;

    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ error: 'Role không hợp lệ (chỉ chấp nhận admin hoặc user)' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', targetUserId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, role });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
