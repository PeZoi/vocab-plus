/**
 * Tiện ích làm sạch và trích xuất JSON an toàn từ phản hồi của các mô hình AI (DeepSeek, Llama, Qwen, OrcaRouter...)
 */

export function sanitizeJsonString(raw: string): string {
  let result = '';
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];

    if (char === '"' && !isEscaped) {
      inString = !inString;
      result += char;
    } else if (char === '\\' && !isEscaped) {
      isEscaped = true;
      result += char;
    } else {
      if (inString) {
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else {
          result += char;
        }
      } else {
        result += char;
      }
      isEscaped = false;
    }
  }

  return result;
}

export function extractAndParseJson<T>(rawContent: string): T {
  if (!rawContent || typeof rawContent !== 'string') {
    throw new Error('AI không trả về nội dung');
  }

  // 1. Loại bỏ thinking tokens (<think>...</think>) phổ biến ở DeepSeek-R1
  let cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Loại bỏ markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
  }

  // 3. Trích xuất khoảng JSON {...}
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  } else {
    throw new Error('Mô hình AI không trả về dữ liệu JSON hợp lệ. Vui lòng bấm thử lại.');
  }

  // 4. Thử parse trực tiếp
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 5. Thử lại sau khi đã escape các ký tự điều khiển trong chuỗi string literal
    const sanitized = sanitizeJsonString(cleaned);
    return JSON.parse(sanitized) as T;
  }
}
