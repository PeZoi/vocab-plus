'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Bell, BellOff, ExternalLink, Copy, Check, RefreshCw, Unlink, AlertCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTelegramSettings } from '@/hooks/features/settings/use-telegram-settings';
import { TelegramHistoryModal } from './telegram-history-modal';
import { toast } from 'sonner';

export function TelegramSettingsCard() {
  const {
    isLinked,
    chatId,
    notificationsEnabled,
    isProfileLoading,
    isGenerating,
    isTesting,
    isDisconnecting,
    isToggling,
    linkData,
    handleGenerateLink,
    handleSendTest,
    handleDisconnect,
    handleToggleNotifications,
    refetchProfile,
  } = useTelegramSettings();

  const [copied, setCopied] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép link kết nối Telegram!');
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedChatId = chatId
    ? `••••${String(chatId).slice(-4)}`
    : '';

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-surface/80 border border-border/70 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-text-primary">
                Thông Báo Telegram
              </h3>
              {isLinked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã kết nối
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Nhận thông báo ôn tập SRS thông minh theo mốc (5, 10, 15, 20... từ) qua tin nhắn cá nhân
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isProfileLoading ? (
        <div className="h-20 flex items-center justify-center text-xs text-text-secondary">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Đang tải cài đặt Telegram...
        </div>
      ) : isLinked ? (
        /* State 1: Đã liên kết */
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-lg bg-base/60 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs text-text-secondary">Tài khoản Telegram liên kết:</div>
              <div className="text-xs sm:text-sm font-medium text-text-primary flex items-center gap-1.5">
                <span>Chat ID:</span>
                <span className="font-mono text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border/60">
                  {maskedChatId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={notificationsEnabled ? 'outline' : 'surface'}
                size="sm"
                onClick={() => handleToggleNotifications(!notificationsEnabled)}
                disabled={isToggling}
                className="text-xs gap-1.5"
              >
                {notificationsEnabled ? (
                  <>
                    <Bell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Thông báo: Bật</span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Thông báo: Tạm tắt</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTest}
              disabled={isTesting}
              className="text-xs gap-1.5"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>Gửi thông báo thử</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="text-xs gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Lịch sử thông báo</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 ml-auto"
            >
              {isDisconnecting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlink className="w-3.5 h-3.5" />
              )}
              <span>Ngắt kết nối</span>
            </Button>
          </div>
        </div>
      ) : (
        /* State 2: Chưa liên kết */
        <div className="space-y-3.5 pt-1">
          <div className="p-3 rounded-lg bg-base/50 border border-border/60 space-y-2 text-xs text-text-secondary">
            <div className="font-medium text-text-primary flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Cơ chế bảo mật riêng tư:</span>
            </div>
            <p>
              Mỗi học viên được cấp một mã kết nối riêng. Tin nhắn nhắc học chỉ gửi trực tiếp vào hộp thư cá nhân của bạn, không ai nhìn thấy dữ liệu học tập của bạn.
            </p>
          </div>

          {!linkData ? (
            <div>
              <Button
                variant="brand"
                size="sm"
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="gap-2 text-xs sm:text-sm"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Tạo mã kết nối</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 p-3.5 rounded-lg bg-base/70 border border-border/80">
              <div className="text-xs font-semibold text-text-primary">
                Bước tiếp theo: Nhấn nút bên dưới để mở Telegram và bấm &ldquo;START&rdquo;
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {linkData.deepLink ? (
                  <a
                    href={linkData.deepLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs sm:text-sm transition-colors shadow-xs"
                  >
                    <span>Mở Bot Telegram để kết nối ngay</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-amber-400">
                    Chưa cấu hình TELEGRAM_BOT_USERNAME trên máy chủ.
                  </span>
                )}

                {linkData.deepLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(linkData.deepLink)}
                    className="text-xs gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Sao chép Link</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetchProfile}
                  className="text-xs gap-1.5 text-text-secondary hover:text-text-primary ml-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tôi đã bấm Start</span>
                </Button>
              </div>

              <div className="text-[11px] text-text-secondary">
                Mã liên kết: <code className="font-mono bg-surface px-1 py-0.5 rounded text-sky-300">{linkData.token}</code> (hết hạn sau 15 phút).
              </div>
            </div>
          )}
        </div>
      )}

      {/* Popup xem lịch sử thông báo */}
      <TelegramHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
