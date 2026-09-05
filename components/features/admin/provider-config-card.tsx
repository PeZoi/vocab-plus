'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useTestAIProviderMutation,
  useUpdateAIProviderMutation,
} from '@/hooks/features/admin/use-ai-providers';
import type { AIProviderConfig } from '@/services/admin.service';
import { Eye, EyeOff, Globe2, Loader2, Save, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

interface ProviderConfigCardProps {
  provider: AIProviderConfig;
  onShowMessage: (msg: { type: 'success' | 'error'; title?: string; message: string }) => void;
}

export function ProviderConfigCard({ provider, onShowMessage }: ProviderConfigCardProps) {
  const [apiKey, setApiKey] = useState(provider.api_key || '');
  const [model, setModel] = useState(provider.model || 'llama-3.3-70b-versatile');
  const [showKey, setShowKey] = useState(false);

  const updateMutation = useUpdateAIProviderMutation();
  const testMutation = useTestAIProviderMutation();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: provider.id,
        api_key: apiKey.trim(),
        model: model.trim(),
      });
      onShowMessage({
        type: 'success',
        title: 'Đã lưu và áp dụng cho toàn hệ thống!',
        message: `Mô hình "${model}" và API Key đã được cập nhật. Mọi thành viên sử dụng AI sẽ được phục vụ qua cấu hình này.`,
      });
    } catch (err: unknown) {
      onShowMessage({
        type: 'error',
        title: 'Lỗi lưu cấu hình',
        message: err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình',
      });
    }
  };

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
      const res = await testMutation.mutateAsync({
        api_key: apiKey.trim(),
        model: model.trim(),
      });

      onShowMessage({
        type: 'success',
        title: `Kết nối thành công với model: ${res.model}`,
        message: res.reply,
      });
    } catch (err: unknown) {
      onShowMessage({
        type: 'error',
        title: 'Kết nối thất bại',
        message: err instanceof Error ? err.message : 'Lỗi không xác định',
      });
    }
  };

  return (
    <div className="p-5 rounded-xl bg-surface/90 border border-border/80 shadow-xs space-y-4">
      {/* Provider Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-semibold text-xs">
            {provider.provider_name.toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
              <span>Groq</span>
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
          disabled={testMutation.isPending || !apiKey.trim()}
          className="gap-1.5"
        >
          {testMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang kết nối kiểm tra...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Kiểm tra kết nối</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="gap-1.5"
        >
          {updateMutation.isPending ? (
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
