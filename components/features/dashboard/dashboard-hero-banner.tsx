'use client';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { BookOpen, Layers, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import React from 'react';

interface DashboardHeroBannerProps {
  dueCount: number;
}

export function DashboardHeroBanner({ dueCount }: DashboardHeroBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-surface/90 border border-border/80 p-5 sm:p-6 shadow-sm"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-lg">
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-tight">
            {dueCount > 0 ? (
              <>
                Bạn có <span className="text-brand font-bold">{dueCount}</span> từ cần ôn tập hôm nay
              </>
            ) : (
              'Hôm nay bạn đã ôn tập đầy đủ!'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {dueCount > 0
              ? 'Ôn tập đúng lúc theo chu kỳ lặp lại ngắt quãng giúp tăng tỷ lệ ghi nhớ dài hạn lên 90%.'
              : 'Mục tiêu hoàn thành xuất sắc! Hãy bổ sung thêm các từ mới để tiếp tục mở rộng vốn từ.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {dueCount > 0 ? (
            <Link href={ROUTES.APP.REVIEW}>
              <Button size="default" variant="primary" className="gap-2">
                <Layers className="w-4 h-4" />
                <span>Bắt đầu ôn ({dueCount})</span>
              </Button>
            </Link>
          ) : (
            <Link href={ROUTES.APP.ADD}>
              <Button size="default" variant="primary" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Thêm từ mới</span>
              </Button>
            </Link>
          )}
          <Link href={ROUTES.APP.VOCAB}>
            <Button size="default" variant="surface" className="gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Kho từ vựng</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
