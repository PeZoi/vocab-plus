'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useTestAIProviderMutation,
  useUpdateAIProviderMutation,
} from '@/hooks/features/admin/use-ai-providers';
import type { AIProviderConfig } from '@/services/admin.service';
import {
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  Save,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getProviderConfig } from '@/lib/ai/providers';
import React, { useState } from 'react';

interface ProviderConfigCardProps {
  provider: AIProviderConfig;
  onShowMessage: (msg: { type: 'success' | 'error'; title?: string; message: string }) => void;
}

export function ProviderConfigCard({ provider, onShowMessage }: ProviderConfigCardProps) {
  const meta = getProviderConfig(provider.provider_name);
  const isOrca = provider.provider_name.toLowerCase() === 'orcarouter';
  const isKira = provider.provider_name.toLowerCase() === 'kira' || provider.provider_name.toLowerCase() === 'kiraai';
  const defaultFallbackModel = meta.defaultModel;

  const [apiKey, setApiKey] = useState(provider.api_key || '');
  const [model, setModel] = useState(provider.model || defaultFallbackModel);
  const [showKey, setShowKey] = useState(false);

  const updateMutation = useUpdateAIProviderMutation();
  const testMutation = useTestAIProviderMutation();

  const providerDisplayName = provider.display_name || meta.display_name;

  // Lưu thông tin cấu hình (API Key & Model) mà không đổi trạng thái kích hoạt
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: provider.id,
        api_key: apiKey.trim(),
        model: model.trim(),
      });
      onShowMessage({
        type: 'success',
        title: `Đã lưu cấu hình cho ${providerDisplayName}!`,
        message: `Thông tin mô hình "${model}" và API Key đã được lưu an toàn vào cơ sở dữ liệu.`,
      });
    } catch (err: unknown) {
      onShowMessage({
        type: 'error',
        title: 'Lỗi lưu cấu hình',
        message: err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình',
      });
    }
  };

  // Kích hoạt provider này làm Provider mặc định đang chạy trong toàn hệ thống
  const handleSetActive = async () => {
    try {
      await updateMutation.mutateAsync({
        id: provider.id,
        api_key: apiKey.trim(),
        model: model.trim(),
        is_default: true,
        is_active: true,
      });
      onShowMessage({
        type: 'success',
        title: `Đã chuyển sang dùng ${providerDisplayName}!`,
        message: `Toàn bộ các tính năng AI trong hệ thống hiện đã được chuyển sang phục vụ qua ${providerDisplayName} (model: ${model}).`,
      });
    } catch (err: unknown) {
      onShowMessage({
        type: 'error',
        title: 'Lỗi kích hoạt provider',
        message: err instanceof Error ? err.message : 'Lỗi khi kích hoạt provider',
      });
    }
  };

  // Kiểm tra kết nối với API Key và Model được nhập
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      onShowMessage({
        type: 'error',
        title: 'Chưa có API Key',
        message: `Vui lòng nhập API Key cho ${providerDisplayName} trước khi kiểm tra kết nối.`,
      });
      return;
    }

    try {
      const res = await testMutation.mutateAsync({
        api_key: apiKey.trim(),
        model: model.trim(),
        provider_name: provider.provider_name,
      });

      onShowMessage({
        type: 'success',
        title: `[${providerDisplayName}] Kết nối thành công! (Model: ${res.model})`,
        message: res.reply,
      });
    } catch (err: unknown) {
      onShowMessage({
        type: 'error',
        title: `[${providerDisplayName}] Kết nối thất bại`,
        message: err instanceof Error ? err.message : 'Lỗi không xác định',
      });
    }
  };

  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl bg-surface/90 border transition-all space-y-5 shadow-xs ${
        provider.is_default
          ? 'border-brand/60 ring-1 ring-brand/30 shadow-brand/10'
          : 'border-border/80 hover:border-border'
      }`}
    >
      {/* Provider Header & Profile Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isKira
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : isOrca
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                : 'bg-brand/15 text-brand border border-brand/30'
            }`}
          >
            {meta.icon}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-text-primary tracking-tight">
                {providerDisplayName}
              </h3>
              {provider.is_default ? (
                <Badge variant="default" className="text-[10px] py-0.5 px-2 gap-1 bg-brand text-white border-0 font-medium">
                  <Globe2 className="w-3 h-3" />
                  Đang chạy trên hệ thống
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] py-0.5 px-2 text-text-secondary bg-surface-hover border-border">
                  Chế độ chờ (Dự phòng)
                </Badge>
              )}
            </div>

            <span className="text-xs text-text-secondary">
              ID Provider: <span className="font-mono text-text-primary/90">{provider.provider_name}</span>
              {' • '}{meta.badgeLabel}
            </span>
          </div>
        </div>

        {/* Quick Profile Switch Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {provider.is_default ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Đang hoạt động</span>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSetActive}
              disabled={updateMutation.isPending}
              className="gap-1.5 text-xs text-brand border-brand/40 hover:bg-brand hover:text-white transition-all shadow-xs"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>Kích hoạt dùng Profile này</span>
            </Button>
          )}
        </div>
      </div>

      {/* Form Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">
            Mô hình AI (LLM Model) <span className="text-danger">*</span>
          </label>
          <Input
            type="text"
            placeholder={meta.placeholderModel}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="font-mono text-xs h-9 bg-base/50"
          />
          <p className="text-[11px] text-text-secondary leading-normal">
            Model ID hỗ trợ bởi {providerDisplayName}
          </p>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-primary">
            API Key ({providerDisplayName}) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder={meta.placeholderKey}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-9 font-mono text-xs h-9 bg-base/50"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-text-secondary leading-normal">
            Khóa bí mật được lưu trữ độc lập cho riêng profile này và mã hóa an toàn trên máy chủ.
          </p>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="surface"
          size="default"
          onClick={handleTestConnection}
          disabled={testMutation.isPending || !apiKey.trim()}
          className="gap-1.5 text-xs"
        >
          {testMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang kiểm tra kết nối...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Kiểm tra kết nối</span>
            </>
          )}
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="gap-1.5 text-xs"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-text-secondary" />
            )}
            <span>Lưu thông tin profile</span>
          </Button>

          {!provider.is_default && (
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleSetActive}
              disabled={updateMutation.isPending}
              className="gap-1.5 text-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Đặt làm Provider chính</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
