'use client';

import { ProviderConfigCard } from '@/components/features/admin/provider-config-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { alertVariants, pageVariants } from '@/constants/animations';
import { ROUTES } from '@/constants/routes';
import { useAIProvidersQuery } from '@/hooks/features/admin/use-ai-providers';
import { useUserProfile } from '@/hooks/features/user/use-user-profile';
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Cpu,
  Globe2,
  ShieldAlert,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import AdminAIProvidersLoading from './loading';

export default function AdminAiProvidersPage() {
  const { isAdmin, isLoading: profileLoading } = useUserProfile();

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    title?: string;
    message: string;
  } | null>(null);

  const { data: providers = [], isLoading: providersLoading } = useAIProvidersQuery(!!isAdmin);

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
            onShowMessage={(msg) => setNotification(msg)}
          />
        ))}
      </div>
    </motion.div>
  );
}
