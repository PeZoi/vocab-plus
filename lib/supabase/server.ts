import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

export async function getAuthenticatedUser(request?: Request) {
  const supabase = await createClient();

  // 1. Nếu có Authorization Bearer token trong request header, ưu tiên xác thực bằng JWT token
  if (request) {
    const authHeader =
      request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (data?.user && !error) {
            return { user: data.user, supabase, error: null };
          }
        } catch {
          // Fallback xuống cookie session
        }
      }
    }
  }

  // 2. Fallback: Lấy session người dùng từ cookie trình duyệt
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data?.user || null, supabase, error };
  } catch (err: unknown) {
    return { user: null, supabase, error: err };
  }
}
