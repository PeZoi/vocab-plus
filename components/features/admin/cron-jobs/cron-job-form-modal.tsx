/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Sparkles,
  Terminal,
  HelpCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  CRON_PRESET_TEMPLATES,
  explainCronExpression,
  isValidCronExpression,
} from '@/utils/cron';
import type { CronJob, SaveCronJobPayload } from '@/types/admin-cron.types';

interface CronJobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: SaveCronJobPayload) => Promise<unknown>;
  initialJob?: CronJob | null;
  isSaving?: boolean;
}

const COMMON_CHIPS = [
  { label: 'Mỗi 15 phút', expr: '*/15 * * * *' },
  { label: 'Mỗi 30 phút', expr: '*/30 * * * *' },
  { label: 'Mỗi 1 giờ', expr: '0 * * * *' },
  { label: '00:00 hàng ngày (07:00 VN)', expr: '0 0 * * *' },
  { label: '00:00 Thứ 2 VN (Chốt Rank)', expr: '0 17 * * 0' },
  { label: '03:00 sáng hàng ngày', expr: '0 20 * * *' },
];

export function CronJobFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialJob,
  isSaving = false,
}: CronJobFormModalProps) {
  const isEditing = Boolean(initialJob);

  const [jobname, setJobname] = useState('');
  const [schedule, setSchedule] = useState('*/30 * * * *');
  const [command, setCommand] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialJob) {
      setJobname(initialJob.jobname || '');
      setSchedule(initialJob.schedule || '');
      setCommand(initialJob.command || '');
      setActive(initialJob.active ?? true);
    } else {
      setJobname('');
      setSchedule('*/30 * * * *');
      setCommand('');
      setActive(true);
    }
    setErrors({});
  }, [initialJob, isOpen]);

  const handleApplyPreset = (presetId: string) => {
    const found = CRON_PRESET_TEMPLATES.find((p) => p.id === presetId);
    if (found) {
      if (!isEditing) {
        setJobname(found.id);
      }
      setSchedule(found.schedule);
      setCommand(found.command);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!jobname.trim()) {
      errs.jobname = 'Vui lòng nhập tên định danh cho job';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(jobname.trim())) {
      errs.jobname = 'Tên job chỉ gồm chữ cái, số, gạch ngang hoặc gạch dưới';
    }

    if (!schedule.trim()) {
      errs.schedule = 'Vui lòng nhập biểu thức Cron';
    } else if (!isValidCronExpression(schedule.trim())) {
      errs.schedule = 'Biểu thức Cron phải đúng chuẩn 5 trường (phút giờ ngày tháng thứ)';
    }

    if (!command.trim()) {
      errs.command = 'Vui lòng nhập câu lệnh SQL cần thực thi';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        jobname: jobname.trim(),
        schedule: schedule.trim(),
        command: command.trim(),
        active,
      });
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  const explanation = explainCronExpression(schedule);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/15 text-brand border border-brand/30 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-text-primary">
              {isEditing ? `Chỉnh Sửa Cron Job "${initialJob?.jobname}"` : 'Tạo Dynamic Cron Job Mới'}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Cấu hình lịch trình chạy tự động trong PostgreSQL qua extension pg_cron
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Chọn mẫu sẵn nếu đang tạo mới */}
        {!isEditing && (
          <div className="p-3 rounded-xl bg-base/60 border border-border/80 space-y-2">
            <div className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Điền nhanh từ mẫu có sẵn (Preset):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {CRON_PRESET_TEMPLATES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="text-left p-2 rounded-lg bg-surface/80 hover:bg-surface border border-border/60 hover:border-brand/40 text-xs transition-all flex items-start gap-2 group"
                >
                  <span className="text-[10px] font-semibold text-brand px-1.5 py-0.5 rounded bg-brand/10 border border-brand/20 shrink-0 mt-0.5">
                    {preset.tag}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-text-primary group-hover:text-brand truncate">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-text-secondary font-mono">{preset.schedule}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tên Job */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
            <span>Tên định danh Job (jobname) *</span>
            <span className="text-[11px] font-normal text-text-secondary">Duy nhất, dạng kebab-case</span>
          </label>
          <Input
            value={jobname}
            onChange={(e) => setJobname(e.target.value)}
            disabled={isEditing}
            placeholder="vd: auto-reset-rank, cleanup-old-logs..."
            className="text-xs font-mono"
          />
          {errors.jobname && <p className="text-[11px] text-rose-400">{errors.jobname}</p>}
        </div>

        {/* Biểu thức Cron */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Biểu thức Cron (5 trường) *</span>
            </span>
            <span className="text-[11px] font-mono text-text-secondary">phút giờ ngày tháng thứ</span>
          </label>

          <Input
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="vd: */30 * * * * hoặc 0 17 * * 0"
            className="text-xs font-mono"
          />
          {errors.schedule && <p className="text-[11px] text-rose-400">{errors.schedule}</p>}

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {COMMON_CHIPS.map((chip) => (
              <button
                key={chip.expr}
                type="button"
                onClick={() => setSchedule(chip.expr)}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                  schedule === chip.expr
                    ? 'bg-brand/15 text-brand border-brand/40 font-medium'
                    : 'bg-base/70 text-text-secondary border-border hover:text-text-primary hover:bg-surface'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Live explanation */}
          <div className="p-2.5 rounded-lg bg-base/80 border border-border/70 flex items-start gap-2 text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-text-secondary">Diễn giải chu kỳ: </span>
              <span className="font-medium text-emerald-400">{explanation}</span>
            </div>
          </div>
        </div>

        {/* Câu lệnh SQL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-primary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Câu lệnh SQL thực thi (Command) *</span>
            </span>
            <span className="text-[11px] font-normal text-text-secondary">Hỗ trợ SELECT, CALL, DELETE...</span>
          </label>
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            rows={4}
            placeholder="vd: SELECT public.admin_reset_all_leagues(NULL);"
            className="font-mono text-xs leading-relaxed resize-y"
          />
          {errors.command && <p className="text-[11px] text-rose-400">{errors.command}</p>}
        </div>

        {/* Kích hoạt Active switch */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-base/60 border border-border/80">
          <div>
            <div className="text-xs font-semibold text-text-primary">Trạng thái kích hoạt (Active)</div>
            <div className="text-[11px] text-text-secondary">
              Nếu tắt, job vẫn được lưu trữ nhưng sẽ tạm ngừng chạy tự động
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-surface border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary peer-checked:after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Submit action */}
        <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2.5">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSaving} className="text-xs">
            Hủy
          </Button>

          <Button variant="brand" size="sm" type="submit" disabled={isSaving} className="text-xs gap-1.5">
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{isEditing ? 'Cập nhật Cron Job' : 'Lưu & Lập Lịch Ngay'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
