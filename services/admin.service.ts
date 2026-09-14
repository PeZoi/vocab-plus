import { apiClient } from '@/lib/axios';
import type { Tables } from '@/types/database.types';
import type {
  AdminUserDetail,
  AdminUserListItem,
  ResetStreakPayload,
  ResetStreakResponse,
} from '@/types/admin-user.types';

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

export interface ResetLeaguesResult {
  success: boolean;
  message: string;
  season_id?: string;
  season_number?: number;
  season_title?: string;
  total_participants?: number;
  reset_users_count?: number;
  reset_at?: string;
}

export interface ResetLeaguesResponse {
  success: boolean;
  message: string;
  result?: ResetLeaguesResult;
}

export interface RankResetSchedulePayload {
  enabled: boolean;
  dayOfWeek: number;
  time: string;
  timezone?: string;
}

export interface RankResetScheduleResponse {
  success: boolean;
  schedule: {
    enabled: boolean;
    dayOfWeek: number;
    time: string;
    timezone: string;
    cronExpr?: string;
  };
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

  /**
   * Lấy danh sách người dùng kèm thống kê
   */
  getUsers: (params?: { search?: string; role?: string }): Promise<{ users: AdminUserListItem[]; total: number }> => {
    return apiClient.get('/admin/users', { params });
  },

  /**
   * Lấy chi tiết thông tin và thống kê học tập của một người dùng
   */
  getUserDetail: (userId: string): Promise<AdminUserDetail> => {
    return apiClient.get(`/admin/users/${userId}`);
  },

  /**
   * Reset hoặc giả lập chuỗi streak của người dùng
   */
  resetUserStreak: (
    userId: string,
    payload: ResetStreakPayload
  ): Promise<ResetStreakResponse> => {
    return apiClient.post(`/admin/users/${userId}/reset-streak`, payload);
  },

  /**
   * Cập nhật vai trò tài khoản (admin / user)
   */
  updateUserRole: (userId: string, role: 'admin' | 'user'): Promise<{ success: boolean; role: string }> => {
    return apiClient.patch(`/admin/users/${userId}/role`, { role });
  },

  /**
   * Reset toàn bộ rank về 'unranked', làm mới điểm tuần, BẢO TOÀN 100% Tổng XP và lưu trữ lịch sử mùa giải
   */
  resetAllLeagues: (): Promise<ResetLeaguesResponse> => {
    return apiClient.post('/admin/leagues/reset');
  },

  /**
   * Lấy cấu hình lịch tự động Reset Rank bằng pg_cron
   */
  getRankResetSchedule: (): Promise<RankResetScheduleResponse> => {
    return apiClient.get('/admin/leagues/schedule');
  },

  /**
   * Cập nhật cấu hình lịch tự động Reset Rank và tái lập lịch trên Supabase pg_cron
   */
  updateRankResetSchedule: (
    payload: RankResetSchedulePayload
  ): Promise<{ success: boolean; result: unknown }> => {
    return apiClient.post('/admin/leagues/schedule', payload);
  },
};

