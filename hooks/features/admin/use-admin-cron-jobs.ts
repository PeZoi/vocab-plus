'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '@/constants/query-keys';
import { adminCronService } from '@/services/admin-cron.service';
import type { SaveCronJobPayload, TriggerCronResponse } from '@/types/admin-cron.types';
import { toast } from 'sonner';

interface UseAdminCronJobsOptions {
  filterJobId?: number | null;
  filterStatus?: string;
  limitRuns?: number;
  enabled?: boolean;
}

export function useAdminCronJobs(options: UseAdminCronJobsOptions = {}) {
  const queryClient = useQueryClient();
  const {
    filterJobId = null,
    filterStatus = 'all',
    limitRuns = 50,
    enabled = true,
  } = options;

  // 1. Query danh sách Cron Jobs
  const {
    data: jobsData,
    isLoading: isJobsLoading,
    isError: isJobsError,
    error: jobsError,
    refetch: refetchJobs,
    isFetching: isJobsFetching,
  } = useQuery({
    queryKey: adminKeys.cronJobs(),
    queryFn: async () => {
      const res = await adminCronService.getCronJobs();
      return res.data;
    },
    enabled,
    staleTime: 1000 * 30, // 30s
  });

  // 2. Query lịch sử thực thi (Run logs)
  const {
    data: runsData,
    isLoading: isRunsLoading,
    isError: isRunsError,
    error: runsError,
    refetch: refetchRuns,
    isFetching: isRunsFetching,
  } = useQuery({
    queryKey: adminKeys.cronRuns(filterJobId, filterStatus),
    queryFn: async () => {
      const res = await adminCronService.getCronRuns({
        jobid: filterJobId,
        status: filterStatus,
        limit: limitRuns,
      });
      return res.data;
    },
    enabled,
    staleTime: 1000 * 15, // 15s
  });

  // 3. Mutation: Tạo mới / cập nhật Cron Job
  const saveMutation = useMutation({
    mutationFn: (payload: SaveCronJobPayload) => adminCronService.saveCronJob(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã lưu Cron Job thành công!');
      queryClient.invalidateQueries({ queryKey: adminKeys.cronJobs() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể lưu Cron Job';
      toast.error(msg);
    },
  });

  // 4. Mutation: Bật / Tắt kích hoạt
  const toggleMutation = useMutation({
    mutationFn: ({ jobid, active }: { jobid: number; active: boolean }) =>
      adminCronService.toggleCronJob(jobid, active),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: adminKeys.cronJobs() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể thay đổi trạng thái';
      toast.error(msg);
    },
  });

  // 5. Mutation: Xóa Cron Job
  const deleteMutation = useMutation({
    mutationFn: (jobname: string) => adminCronService.deleteCronJob(jobname),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: adminKeys.cronJobs() });
      queryClient.invalidateQueries({ queryKey: adminKeys.cronRuns() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể xóa Cron Job';
      toast.error(msg);
    },
  });

  // 6. Mutation: Kích hoạt chạy thử thủ công
  const triggerMutation = useMutation<TriggerCronResponse, Error, string>({
    mutationFn: (jobname: string) => adminCronService.triggerCronJob(jobname),
    onSuccess: (res) => {
      if (res.status === 'succeeded') {
        toast.success(`Chạy thử thành công (${res.duration_ms ?? 0}ms)`);
      } else {
        toast.error(`Chạy thử gặp lỗi: ${res.return_message}`);
      }
      queryClient.invalidateQueries({ queryKey: adminKeys.cronJobs() });
      queryClient.invalidateQueries({ queryKey: adminKeys.cronRuns() });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể kích hoạt chạy thử';
      toast.error(msg);
    },
  });

  return {
    jobs: jobsData || [],
    isJobsLoading,
    isJobsError,
    jobsError,
    refetchJobs,
    isJobsFetching,

    runs: runsData || [],
    isRunsLoading,
    isRunsError,
    runsError,
    refetchRuns,
    isRunsFetching,

    saveJob: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,

    toggleJob: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,

    deleteJob: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    triggerJob: triggerMutation.mutateAsync,
    isTriggering: triggerMutation.isPending,
  };
}
