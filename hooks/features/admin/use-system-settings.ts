import { adminKeys } from '@/constants/query-keys';
import { adminService, type SystemSetting } from '@/services/admin.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook truy vấn danh sách cấu hình hệ thống
 */
export function useSystemSettingsQuery(enabled: boolean = true) {
  return useQuery<SystemSetting[]>({
    queryKey: adminKeys.settings(),
    queryFn: () => adminService.getSystemSettings(),
    enabled,
  });
}

/**
 * Hook cập nhật một cấu hình hệ thống
 */
export function useUpdateSystemSettingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      adminService.updateSystemSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() });
    },
  });
}
