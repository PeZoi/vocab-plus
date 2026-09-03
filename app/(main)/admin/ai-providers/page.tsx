'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pageVariants, alertVariants } from '@/constants/animations';
import {
  Cpu,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  Sparkles,
  Bot,
  ShieldAlert,
  Globe2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminAIProvidersLoading from './loading';
import { aiKeys } from '@/constants/query-keys';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import { ROUTES } from '@/constants/routes';
import type { Tables } from '@/types/database.types';

type AIProviderConfig = Tables<'ai_provider_configs'>;

interface ProviderCardProps {
  provider: AIProviderConfig;
  onSaveSuccess: () => void;
  onShowMessage: (msg: { type: 'success' | 'error'; title?: string; message: string }) => void;
}

function ProviderConfigCard({ provider, onSaveSuccess, onShowMessage }: ProviderCardProps) {
  const [apiKey, setApiKey] = useState(provider.api_key || '');
  const [model, setModel] = useState(provider.model || 'llama-3.3-70b-versatile');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/ai-providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: provider.id,
          api_key: apiKey.trim(),
          model: model.trim(),
        }),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Lưu cấu hình thất bại');
      }
      return res.json();
    },
    onSuccess: () => {
      onSaveSuccess();
      onShowMessage({
        type: 'success',
        title: 'Đã lưu và áp dụng cho toàn hệ thống!',
        message: `Mô hình "${model}" và API Key đã được cập nhật. Mọi thành viên sử dụng AI sẽ được phục vụ qua cấu hình này.`,
      });
    },
    onError: (err: Error) => {
      onShowMessage({
        type: 'error',
        title: 'Lỗi lưu cấu hình',
        message: err.message || 'Lỗi khi lưu cấu hình',
      });
    },
  });

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      onShowMessage({
        type: 'error',
        title: 'Chưa có API Key',
        message: 'Vui lòng nhập API Key trước khi kiểm tra kết nối.',
      });
      return;
    }

    try {
      setIsTesting(true);
      const res = await fetch('/api/admin/ai-providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey.trim(),
          model: model.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kết nối thất bại');
      }

      onShowMessage({
        type: 'success',
        title: `Kết nối thành công với model: ${data.model}`,
        message: data.reply,
      });
    } catch (err: unknown) {
      onShowMessage({
        type: 'error',
        title: 'Kết nối thất bại',
        message: err instanceof Error ? err.message : 'Lỗi không xác định',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-5 rounded-xl bg-surface/90 border border-border/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-semibold text-xs">
            {provider.provider_name.toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <span>{provider.display_name || provider.provider_name}</span>
              <Badge variant="default" className="text-[9px] py-0 px-1.5 gap-1">
                <Globe2 className="w-2.5 h-2.5" />
                Áp dụng toàn hệ thống
              </Badge>
            </h3>
            <span className="text-[11px] text-text-secondary capitalize">
              Nhà cung cấp: {provider.provider_name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">Đang hoạt động</span>
        </div>
      </div>

      {/* Form Settings */}
      <div className="space-y-3.5">
        {/* Model Input */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Mô hình AI (LLM Model) <span className="text-danger">*</span>
          </label>
          <Input
            type="text"
            placeholder="vd: llama-3.3-70b-versatile, qwen/qwen3.8-27b, deepseek-r1-distill-llama-70b..."
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-text-secondary mt-1">
            Gõ chính xác Model ID do provider hỗ trợ. Mô hình này sẽ xử lý phân tích từ vựng cho toàn bộ người dùng.
          </p>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            API Key ({provider.provider_name.toUpperCase()}) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="vd: gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-9 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-text-secondary mt-1">
            Khóa API này được bảo mật an toàn trên máy chủ và không bao giờ lộ ra phía người dùng.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
        <Button
          type="button"
          variant="surface"
          size="default"
          onClick={handleTestConnection}
          disabled={isTesting || !apiKey.trim()}
          className="gap-1.5"
        >
          {isTesting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang kết nối kiểm tra...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Kiểm tra kết nối (Test)</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="gap-1.5"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Lưu cấu hình toàn hệ thống</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AdminAiProvidersPage() {
  const queryClient = useQueryClient();
  const { isAdmin, isLoading: profileLoading } = useUserProfile();

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    title?: string;
    message: string;
  } | null>(null);

  const { data: providers = [], isLoading: providersLoading } = useQuery<AIProviderConfig[]>({
    queryKey: aiKeys.providers(),
    queryFn: async () => {
      const res = await fetch('/api/admin/ai-providers');
      if (!res.ok) throw new Error('Không thể tải danh sách AI Providers');
      return res.json();
    },
    enabled: isAdmin,
  });

  if (profileLoading || (isAdmin && providersLoading)) {
    return <AdminAIProvidersLoading />;
  }

  // Chặn người dùng không có quyền Admin
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-danger/15 text-danger border border-danger/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Truy cập bị từ chối</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Trang này chỉ dành riêng cho <strong>Quản trị viên (Admin)</strong> để cấu hình AI áp dụng
          cho toàn hệ thống.
        </p>
        <div className="pt-2">
          <Link href={ROUTES.APP.DASHBOARD}>
            <Button variant="surface" size="default" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang chính</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1.5 py-1 px-3">
            <Cpu className="w-3.5 h-3.5" />
            Admin Control Panel
          </Badge>
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <Globe2 className="w-3 h-3 text-brand" />
            Áp dụng chung toàn bộ User
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight mt-2">
          Cấu hình AI Toàn Hệ Thống
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
          Admin thiết lập API Key và Model tại đây. Cấu hình này sẽ được lưu vào cơ sở dữ liệu và tự động áp dụng chung cho tất cả thành viên khi sử dụng các tính năng AI.
        </p>
      </div>

      {/* Notification / AI Test Response */}
      <AnimatePresence>
        {notification && (
          <motion.div
            variants={alertVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm font-medium transition-all ${
              notification.type === 'success'
                ? 'bg-success/15 border-success/30 text-text-primary'
                : 'bg-danger/15 border-danger/30 text-danger'
            }`}
          >
            {notification.type === 'success' ? (
              <Bot className="w-4 h-4 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              {notification.title && (
                <h4
                  className={`font-semibold text-xs ${
                    notification.type === 'success' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {notification.title}
                </h4>
              )}
              <p className="text-xs text-text-primary/90 leading-relaxed whitespace-pre-wrap">
                {notification.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Providers List */}
      <div className="space-y-6">
        {providers.map((p) => (
          <ProviderConfigCard
            key={p.id}
            provider={p}
            onSaveSuccess={() => {
              queryClient.invalidateQueries({ queryKey: aiKeys.all });
            }}
            onShowMessage={(msg) => setNotification(msg)}
          />
        ))}
      </div>
    </motion.div>
  );
}
