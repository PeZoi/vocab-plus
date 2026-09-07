import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateImportedTextDto } from '@/types/imported-text.types';

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
      .from('imported_texts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
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

    const body: CreateImportedTextDto = await request.json();

    if (!body.raw_text || !body.raw_text.trim()) {
      return NextResponse.json({ error: 'Nội dung văn bản không được để trống' }, { status: 400 });
    }

    const title = body.title?.trim() || 'Bài đọc không tên';

    const { data, error } = await supabase
      .from('imported_texts')
      .insert({
        user_id: user.id,
        title,
        raw_text: body.raw_text.trim(),
        detected_words: body.detected_words ? JSON.parse(JSON.stringify(body.detected_words)) : [],
      })
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
