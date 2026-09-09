/**
 * Cấu hình tập trung và quản lý các AI Provider trong hệ thống
 */

export interface AIProviderMeta {
  provider_name: string;
  display_name: string;
  endpoint: string;
  defaultModel: string;
  placeholderKey: string;
  placeholderModel: string;
  description: string;
  badgeLabel: string;
  icon: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
}

export const SUPPORTED_PROVIDERS: Record<string, AIProviderMeta> = {
  kira: {
    provider_name: 'kira',
    display_name: 'Kira AI',
    endpoint: 'https://kiraai.vn/api/v1/chat/completions',
    defaultModel: 'kira-auto',
    placeholderKey: 'vd: kira_... hoặc Bearer token từ kiraai.vn',
    placeholderModel: 'vd: kira-auto',
    description: 'Dịch vụ AI tối ưu với mô hình kira-auto',
    badgeLabel: 'Cổng AI Kira (kiraai.vn)',
    icon: '⚡',
    buildHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    }),
  },
  orcarouter: {
    provider_name: 'orcarouter',
    display_name: 'OrcaRouter',
    endpoint: 'https://api.orcarouter.ai/v1/chat/completions',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    placeholderKey: 'vd: orca_... hoặc sk_...',
    placeholderModel: 'vd: meta-llama/llama-3.3-70b-instruct, openai/gpt-4o-mini...',
    description: 'Gateway OpenAI-compatible tự động định tuyến',
    badgeLabel: 'Gateway OpenAI-compatible tự động định tuyến',
    icon: '🐋',
    buildHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
      'HTTP-Referer': 'https://vocabapp.plus',
      'X-Title': 'VocabApp',
    }),
  },
  openrouter: {
    provider_name: 'openrouter',
    display_name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct',
    placeholderKey: 'vd: sk-or-...',
    placeholderModel: 'vd: meta-llama/llama-3.3-70b-instruct, anthropic/claude-3.5-sonnet...',
    description: 'Cổng kết nối đa mô hình OpenRouter',
    badgeLabel: 'Cổng định tuyến LLM toàn cầu OpenRouter',
    icon: '🌐',
    buildHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
      'HTTP-Referer': 'https://vocabapp.plus',
      'X-Title': 'VocabApp',
    }),
  },
  groq: {
    provider_name: 'groq',
    display_name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    placeholderKey: 'vd: gsk_...',
    placeholderModel: 'vd: llama-3.3-70b-versatile, qwen/qwen3.8-27b...',
    description: 'Tăng tốc Llama/Qwen siêu tốc độ',
    badgeLabel: 'Tăng tốc Llama/Qwen siêu tốc độ',
    icon: 'GR',
    buildHeaders: (apiKey: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    }),
  },
};

/**
 * Lấy cấu hình metadata của provider theo tên định danh
 */
export function getProviderConfig(providerName?: string | null): AIProviderMeta {
  const key = providerName?.toLowerCase().trim() || 'groq';
  if (key === 'kira' || key === 'kiraai') {
    return SUPPORTED_PROVIDERS.kira;
  }
  return SUPPORTED_PROVIDERS[key] || SUPPORTED_PROVIDERS.groq;
}

/**
 * Lấy URL endpoint tương ứng của provider
 */
export function getProviderEndpoint(providerName?: string | null): string {
  return getProviderConfig(providerName).endpoint;
}

/**
 * Lấy model mặc định tương ứng của provider nếu người dùng chưa cấu hình
 */
export function getDefaultModelForProvider(providerName?: string | null): string {
  return getProviderConfig(providerName).defaultModel;
}

/**
 * Lấy tên hiển thị của provider
 */
export function getProviderDisplayName(
  providerName?: string | null,
  customDisplayName?: string | null
): string {
  if (customDisplayName?.trim()) {
    return customDisplayName.trim();
  }
  return getProviderConfig(providerName).display_name;
}

/**
 * Xây dựng Headers chuẩn hóa tương ứng cho từng provider
 */
export function getProviderHeaders(
  providerName: string | null | undefined,
  apiKey: string
): Record<string, string> {
  return getProviderConfig(providerName).buildHeaders(apiKey);
}

/**
 * Kiểm tra xem mã trạng thái HTTP có phải lỗi tạm thời có thể retry hay không
 * (Rate limit 429, Internal Server Error 500, Bad Gateway 502, Service Unavailable 503, Gateway Timeout 504)
 */
export function isTransientAIError(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/**
 * Bóc tách và làm sạch nội dung lỗi từ phản hồi HTTP của AI Provider (loại bỏ thẻ HTML thô)
 */
export function parseAIErrorResponse(
  status: number,
  statusText: string,
  rawBody: string,
  providerLabel: string
): string {
  // Nếu máy chủ trả về mã HTML (thường là Nginx / Cloudflare khi 502, 503, 504...)
  if (
    rawBody.includes('<html') ||
    rawBody.includes('<!DOCTYPE') ||
    rawBody.includes('<head') ||
    rawBody.includes('<body')
  ) {
    if (status === 502 || rawBody.includes('502 Bad Gateway')) {
      return `Máy chủ ${providerLabel} đang quá tải hoặc tạm thời gián đoạn (502 Bad Gateway). Vui lòng thử lại sau giây lát.`;
    }
    if (status === 503 || rawBody.includes('503 Service')) {
      return `Dịch vụ ${providerLabel} đang bảo trì hoặc quá tải (503 Service Unavailable). Vui lòng thử lại sau.`;
    }
    if (status === 504 || rawBody.includes('504 Gateway')) {
      return `Máy chủ ${providerLabel} phản hồi quá thời gian quy định (504 Gateway Timeout). Vui lòng thử lại.`;
    }
    return `Máy chủ ${providerLabel} báo lỗi kết nối (HTTP ${status}: ${statusText}). Vui lòng thử lại sau.`;
  }

  // Nếu là JSON
  try {
    const errJson = JSON.parse(rawBody);
    return errJson.error?.message || errJson.message || rawBody;
  } catch {
    return rawBody.trim() || statusText || `Lỗi không xác định (${status})`;
  }
}
