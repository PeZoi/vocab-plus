'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { userKeys, telegramKeys } from '@/constants/query-keys';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import {
  telegramService,
  type TelegramLinkTokenResponse,
} from '@/services/telegram.service';
import { toast } from 'sonner';

export function useTelegramSettings() {
  const queryClient = useQueryClient();
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [linkData, setLinkData] = useState<TelegramLinkTokenResponse | null>(null);

  const isLinked = Boolean(profile?.telegram_chat_id);
  const notificationsEnabled = Boolean(profile?.telegram_notifications_enabled);

  const refetchProfile = () => {
    queryClient.invalidateQueries({ queryKey: userKeys.profile() });
  };

  const handleGenerateLink = async () => {
    try {
      setIsGenerating(true);
      const res = await telegramService.generateLinkToken();
      if (res.success) {
        setLinkData(res);
        toast.success('Đã tạo mã liên kết thành công! Nhấn mở bot để kích hoạt.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo mã liên kết';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendTest = async () => {
    try {
      setIsTesting(true);
      const res = await telegramService.sendTestMessage();
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: telegramKeys.all });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi tin nhắn thử';
      toast.error(msg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      const res = await telegramService.disconnectTelegram();
      if (res.success) {
        toast.success(res.message);
        setLinkData(null);
        refetchProfile();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể ngắt kết nối';
      toast.error(msg);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      setIsToggling(true);
      const res = await telegramService.toggleNotifications(enabled);
      if (res.success) {
        toast.success(res.message);
        refetchProfile();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật cài đặt';
      toast.error(msg);
    } finally {
      setIsToggling(false);
    }
  };

  return {
    isLinked,
    chatId: profile?.telegram_chat_id ?? null,
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
  };
}
