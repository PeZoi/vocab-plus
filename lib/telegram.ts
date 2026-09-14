/**
 * Telegram Bot API Helper cho Vocab Plus App
 * Hỗ trợ gửi tin nhắn 1-on-1 riêng tư tới từng học viên qua Telegram Chat ID
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org';

export function getTelegramBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || '';
}

export function getTelegramBotUsername(): string {
  return (
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
    process.env.TELEGRAM_BOT_USERNAME ||
    ''
  ).replace(/^@/, '');
}

export interface SendTelegramMessageOptions {
  parseMode?: 'HTML' | 'MarkdownV2';
  replyMarkup?: unknown;
}

export interface TelegramApiResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

/**
 * Gửi tin nhắn 1-on-1 tới cá nhân qua Telegram
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options: SendTelegramMessageOptions = { parseMode: 'HTML' }
): Promise<TelegramApiResponse> {
  const token = getTelegramBotToken();
  if (!token) {
    console.warn('[TELEGRAM] Bỏ qua gửi tin: Chưa cấu hình TELEGRAM_BOT_TOKEN');
    return { ok: false, description: 'Chưa cấu hình TELEGRAM_BOT_TOKEN' };
  }

  try {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: options.parseMode || 'HTML',
    };

    if (options.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: TelegramApiResponse = await response.json();
    if (!data.ok) {
      console.error('[TELEGRAM] sendMessage error:', data.description);
    }
    return data;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối Telegram API';
    console.error('[TELEGRAM] sendTelegramMessage exception:', errorMsg);
    return { ok: false, description: errorMsg };
  }
}

/**
 * Cài đặt Webhook cho Telegram Bot
 */
export async function setTelegramWebhook(
  webhookUrl: string,
  secretToken?: string
): Promise<TelegramApiResponse> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: 'Chưa cấu hình TELEGRAM_BOT_TOKEN' };
  }

  try {
    const payload: Record<string, unknown> = {
      url: webhookUrl,
      drop_pending_updates: false,
    };
    if (secretToken) {
      payload.secret_token = secretToken;
    }

    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi setWebhook Telegram API';
    return { ok: false, description: errorMsg };
  }
}

/**
 * Kiểm tra trạng thái webhook hiện tại
 */
export async function getTelegramWebhookInfo(): Promise<TelegramApiResponse> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: 'Chưa cấu hình TELEGRAM_BOT_TOKEN' };
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getWebhookInfo`);
    return await response.json();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi getWebhookInfo';
    return { ok: false, description: errorMsg };
  }
}
