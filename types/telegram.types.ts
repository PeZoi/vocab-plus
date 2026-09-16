export type TelegramNotificationType =
  | 'test'
  | 'reminder'
  | 'system'
  | 'welcome'
  | 'duel';

export type TelegramNotificationStatus = 'sent' | 'failed';

export interface TelegramNotificationLog {
  id: string;
  user_id: string;
  chat_id: number;
  title: string;
  message: string;
  type: TelegramNotificationType;
  status: TelegramNotificationStatus;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface TelegramHistoryResponse {
  success: boolean;
  data: TelegramNotificationLog[];
}

export interface DueReminderUser {
  user_id: string;
  display_name: string | null;
  telegram_chat_id: number;
  telegram_last_notified_milestone: number;
  telegram_last_notified_at: string | null;
  total_due: number;
  sample_word: string | null;
  sample_ipa: string | null;
  sample_definition: string | null;
}

export interface DueReminderBadge {
  badge: string;
  encouragement: string;
}

