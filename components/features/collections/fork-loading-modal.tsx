'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  GitFork,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ForkLoadingModalProps {
  isOpen: boolean;
  collectionTitle?: string;
  isSuccess?: boolean;
  onFinishSuccess?: () => void;
}

interface ForkLoadingModalContentProps {
  collectionTitle?: string;
  isSuccess?: boolean;
  onFinishSuccess?: () => void;
}

function ForkLoadingModalContent({
  collectionTitle = '',
  isSuccess = false,
  onFinishSuccess,
}: ForkLoadingModalContentProps) {
  const [simulatedProgress, setSimulatedProgress] = useState(18);
  const [simulatedStep, setSimulatedStep] = useState<1 | 2 | 3>(1);

  // Điều phối tiến trình tăng dần mô phỏng qua setInterval (không gọi setState đồng bộ trong effect)
  useEffect(() => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;

      setSimulatedProgress((prev) => {
        if (isSuccess) return 100;

        // Bước 1: 0 - 600ms (18% -> 38%)
        if (elapsed < 600) {
          setSimulatedStep(1);
          return Math.min(38, prev + 3);
        }
        // Bước 2: 600ms - 1500ms (38% -> 68%)
        if (elapsed < 1500) {
          setSimulatedStep(2);
          return Math.min(68, prev + 2.5);
        }
        // Bước 3: 1500ms trở lên (68% -> 92%)
        setSimulatedStep(3);
        if (prev < 90) {
          return prev + 1.2;
        }
        if (prev < 94) {
          return prev + 0.3;
        }
        return 94; // Giữ ở mức ~94% chờ API phản hồi
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isSuccess]);

  // Khi API trả về thành công: Gọi onFinishSuccess sau 550ms
  useEffect(() => {
    if (isSuccess) {
      const finishTimeout = setTimeout(() => {
        onFinishSuccess?.();
      }, 550);

      return () => clearTimeout(finishTimeout);
    }
  }, [isSuccess, onFinishSuccess]);

  // Derived state: Nếu isSuccess thì 100% và step 4, không cần setState đồng bộ
  const progress = isSuccess ? 100 : simulatedProgress;
  const currentStep = isSuccess ? 4 : simulatedStep;

  // Dòng trạng thái tương ứng với từng bước
  const getStepText = () => {
    if (isSuccess || currentStep === 4) {
      return 'Sao chép hoàn tất! Đang mở bộ sưu tập...';
    }
    switch (currentStep) {
      case 1:
        return 'Đang phân tích kho từ vựng & kiểm tra dữ liệu...';
      case 2:
        return 'Đang sao chép thông tin thẻ, định nghĩa & ví dụ...';
      case 3:
      default:
        return 'Đang nhân bản từ vựng & khởi tạo lịch ôn tập SRS...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-md bg-surface border border-border/90 rounded-2xl shadow-2xl p-6 sm:p-7 z-10 overflow-hidden text-center space-y-5"
    >
      {/* Vòng hào quang sáng nền ấm áp (Brand Glow) */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 right-0 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Icon hoạt họa trung tâm */}
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
        {/* Vòng tròn xoay viền nét đứt */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl border-2 transition-colors duration-300',
            isSuccess
              ? 'border-emerald-500/60 bg-emerald-500/10'
              : 'border-dashed border-brand/40 animate-spin [animation-duration:8s] bg-brand/10'
          )}
        />

        {/* Icon chính */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success-icon"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-emerald-400"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="fork-icon"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="text-brand"
            >
              <GitFork className="w-8 h-8 rotate-180" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hạt lấp lánh trang trí */}
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-surface border border-brand/40 flex items-center justify-center text-amber-400 shadow-xs">
          <Sparkles className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Tiêu đề & Tên bộ sưu tập */}
      <div className="space-y-1.5">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
          {isSuccess ? 'Sao Chép Thành Công!' : 'Đang Fork Bộ Sưu Tập...'}
        </h3>

        {collectionTitle && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-base border border-border/80 text-xs font-semibold text-text-primary max-w-xs truncate shadow-inner">
            <Layers className="w-3.5 h-3.5 text-brand shrink-0" />
            <span className="truncate">{collectionTitle}</span>
          </div>
        )}
      </div>

      {/* Thanh tiến trình Progress Bar & Phần trăm */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary font-medium transition-all duration-200">
            {getStepText()}
          </span>
          <span className="font-mono font-bold text-brand ml-2 shrink-0">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Thanh Track */}
        <div className="h-2.5 w-full bg-base rounded-full overflow-hidden p-0.5 border border-border/80 relative shadow-inner">
          {/* Thanh Fill */}
          <motion.div
            className={cn(
              'h-full rounded-full transition-all duration-200 ease-out relative',
              isSuccess
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/50'
                : 'bg-gradient-to-r from-brand via-amber-500 to-emerald-400 shadow-sm shadow-brand/40'
            )}
            style={{ width: `${Math.max(8, Math.min(100, progress))}%` }}
          >
            {/* Hiệu ứng Shimmer vệt sáng quét qua */}
            {!isSuccess && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse" />
            )}
          </motion.div>
        </div>
      </div>

      {/* 3 Bước tiến trình nhỏ (Step Indicators) */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
        <div
          className={cn(
            'p-2 rounded-xl border flex flex-col items-center gap-1 transition-all duration-200',
            currentStep >= 1
              ? 'bg-brand/10 border-brand/30 text-text-primary'
              : 'bg-base/40 border-border/40 text-text-muted opacity-60'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
              currentStep > 1
                ? 'bg-emerald-500 text-white'
                : currentStep === 1
                ? 'bg-brand text-white'
                : 'bg-border text-text-secondary'
            )}
          >
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <span className="font-medium truncate w-full text-center">Quét dữ liệu</span>
        </div>

        <div
          className={cn(
            'p-2 rounded-xl border flex flex-col items-center gap-1 transition-all duration-200',
            currentStep >= 2
              ? 'bg-brand/10 border-brand/30 text-text-primary'
              : 'bg-base/40 border-border/40 text-text-muted opacity-60'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
              currentStep > 2
                ? 'bg-emerald-500 text-white'
                : currentStep === 2
                ? 'bg-brand text-white'
                : 'bg-border text-text-secondary'
            )}
          >
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <span className="font-medium truncate w-full text-center">Sao chép thẻ</span>
        </div>

        <div
          className={cn(
            'p-2 rounded-xl border flex flex-col items-center gap-1 transition-all duration-200',
            currentStep >= 3
              ? 'bg-brand/10 border-brand/30 text-text-primary'
              : 'bg-base/40 border-border/40 text-text-muted opacity-60'
          )}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold',
              currentStep >= 4
                ? 'bg-emerald-500 text-white'
                : currentStep === 3
                ? 'bg-brand text-white'
                : 'bg-border text-text-secondary'
            )}
          >
            {currentStep >= 4 ? '✓' : '3'}
          </div>
          <span className="font-medium truncate w-full text-center">Đồng bộ SRS</span>
        </div>
      </div>

      {/* Mẹo nhỏ bên dưới */}
      <div className="p-3 rounded-xl bg-base/60 border border-border/60 text-[11px] text-text-secondary flex items-center gap-2 text-left leading-relaxed">
        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Bộ từ sẽ được sao chép nguyên bản vào kho cá nhân của bạn và áp dụng thuật toán ghi nhớ.
        </span>
      </div>
    </motion.div>
  );
}

export function ForkLoadingModal({
  isOpen,
  collectionTitle = '',
  isSuccess = false,
  onFinishSuccess,
}: ForkLoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop tối mờ với hiệu ứng làm nhòe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Content - mount mới khi isOpen = true, tự reset state */}
          <ForkLoadingModalContent
            collectionTitle={collectionTitle}
            isSuccess={isSuccess}
            onFinishSuccess={onFinishSuccess}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
