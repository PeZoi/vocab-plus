'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Send, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/features/auth/use-google-auth';
import { pageVariants } from '@/constants/animations';

export default function SettingsPage() {
  const { signOut, isLoading } = useGoogleAuth();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto space-y-5"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
          Cài đặt tài khoản
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Quản lý tài khoản cá nhân, thông báo và lịch học
        </p>
      </div>

      <div className="space-y-3.5">
        {/* Telegram Integration Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface/80 border border-border/70 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Kết nối Telegram Bot</h3>
              <p className="text-xs text-text-secondary">
                Nhận thông báo nhắc nhở giờ vàng và báo cáo tiến độ tuần
              </p>
            </div>
          </div>
          <p className="text-xs text-text-secondary bg-base/50 p-2.5 rounded-lg border border-border/60">
            Tính năng liên kết bot Telegram sẽ được kích hoạt toàn diện ở Phase 4 theo tài liệu đặc tả.
          </p>
        </div>

        {/* Golden Hours Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-surface/80 border border-border/70 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Khung giờ vàng học tập</h3>
              <p className="text-xs text-text-secondary">
                Mặc định: 07:00–08:00, 12:00–13:00, 21:00–22:00
              </p>
            </div>
          </div>
          <p className="text-xs text-text-secondary bg-base/50 p-2.5 rounded-lg border border-border/60">
            Hệ thống sẽ tự động học thói quen và tỷ lệ trả lời đúng của bạn để tối ưu khung giờ vàng sau 15 phiên ôn tập.
          </p>
        </div>

        {/* Sign out */}
        <div className="pt-3 border-t border-border/60">
          <Button
            variant="danger"
            onClick={() => signOut()}
            disabled={isLoading}
            className="w-full sm:w-auto gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất khỏi hệ thống</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
