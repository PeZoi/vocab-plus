import { apiClient } from '@/lib/axios';
import type { Tables } from '@/types/database.types';

export type AIProviderConfig = Tables<'ai_provider_configs'>;

export interface UpdateAIProviderDto {
  id: string;
  api_key?: string;
  model?: string;
  is_active?: boolean;
  is_default?: boolean;
}

export interface TestAIProviderDto {
  api_key: string;
  model: string;
  provider_name?: string;
}

export interface TestAIProviderResponse {
  success: boolean;
  model: string;
  reply: string;
  error?: string;
}

export interface SystemSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export const adminService = {
  /**
   * Lấy danh sách cấu hình các nhà cung cấp AI toàn hệ thống
   */
  getAIProviders: (): Promise<AIProviderConfig[]> => {
    return apiClient.get('/admin/ai-providers');
  },

  /**
   * Cập nhật cấu hình model và API key của một AI Provider
   */
  updateAIProvider: (payload: UpdateAIProviderDto): Promise<AIProviderConfig> => {
    return apiClient.patch('/admin/ai-providers', payload);
  },

  /**
   * Kiểm tra kết nối thử nghiệm với mô hình và API key được nhập
   */
  testAIProvider: (payload: TestAIProviderDto): Promise<TestAIProviderResponse> => {
    return apiClient.post('/admin/ai-providers/test', payload);
  },

  /**
   * Lấy toàn bộ cấu hình hệ thống
   */
  getSystemSettings: (): Promise<SystemSetting[]> => {
    return apiClient.get('/admin/settings');
  },

  /**
   * Cập nhật một cấu hình hệ thống
   */
  updateSystemSetting: (key: string, value: unknown): Promise<SystemSetting> => {
    return apiClient.patch('/admin/settings', { key, value });
  },
};
