'use client';

import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  RefreshCw,
  Play,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  History,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminCronJobs } from '@/hooks/features/admin/use-admin-cron-jobs';
import { CronJobFormModal } from './cron-job-form-modal';
import { CronRunResponseModal } from './cron-run-response-modal';
import {
  CRON_PRESET_TEMPLATES,
  explainCronExpression,
} from '@/utils/cron';
import { formatDateTime, formatRelativeTime } from '@/utils/datetime';
import type {
  CronJob,
  CronRunDetail,
  TriggerCronResponse,
} from '@/types/admin-cron.types';

export function CronJobsManager() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'runs' | 'templates'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobId, setFilterJobId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);

  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedResponseData, setSelectedResponseData] = useState<
    TriggerCronResponse | CronRunDetail | null
  >(null);
  const [responseJobName, setResponseJobName] = useState<string>('');

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const {
    jobs,
    isJobsLoading,
    refetchJobs,
    isJobsFetching,
    runs,
    isRunsLoading,
    refetchRuns,
    isRunsFetching,
    saveJob,
    isSaving,
    toggleJob,
    isToggling,
    deleteJob,
    isDeleting,
    triggerJob,
    isTriggering,
  } = useAdminCronJobs({
    filterJobId,
    filterStatus,
    limitRuns: 50,
  });

  // Sao chép câu lệnh SQL
  const handleCopyCommand = (command: string, id: number) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Kích hoạt chạy thử thủ công và mở modal xem log chi tiết
  const handleTriggerRun = async (job: CronJob) => {
    try {
      setResponseJobName(job.jobname);
      const res = await triggerJob(job.jobname);
      setSelectedResponseData(res);
      setIsResponseModalOpen(true);
    } catch {
      // Error handled by mutation toast
    }
  };

  // Xem chi tiết log thực thi
  const handleViewRunDetail = (run: CronRunDetail) => {
    setSelectedResponseData(run);
    setResponseJobName(run.jobname);
    setIsResponseModalOpen(true);
  };

  // Xóa job kèm hộp thoại xác nhận
  const handleDeleteJob = async (jobname: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn Cron Job "${jobname}" không?`)) {
      await deleteJob(jobname);
    }
  };

  // Mở modal tạo mới
  const handleOpenCreate = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEdit = (job: CronJob) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  // Áp dụng mẫu
  const handleApplyTemplate = (template: typeof CRON_PRESET_TEMPLATES[0]) => {
    setEditingJob({
      jobid: 0,
      jobname: template.id,
      schedule: template.schedule,
      command: template.command,
      active: true,
    });
    setIsFormOpen(true);
  };

  // Lọc jobs theo tìm kiếm
  const filteredJobs = jobs.filter((j) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      j.jobname.toLowerCase().includes(q) ||
      j.schedule.toLowerCase().includes(q) ||
      j.command.toLowerCase().includes(q)
    );
  });

  const activeCount = jobs.filter((j) => j.active).length;
  const pausedCount = jobs.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header chính */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-brand/15 text-brand border border-brand/30 flex items-center justify-center shrink-0">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                Quản Lý Dynamic Cron Jobs
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                pg_cron Native
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl leading-relaxed">
              Lập lịch, giám sát và thực thi linh hoạt các tác vụ định kỳ tự động trong cơ sở dữ liệu PostgreSQL của Supabase.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchJobs();
              refetchRuns();
            }}
            disabled={isJobsFetching || isRunsFetching}
            className="text-xs gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isJobsFetching || isRunsFetching ? 'animate-spin' : ''}`}
            />
            <span>Làm mới</span>
          </Button>

          <Button
            variant="brand"
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Cron Job Mới</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface/80 border border-border/70 space-y-1">
          <div className="text-xs text-text-secondary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Tổng số Cron Jobs</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-text-primary font-mono">
            {jobs.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface/80 border border-border/70 space-y-1">
          <div className="text-xs text-text-secondary flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Đang kích hoạt (Active)</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
            {activeCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface/80 border border-border/70 space-y-1">
          <div className="text-xs text-text-secondary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Tạm dừng (Paused)</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
            {pausedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface/80 border border-border/70 space-y-1">
          <div className="text-xs text-text-secondary flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>Lịch sử đã ghi nhận</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-text-primary font-mono">
            {runs.length}+ lần
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border/80 gap-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'jobs'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Danh Sách Cron Jobs ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('runs')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'runs'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử Thực Thi (Run Logs)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Mẫu Lập Lịch Sẵn (Templates)</span>
        </button>
      </div>

      {/* TAB 1: Danh sách Cron Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Thanh tìm kiếm */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên job, biểu thức cron hoặc câu lệnh SQL..."
                className="pl-9.5 text-xs"
              />
            </div>
          </div>

          {/* Danh sách Job Cards */}
          {isJobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-surface border border-border/70 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-36 rounded" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-surface/50 rounded-2xl border border-dashed border-border p-8">
              <div className="w-12 h-12 rounded-2xl bg-base border border-border flex items-center justify-center mx-auto text-text-secondary">
                <CalendarClock className="w-6 h-6 opacity-60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-text-primary">
                  {searchTerm ? 'Không tìm thấy Cron Job phù hợp' : 'Chưa có Cron Job nào'}
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {searchTerm
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm tạo job mới.'
                    : 'Tạo job đầu tiên hoặc áp dụng mẫu có sẵn để tự động hóa hệ thống.'}
                </p>
              </div>
              <Button variant="brand" size="sm" onClick={handleOpenCreate} className="text-xs gap-1.5 mt-2">
                <Plus className="w-4 h-4" />
                <span>Tạo Cron Job Ngay</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredJobs.map((job) => {
                const isRunning = isTriggering && responseJobName === job.jobname;
                const explanation = explainCronExpression(job.schedule);

                return (
                  <div
                    key={job.jobid}
                    className="p-4 sm:p-5 rounded-2xl bg-surface border border-border/80 hover:border-border transition-all space-y-3.5 shadow-xs"
                  >
                    {/* Hàng trên: Tên job, badges & Switch */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            job.active ? 'bg-emerald-400 ring-4 ring-emerald-500/15' : 'bg-text-secondary/40'
                          }`}
                        />
                        <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight font-mono">
                          {job.jobname}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-base text-text-secondary border border-border">
                          ID: #{job.jobid}
                        </span>

                        {job.active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            Paused
                          </span>
                        )}
                      </div>

                      {/* Bật / Tắt Active Switch */}
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-text-secondary font-medium">
                          {job.active ? 'Bật' : 'Tạm tắt'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={job.active}
                            onChange={(e) => toggleJob({ jobid: job.jobid, active: e.target.checked })}
                            disabled={isToggling}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-base border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-white after:border-border after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>

                    {/* Lịch trình Cron & Diễn giải */}
                    <div className="p-3 rounded-xl bg-base/70 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-surface border border-border text-brand font-semibold text-xs">
                          {job.schedule}
                        </span>
                        <span className="text-text-secondary hidden sm:inline">➔</span>
                        <span className="text-text-primary font-sans font-medium">{explanation}</span>
                      </div>

                      {job.last_run_start && (
                        <div className="text-[11px] text-text-secondary flex items-center gap-1.5 self-start sm:self-center">
                          <span>Chạy lần cuối:</span>
                          <span className="font-medium text-text-primary">
                            {formatRelativeTime(job.last_run_start)}
                          </span>
                          {job.last_run_status === 'succeeded' ? (
                            <span className="text-emerald-400 font-semibold">• Thành công</span>
                          ) : job.last_run_status === 'failed' ? (
                            <span className="text-rose-400 font-semibold">• Gặp lỗi</span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Câu lệnh SQL */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-sky-400" />
                          <span>Câu lệnh SQL thực thi:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCommand(job.command, job.jobid)}
                          className="hover:text-text-primary flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          {copiedId === job.jobid ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === job.jobid ? 'Đã sao chép' : 'Sao chép lệnh'}</span>
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-xl bg-base/90 border border-border/80 font-mono text-xs text-text-primary/95 overflow-x-auto">
                        <code>{job.command}</code>
                      </pre>
                    </div>

                    {/* Hành động dưới cùng */}
                    <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() => handleTriggerRun(job)}
                          disabled={isRunning || isTriggering}
                          className="h-8 text-xs gap-1.5"
                        >
                          {isRunning ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>Chạy thử ngay</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(job)}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFilterJobId(job.jobid);
                            setActiveTab('runs');
                          }}
                          className="h-8 text-xs gap-1.5 text-text-secondary hover:text-text-primary"
                        >
                          <History className="w-3.5 h-3.5 text-purple-400" />
                          <span>Lịch sử ({job.total_runs ?? 0})</span>
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteJob(job.jobname)}
                        disabled={isDeleting}
                        className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Job</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Lịch sử thực thi (Run Logs) */}
      {activeTab === 'runs' && (
        <div className="space-y-4">
          {/* Bộ lọc Logs */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-border/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <Filter className="w-3.5 h-3.5" />
                <span>Lọc theo:</span>
              </div>

              {/* Lọc Job (shadcn Select) */}
              <Select
                value={filterJobId === null ? 'all' : String(filterJobId)}
                onValueChange={(val) => setFilterJobId(val === 'all' ? null : Number(val))}
              >
                <SelectTrigger className="h-8 px-2.5 text-xs rounded-lg bg-base border-border text-text-primary min-w-[180px]">
                  <SelectValue placeholder="Tất cả Cron Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Cron Jobs</SelectItem>
                  {jobs.map((j) => (
                    <SelectItem key={j.jobid} value={String(j.jobid)}>
                      {j.jobname} (#{j.jobid})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lọc Trạng thái (shadcn Select) */}
              <Select
                value={filterStatus}
                onValueChange={(val) => setFilterStatus(val)}
              >
                <SelectTrigger className="h-8 px-2.5 text-xs rounded-lg bg-base border-border text-text-primary min-w-[170px]">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="succeeded">Chỉ thành công (Succeeded)</SelectItem>
                  <SelectItem value="failed">Chỉ gặp lỗi (Failed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchRuns()}
              disabled={isRunsFetching}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunsFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới logs</span>
            </Button>
          </div>

          {/* Bảng Logs */}
          {isRunsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-surface/50 rounded-2xl border border-dashed border-border p-6">
              <div className="w-10 h-10 rounded-xl bg-base border border-border flex items-center justify-center mx-auto text-text-secondary">
                <History className="w-5 h-5 opacity-60" />
              </div>
              <h4 className="text-sm font-semibold text-text-primary">Chưa có nhật ký thực thi nào</h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Khi các cron job chạy tự động hoặc khi bạn bấm &ldquo;Chạy thử ngay&rdquo;, toàn bộ thời gian và phản hồi
                sẽ hiển thị tại đây.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-surface overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-base/60 text-text-secondary">
                      <th className="py-3 px-4 font-semibold">Run ID</th>
                      <th className="py-3 px-4 font-semibold">Tên Job</th>
                      <th className="py-3 px-4 font-semibold">Thời điểm chạy</th>
                      <th className="py-3 px-4 font-semibold">Thời lượng</th>
                      <th className="py-3 px-4 font-semibold">Trạng thái</th>
                      <th className="py-3 px-4 font-semibold">Phản hồi (Response)</th>
                      <th className="py-3 px-4 font-semibold text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {runs.map((run, index) => {
                      const isSuccess = run.status === 'succeeded';

                      return (
                        <tr
                          key={`run-${run.runid}-${run.start_time || ''}-${index}`}
                          className="hover:bg-base/40 transition-colors cursor-pointer group"
                          onClick={() => handleViewRunDetail(run)}
                        >
                          <td className="py-3 px-4 font-mono font-medium text-text-secondary">
                            #{run.runid}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-text-primary">
                            {run.jobname}
                          </td>
                          <td className="py-3 px-4 text-text-secondary" title={formatDateTime(run.start_time)}>
                            <div className="font-medium text-text-primary">
                              {formatRelativeTime(run.start_time)}
                            </div>
                            <div className="text-[11px] font-mono text-text-secondary/70">
                              {formatDateTime(run.start_time, 'HH:mm:ss dd/MM')}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-text-primary">
                            {run.duration_ms !== null ? `${run.duration_ms} ms` : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {isSuccess ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" />
                                Thành công
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <AlertTriangle className="w-3 h-3" />
                                Thất bại
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px]">
                            <span className={isSuccess ? 'text-text-secondary' : 'text-rose-400 font-medium'}>
                              {run.return_message || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRunDetail(run);
                              }}
                              className="h-7 text-[11px] gap-1 text-brand group-hover:bg-brand/10"
                            >
                              <span>Xem log</span>
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Mẫu thiết lập sẵn (Templates) */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand/10 border border-brand/20 text-xs text-text-secondary flex items-start gap-2.5">
            <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p>
              Các mẫu thiết lập dưới đây được tối ưu riêng cho ứng dụng <strong>Vocab App Plus</strong>. Bạn có thể nhấn
              <strong> &ldquo;Áp dụng mẫu này&rdquo;</strong> để kiểm tra lại và lưu vào hệ thống chỉ với một click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRON_PRESET_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-5 rounded-2xl bg-surface border border-border/80 hover:border-brand/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-brand px-2 py-0.5 rounded-md bg-brand/15 border border-brand/25">
                      {tmpl.tag}
                    </span>
                    <span className="font-mono text-xs text-text-secondary bg-base px-2 py-0.5 rounded border border-border">
                      {tmpl.schedule}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-text-primary tracking-tight font-mono">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {tmpl.description}
                  </p>

                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] text-text-secondary flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-sky-400" />
                      <span>Câu lệnh thực thi mẫu:</span>
                    </div>
                    <pre className="p-2 rounded-lg bg-base border border-border/70 font-mono text-[11px] text-text-primary/90 overflow-x-auto">
                      <code>{tmpl.command}</code>
                    </pre>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full text-xs gap-1.5 hover:border-brand/50 hover:bg-brand/10 hover:text-brand"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Áp dụng mẫu này</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal tạo mới / chỉnh sửa Job */}
      <CronJobFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={saveJob}
        initialJob={editingJob}
        isSaving={isSaving}
      />

      {/* Modal xem toàn bộ phản hồi & log lỗi chi tiết */}
      <CronRunResponseModal
        isOpen={isResponseModalOpen}
        onClose={() => setIsResponseModalOpen(false)}
        data={selectedResponseData}
        jobName={responseJobName}
      />
    </div>
  );
}
