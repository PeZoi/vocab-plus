/**
 * Chuẩn hóa và trích xuất thông báo lỗi thân thiện từ Error, Axios hoặc Supabase error
 */
export function getErrorMessage(error: unknown, fallback: string = 'Đã có lỗi xảy ra!'): string {
  if (!error) return fallback;

  if (typeof error === 'string') return error;

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string') return errObj.message;
    if (typeof errObj.error === 'string') return errObj.error;
    if (typeof errObj.error_description === 'string') return errObj.error_description;
  }

  return fallback;
}
