import { apiClient } from '@/lib/axios';
import type {
  ImportedText,
  CreateImportedTextDto,
  ExtractWordsResponse,
  QuickSaveWordDto,
} from '@/types/imported-text.types';
import type { CardWithProgress } from '@/types/card.types';

export const importService = {
  /**
   * Lấy danh sách toàn bộ bài đọc đã lưu của user
   */
  getImportedTexts: (): Promise<ImportedText[]> => {
    return apiClient.get('/import');
  },

  /**
   * Lấy chi tiết một bài đọc theo ID
   */
  getImportedTextById: (id: string): Promise<ImportedText> => {
    return apiClient.get(`/import/${id}`);
  },

  /**
   * Lưu một bài đọc mới vào kho lưu trữ
   */
  saveImportedText: (payload: CreateImportedTextDto): Promise<ImportedText> => {
    return apiClient.post('/import', payload);
  },

  /**
   * Xóa một bài đọc khỏi kho lưu trữ
   */
  deleteImportedText: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/import/${id}`);
  },

  /**
   * Phân tích và trích xuất từ mới trong văn bản, đối chiếu với kho từ của user
   */
  extractWords: (rawText: string): Promise<ExtractWordsResponse> => {
    return apiClient.post('/import/extract', { raw_text: rawText });
  },

  /**
   * Lưu nhanh 1 từ từ Interactive Reader vào kho FSRS (kèm câu ngữ cảnh)
   */
  quickSaveWord: (payload: QuickSaveWordDto): Promise<import('@/types/imported-text.types').QuickSaveWordResult> => {
    return apiClient.post('/import/quick-save', payload);
  },
};

