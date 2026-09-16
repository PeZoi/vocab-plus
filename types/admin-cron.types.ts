export interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  command: string;
  active: boolean;
  database?: string;
  username?: string;
  last_run_id?: number | null;
  last_run_status?: 'succeeded' | 'failed' | null;
  last_run_message?: string | null;
  last_run_start?: string | null;
  last_run_end?: string | null;
  total_runs?: number;
  failed_runs?: number;
}

export interface CronRunDetail {
  runid: number;
  jobid: number;
  jobname: string;
  schedule?: string;
  command: string;
  status: 'succeeded' | 'failed';
  return_message: string;
  start_time: string;
  end_time: string | null;
  duration_ms?: number | null;
  database?: string;
  username?: string;
}

export interface SaveCronJobPayload {
  jobname: string;
  schedule: string;
  command: string;
  active?: boolean;
}

export interface TriggerCronResponse {
  success: boolean;
  status: 'succeeded' | 'failed';
  runid?: number;
  duration_ms?: number;
  return_message: string;
  error_code?: string;
  start_time?: string;
  end_time?: string;
}

export interface CronPreset {
  id: string;
  name: string;
  description: string;
  schedule: string;
  command: string;
  tag: string;
}
