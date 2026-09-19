import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/cards/[id]/audio
 * Cập nhật chuỗi audio_url (chứa link phát âm US & UK) cho thẻ từ trong Database
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Chưa xác thực' }, { status: 401 });
    }

    const body = (await request.json()) as { audio_url?: string };
    if (!body || typeof body.audio_url !== 'string') {
      return NextResponse.json({ error: 'audio_url không hợp lệ' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('cards')
      .update({ audio_url: body.audio_url })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, audio_url: body.audio_url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
