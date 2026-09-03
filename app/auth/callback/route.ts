import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirect, requestUrl.origin));
    }
    console.error('Error exchanging code for session:', error);
  }

  // Nếu lỗi, quay lại trang login
  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
}
