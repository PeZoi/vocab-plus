'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Sparkles, Brain, Bell, Loader2 } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/features/auth/use-google-auth';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { signInWithGoogle, isLoading, error } = useGoogleAuth();

  return (
    <div className="w-full rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-2xl brand-glow">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand to-info flex items-center justify-center text-white shadow-lg brand-glow mb-4">
          <BookOpen className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary tracking-tight">
          Chào mừng đến với <span className="text-brand">VocabApp</span>
        </h1>
        <p className="text-sm text-text-secondary mt-2 max-w-xs">
          Học từ vựng thông minh theo phương pháp Spaced Repetition (FSRS) và AI
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="space-y-3 mb-8 p-4 rounded-xl bg-base/60 border border-border/50 text-xs text-text-secondary">
        <div className="flex items-center gap-2.5">
          <Brain className="w-4 h-4 text-brand shrink-0" />
          <span>Thuật toán lặp lại ngắt quãng FSRS tối ưu trí nhớ</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-info shrink-0" />
          <span>AI tự động phân tích ngữ cảnh, từ loại và mẹo nhớ</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-success shrink-0" />
          <span>Nhắc nhở qua Telegram theo khung giờ vàng cá nhân</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 mb-6 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger text-center">
          {error}
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={() => signInWithGoogle(redirectPath)}
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-neutral-700" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{isLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}</span>
      </button>

      <p className="text-[11px] text-text-secondary text-center mt-6">
        Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của VocabApp.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full rounded-2xl bg-surface border border-border p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
