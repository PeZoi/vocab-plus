import { apiClient } from '@/lib/axios';
import type {
  TimedSegment,
  VideoMetadata,
  ConnectedSpeechTip,
  ListeningDifficulty,
  UserListeningProgressRecord,
  UserListeningProgressWithMeta,
} from '@/types/listening.types';

export interface TranscriptResponse {
  success: boolean;
  metadata: VideoMetadata;
  segments: TimedSegment[];
  hasCaptions?: boolean;
  isCurated?: boolean;
  isCached?: boolean;
  message?: string;
}

export interface ConnectedSpeechResponse {
  success: boolean;
  data: ConnectedSpeechTip;
}

export interface ProgressResponse {
  success: boolean;
  progress?: UserListeningProgressRecord | null;
  list?: UserListeningProgressWithMeta[];
  error?: string;
}

export const listeningService = {
  /**
   * Tải danh sách phụ đề có mốc thời gian từ link/ID YouTube
   */
  fetchTranscript: async (videoUrlOrId: string): Promise<TranscriptResponse> => {
    return apiClient.post('/listening/transcript', {
      videoUrl: videoUrlOrId,
    });
  },

  /**
   * Gọi AI phân tích hiện tượng nối âm và nuốt âm của câu
   */
  fetchConnectedSpeech: async (sentence: string): Promise<ConnectedSpeechResponse> => {
    return apiClient.post('/listening/connected-speech', {
      sentence,
    });
  },

  /**
   * Lấy tiến độ học bài nghe của người dùng
   */
  getProgress: async (
    youtubeId: string,
    difficulty: ListeningDifficulty
  ): Promise<ProgressResponse> => {
    return apiClient.get('/listening/progress', {
      params: { youtubeId, difficulty },
    });
  },

  /**
   * Lưu tiến độ học bài nghe của người dùng vào Supabase
   */
  saveProgress: async (
    progress: UserListeningProgressRecord
  ): Promise<ProgressResponse> => {
    return apiClient.post('/listening/progress', progress);
  },

  /**
   * Lấy lịch sử tất cả các bài nghe người dùng đã học kèm metadata
   */
  getUserHistory: async (): Promise<UserListeningProgressWithMeta[]> => {
    const res: ProgressResponse = await apiClient.get('/listening/progress');
    return res.list || [];
  },

  /**
   * Xóa một bài nghe khỏi lịch sử học
   */
  deleteProgress: async (
    youtubeId: string,
    difficulty?: ListeningDifficulty
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiClient.delete('/listening/progress', {
      params: { youtubeId, difficulty },
    });
  },

  /**
   * Xóa toàn bộ lịch sử nghe của người dùng
   */
  clearAllHistory: async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    return apiClient.delete('/listening/progress', {
      params: { clearAll: true },
    });
  },
};

