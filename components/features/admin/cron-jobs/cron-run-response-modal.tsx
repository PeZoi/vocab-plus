'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Terminal,
  Calendar,
  Hash,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/datetime';
import type { CronRunDetail, TriggerCronResponse } from '@/types/admin-cron.types';

interface CronRunResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TriggerCronResponse | CronRunDetail | null;
  jobName?: string;
}

export function CronRunResponseModal({
  isOpen,
  onClose,
  data,
  jobName,
}: CronRunResponseModalProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const isSuccess = data.status === 'succeeded';
  const displayJobName = jobName || ('jobname' in data ? data.jobname : 'Cron Job');
  const returnMessage = data.return_message || (isSuccess ? 'Thực thi thành công' : 'Gặp lỗi không xác định');
  const durationMs = data.duration_ms ?? null;
  const startTime = data.start_time ? formatDateTime(data.start_time, 'dd/MM/yyyy HH:mm:ss') : null;
  const runId = data.runid;
  const errorCode = 'error_code' in data ? data.error_code : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(returnMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isSuccess
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span>{isSuccess ? 'Kết Quả Thực Thi Thành Công' : 'Báo Cáo Lỗi Thực Thi'}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isSuccess
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                {isSuccess ? 'SUCCEEDED' : 'FAILED'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Chi tiết phản hồi từ máy chủ PostgreSQL cho job <code className="font-mono text-brand">{displayJobName}</code>
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Metadata summary grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-base/70 border border-border/80 text-xs">
          {runId && (
            <div className="space-y-0.5">
              <div className="text-text-secondary flex items-center gap-1 text-[11px]">
                <Hash className="w-3 h-3" />
                <span>Run ID</span>
              </div>
              <div className="font-mono text-text-primary font-medium">#{runId}</div>
            </div>
          )}

          {durationMs !== null && (
            <div className="space-y-0.5">
              <div className="text-text-secondary flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                <span>Thời lượng</span>
              </div>
              <div className="font-mono text-text-primary font-medium">{durationMs} ms</div>
            </div>
          )}

          {startTime && (
            <div className="space-y-0.5">
              <div className="text-text-secondary flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3" />
                <span>Bắt đầu lúc</span>
              </div>
              <div className="font-mono text-text-primary text-[11px]">{startTime}</div>
            </div>
          )}

          {errorCode && (
            <div className="space-y-0.5">
              <div className="text-text-secondary flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>Mã lỗi SQL</span>
              </div>
              <div className="font-mono text-rose-400 font-semibold">{errorCode}</div>
            </div>
          )}
        </div>

        {/* Command info if available */}
        {'command' in data && data.command && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Câu lệnh SQL thực thi:</span>
            </div>
            <pre className="p-2.5 rounded-lg bg-base border border-border/70 font-mono text-[11px] text-text-primary/90 overflow-x-auto">
              <code>{data.command}</code>
            </pre>
          </div>
        )}

        {/* Full Return Message / Error Response */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{isSuccess ? 'Nội dung phản hồi (Response Output):' : 'Thông điệp lỗi chi tiết (Error Trace):'}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-[11px] gap-1 text-text-secondary hover:text-text-primary"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </Button>
          </div>

          <div
            className={`p-3.5 rounded-xl border font-mono text-xs leading-relaxed break-words whitespace-pre-wrap max-h-64 overflow-y-auto ${
              isSuccess
                ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/30 text-rose-200 border-rose-500/40 shadow-inner'
            }`}
          >
            {returnMessage}
          </div>
        </div>

        {/* Footer info note */}
        <div className="pt-3 border-t border-border/70 flex items-center justify-between">
          <p className="text-[11px] text-text-secondary">
            {isSuccess
              ? '✅ Log thực thi đã được ghi nhận tự động vào bảng cron.job_run_details.'
              : '⚠️ Lỗi này đã được lưu vào nhật ký để quản trị viên dễ dàng khắc phục câu lệnh SQL.'}
          </p>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
