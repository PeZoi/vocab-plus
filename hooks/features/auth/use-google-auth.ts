'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signInWithGoogle = async (redirectPath?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const origin = window.location.origin;
      const callbackUrl = new URL('/auth/callback', origin);
      if (redirectPath && redirectPath !== '/') {
        callbackUrl.searchParams.set('redirect', redirectPath);
      }

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi đăng nhập Google');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    signOut,
    isLoading,
    error,
  };
}
