'use client';

import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/constants/query-keys';
import { userService, type UserProfile } from '@/services/user.service';

export type { UserProfile };

export function useUserProfile() {
  const query = useQuery<UserProfile>({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getProfile(),
  });

  return {
    profile: query.data,
    isAdmin: query.data?.role === 'admin',
    isLoading: query.isLoading,
    error: query.error,
  };
}
