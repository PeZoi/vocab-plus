'use client';

import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/constants/query-keys';
import type { Tables } from '@/types/database.types';
import type { LeagueTier } from '@/constants/leagues';

export type UserProfile = Tables<'profiles'> & {
  league?: LeagueTier;
};

export function useUserProfile() {
  const query = useQuery<UserProfile>({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Không thể tải thông tin tài khoản');
      return res.json();
    },
  });

  return {
    profile: query.data,
    isAdmin: query.data?.role === 'admin',
    isLoading: query.isLoading,
    error: query.error,
  };
}
