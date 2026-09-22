import { apiClient } from '@/lib/axios';
import type { Tables } from '@/types/database.types';
import type { LeagueTier } from '@/constants/leagues';
import type { PublicUserProfile } from '@/types/admin-user.types';

export type UserProfile = Tables<'profiles'> & {
  league?: LeagueTier;
};

export const userService = {
  getProfile: (): Promise<UserProfile> => {
    return apiClient.get('/user/profile');
  },
  getPublicProfile: (id: string): Promise<PublicUserProfile> => {
    return apiClient.get(`/users/${id}`);
  },
};
