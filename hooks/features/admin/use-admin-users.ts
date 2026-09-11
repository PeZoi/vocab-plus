'use client';

import { adminKeys, reviewKeys, userKeys } from '@/constants/query-keys';
import { adminService } from '@/services/admin.service';
import type { ResetStreakPayload } from '@/types/admin-user.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook lấy danh sách người dùng dành cho Quản trị viên
 */
export function useAdminUsersQuery(params?: { search?: string; role?: string }) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => adminService.getUsers(params),
    staleTime: 1000 * 30, // 30s
  });
}

/**
 * Hook lấy chi tiết thông tin và thống kê học tập của một người dùng
 */
export function useAdminUserDetailQuery(userId: string) {
  return useQuery({
    queryKey: adminKeys.userDetail(userId),
    queryFn: () => adminService.getUserDetail(userId),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

/**
 * Mutation reset / giả lập chuỗi streak của người dùng
 */
export function useResetStreakMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: ResetStreakPayload;
    }) => adminService.resetUserStreak(userId, payload),
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Đã cập nhật chuỗi streak thành công!');

      // Làm mới cache danh sách và chi tiết user
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminKeys.userDetail(variables.userId),
      });

      // Làm mới cache streak trên Header nếu admin tự reset cho chính mình
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Có lỗi xảy ra khi reset chuỗi streak');
    },
  });
}

/**
 * Mutation cập nhật vai trò (admin / user)
 */
export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: 'admin' | 'user';
    }) => adminService.updateUserRole(userId, role),
    onSuccess: (data, variables) => {
      toast.success(
        `Đã cập nhật vai trò thành ${variables.role === 'admin' ? 'Quản trị viên' : 'Học viên'}`
      );
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminKeys.userDetail(variables.userId),
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Có lỗi xảy ra khi cập nhật vai trò');
    },
  });
}
