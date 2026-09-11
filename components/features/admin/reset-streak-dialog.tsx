'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResetStreakMutation } from '@/hooks/features/admin/use-admin-users';
import { Flame, RotateCcw, Sparkles } from 'lucide-react';

interface ResetStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewStreak?: (streakCount: number) => void;
  user: {
    id: string;
    display_name: string | null;
    current_streak: number;
  } | null;
}

export function ResetStreakDialog({
  isOpen,
  onClose,
  onPreviewStreak,
  user,
}: ResetStreakDialogProps) {
  const [mode, setMode] = useState<'zero' | 'simulate'>('zero');
  const [streakDays, setStreakDays] = useState<number>(3);

  const resetStreakMutation = useResetStreakMutation();

  const handleClose = () => {
    setMode('zero');
    setStreakDays(3);
    onClose();
  };

  if (!user) return null;

  const handleSubmit = async () => {
    if (!user) return;

    await resetStreakMutation.mutateAsync({
      userId: user.id,
      payload: {
        target_streak: mode === 'zero' ? 0 : Math.max(1, streakDays),
        simulate_yesterday: mode === 'simulate',
      },
    });

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="md"
      className="max-w-[480px] overflow-hidden"
      title={
        <div className="flex items-center gap-2 text-base font-bold text-text-primary">
          <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <span>Quản Lý & Reset Chuỗi Streak</span>
        </div>
      }
      description={`Thiết lập lại chuỗi học cho ${user.display_name || user.id.slice(0, 8)} (Hiện tại: ${user.current_streak} ngày)`}
    >
      <div className="space-y-4 pt-1 overflow-hidden">
        {/* Lựa chọn chế độ reset */}
        <div className="space-y-2.5">
          {/* Lựa chọn 1: Reset về 0 */}
          <div
            onClick={() => setMode('zero')}
            className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
              mode === 'zero'
                ? 'bg-brand/10 border-brand/50 text-text-primary shadow-xs'
                : 'bg-base/60 border-border/70 hover:border-border text-text-secondary'
            }`}
          >
            <div
              className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                mode === 'zero' ? 'border-brand bg-brand' : 'border-border'
              }`}
            >
              {mode === 'zero' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-xs font-bold block text-text-primary">
                ⚡ Reset về 0 ngày (Chưa học hôm nay)
              </span>
              <span className="text-[11px] leading-relaxed block text-text-secondary">
                Xóa ngày hoạt động, đưa streak về 0 để test tính năng kích hoạt từ đầu.
              </span>
            </div>
          </div>

          {/* Lựa chọn 2: Giả lập chuỗi hôm qua */}
          <div
            onClick={() => setMode('simulate')}
            className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
              mode === 'simulate'
                ? 'bg-brand/10 border-brand/50 text-text-primary shadow-xs'
                : 'bg-base/60 border-border/70 hover:border-border text-text-secondary'
            }`}
          >
            <div
              className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                mode === 'simulate' ? 'border-brand bg-brand' : 'border-border'
              }`}
            >
              {mode === 'simulate' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div>
                <span className="text-xs font-bold block text-text-primary">
                  🔥 Giả lập chuỗi hôm qua (Test kích hoạt hôm nay)
                </span>
                <span className="text-[11px] leading-relaxed block text-text-secondary">
                  Đặt chuỗi đã học hôm qua. Khi làm bài hôm nay sẽ tăng lên{' '}
                  <strong className="text-brand font-bold">{streakDays + 1} ngày</strong> và bung popup rực lửa!
                </span>
              </div>

              {mode === 'simulate' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-text-secondary shrink-0">Chuỗi hôm qua:</span>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    value={streakDays}
                    onChange={(e) => setStreakDays(Math.max(1, Number(e.target.value) || 1))}
                    className="h-8 w-24 text-xs font-mono font-bold bg-base border-border rounded-lg"
                  />
                  <span className="text-xs font-medium text-text-secondary">ngày</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút Xem thử Animation Duolingo */}
        {onPreviewStreak && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const target = mode === 'zero' ? 1 : streakDays + 1;
              onPreviewStreak(target);
            }}
            className="w-full h-9 rounded-xl border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs gap-2 shadow-xs transition-colors"
            title="Xem trước hoạt họa chúc mừng chuỗi streak phong cách Duolingo"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Xem thử hiệu ứng Streak Duolingo</span>
          </Button>
        )}

        {/* Footer Action Buttons */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={resetStreakMutation.isPending}
            className="h-9 px-4 text-xs font-medium text-text-secondary hover:text-text-primary rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={resetStreakMutation.isPending}
            className="h-9 px-4 text-xs font-bold gap-1.5 bg-brand hover:bg-brand-hover text-white rounded-xl shadow-xs"
          >
            {resetStreakMutation.isPending ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Xác nhận cập nhật</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
