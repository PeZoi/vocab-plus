import { apiClient } from '@/lib/axios';
import type {
  CronJob,
  CronRunDetail,
  SaveCronJobPayload,
  TriggerCronResponse,
} from '@/types/admin-cron.types';

export const adminCronService = {
  /**
   * Lấy danh sách toàn bộ Cron Jobs hiện có
   */
  getCronJobs: (): Promise<{ success: boolean; data: CronJob[] }> => {
    return apiClient.get('/admin/cron-jobs');
  },

  /**
   * Tạo mới hoặc cập nhật một Cron Job
   */
  saveCronJob: (
    payload: SaveCronJobPayload
  ): Promise<{ success: boolean; jobid: number; message: string }> => {
    return apiClient.post('/admin/cron-jobs', payload);
  },

  /**
   * Bật / tắt trạng thái kích hoạt của Cron Job
   */
  toggleCronJob: (
    jobid: number,
    active: boolean
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/admin/cron-jobs/toggle', { jobid, active });
  },

  /**
   * Xóa một Cron Job khỏi hệ thống
   */
  deleteCronJob: (jobname: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/admin/cron-jobs?jobname=${encodeURIComponent(jobname)}`);
  },

  /**
   * Kích hoạt chạy thử thủ công tức thì một Cron Job và nhận toàn bộ log response
   */
  triggerCronJob: (jobname: string): Promise<TriggerCronResponse> => {
    return apiClient.post('/admin/cron-jobs/trigger', { jobname });
  },

  /**
   * Lấy danh sách lịch sử thực thi các lần chạy của Cron Jobs
   */
  getCronRuns: (params?: {
    jobid?: number | null;
    status?: string;
    limit?: number;
  }): Promise<{ success: boolean; data: CronRunDetail[] }> => {
    const query = new URLSearchParams();
    if (params?.jobid) query.set('jobid', String(params.jobid));
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return apiClient.get(`/admin/cron-jobs/runs${qs ? `?${qs}` : ''}`);
  },
};
