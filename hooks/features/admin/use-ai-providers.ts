import { aiKeys } from '@/constants/query-keys';
import {
  adminService,
  type AIProviderConfig,
  type TestAIProviderDto,
  type UpdateAIProviderDto,
} from '@/services/admin.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook truy vấn danh sách AI Providers dành riêng cho Quản trị viên
 */
export function useAIProvidersQuery(enabled: boolean = true) {
  return useQuery<AIProviderConfig[]>({
    queryKey: aiKeys.providers(),
    queryFn: () => adminService.getAIProviders(),
    enabled,
  });
}

/**
 * Hook cập nhật cấu hình của AI Provider
 */
export function useUpdateAIProviderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAIProviderDto) => adminService.updateAIProvider(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.all });
    },
  });
}

/**
 * Hook kiểm tra kết nối thử nghiệm mô hình AI
 */
export function useTestAIProviderMutation() {
  return useMutation({
    mutationFn: (payload: TestAIProviderDto) => adminService.testAIProvider(payload),
  });
}
