import { apiClient } from '@/lib/axios';
import type { TelegramHistoryResponse } from '@/types/telegram.types';

export interface TelegramLinkTokenResponse {
  success: boolean;
  token: string;
  botUsername: string;
  deepLink: string;
  expiresAt: string;
}

export interface TelegramGeneralResponse {
  success: boolean;
  message: string;
  enabled?: boolean;
}

export const telegramService = {
  /**
   * Tạo token liên kết 1-on-1 cho tài khoản
   */
  generateLinkToken: (): Promise<TelegramLinkTokenResponse> => {
    return apiClient.post('/telegram/link-token');
  },

  /**
   * Gửi tin nhắn thử nghiệm tới Telegram đã liên kết
   */
  sendTestMessage: (): Promise<TelegramGeneralResponse> => {
    return apiClient.post('/telegram/test');
  },

  /**
   * Ngắt kết nối Telegram
   */
  disconnectTelegram: (): Promise<TelegramGeneralResponse> => {
    return apiClient.post('/telegram/disconnect');
  },

  /**
   * Bật/tắt thông báo Telegram
   */
  toggleNotifications: (enabled: boolean): Promise<TelegramGeneralResponse> => {
    return apiClient.post('/telegram/toggle-notifications', { enabled });
  },

  /**
   * Lấy lịch sử thông báo Telegram gần nhất
   */
  getNotificationHistory: (limit: number = 5): Promise<TelegramHistoryResponse> => {
    return apiClient.get(`/telegram/history?limit=${limit}`);
  },
};

