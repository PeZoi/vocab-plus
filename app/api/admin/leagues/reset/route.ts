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

/**
 * POST /api/admin/leagues/reset
 * API dành riêng cho Quản trị viên (Admin) để reset rank toàn bộ người dùng về 'unranked',
 * làm mới điểm tuần thi đua về 0, nhưng BẢO TOÀN 100% TỔNG XP TÍCH LŨY (profiles.xp).
 */
export async function POST() {
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

    // Thực thi Database Function Atomic RPC
    const { data, error } = await supabase.rpc('admin_reset_all_leagues');

    if (error) {
      console.error('[ADMIN_RESET_LEAGUES] RPC Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Đã reset rank toàn bộ học viên thành công! Tổng XP vẫn được giữ nguyên vẹn.',
      result: data,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi hệ thống không xác định';
    console.error('[ADMIN_RESET_LEAGUES] Unexpected Error:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
