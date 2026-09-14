import { apiClient } from '@/lib/axios';

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
};
