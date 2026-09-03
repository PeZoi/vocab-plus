import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;

  // Bỏ qua kiểm tra auth và redirect trong middleware cho API routes
  // (API route handlers tự xác thực nghiêm ngặt và trả về JSON 401 chuẩn)
  if (pathname.startsWith('/api/') || pathname.startsWith('/auth/callback')) {
    return response;
  }

  // Refresh auth session cho các trang giao diện (Page routes)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === '/login';

  // Strict Auth Gate: Nếu chưa đăng nhập và không phải trang login -> Chuyển hướng về /login
  if (!user && !isLoginPage) {
    const redirectUrl = new URL('/login', request.url);
    // Lưu lại URL gốc để sau khi đăng nhập xong sẽ quay lại
    if (pathname !== '/') {
      redirectUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Nếu đã đăng nhập mà truy cập /login -> Chuyển hướng về trang chủ /
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
