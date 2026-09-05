'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { CardDeleteDialog } from '@/components/features/cards/card-delete-dialog';
import { CardEditModal } from '@/components/features/cards/card-edit-modal';
import { AddToCollectionModal } from '@/components/features/collections/add-to-collection-modal';
import { CreateCollectionModal } from '@/components/features/collections/create-collection-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { useCardDetailQuery } from '@/hooks/features/cards/use-cards-query';
import type {
  CollocationItem,
  WordFamilyItem,
} from '@/types/card.types';
import { formatDateTime, formatRelativeTime } from '@/utils/datetime';
import { formatIPA } from '@/utils/formatters';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Clock,
  Edit2,
  FolderPlus,
  GitFork,
  Layers,
  Lightbulb,
  Link2,
  Quote,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VocabDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Query card details
  const { data: card, isLoading, isError, refetch } = useCardDetailQuery(id);

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);

  // Loading state skeleton
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16 pt-2">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>

        {/* Layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <div className="p-7 rounded-2xl bg-surface/70 border border-border/70 space-y-5">
              <Skeleton className="h-10 w-52 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <div className="p-6 rounded-2xl bg-surface/70 border border-border/70 space-y-4">
              <Skeleton className="h-6 w-44 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-5">
            <div className="p-6 rounded-2xl bg-surface/70 border border-border/70 space-y-4">
              <Skeleton className="h-6 w-36 rounded-md" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found state
  if (isError || !card) {
    return (
      <div className="max-w-2xl mx-auto my-16 text-center space-y-5 p-8 rounded-2xl bg-surface/80 border border-border/70 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-white">
            Không tìm thấy từ vựng
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Thẻ từ vựng này không tồn tại hoặc bạn không có quyền truy cập. Vui lòng kiểm tra lại đường dẫn.
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.APP.VOCAB)}
          variant="primary"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về kho từ vựng</span>
        </Button>
      </div>
    );
  }

  const userCard = card.user_card;
  const collocations = (card.collocations as unknown as CollocationItem[]) || [];
  const wordFamily = (card.word_family as unknown as WordFamilyItem[]) || [];
  const isDue = userCard?.due_at ? new Date(userCard.due_at) <= new Date() : false;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-1">
      {/* ================= TOP NAVIGATION & BREADCRUMB BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.APP.VOCAB)}
            className="gap-1.5 text-slate-400 hover:text-white px-2.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kho từ vựng</span>
          </Button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
            {card.word}
          </span>
          {card.card_type && card.card_type !== 'word' && (
            <Badge variant="outline" className="text-[10px] uppercase font-mono text-brand border-brand/30">
              {card.card_type}
            </Badge>
          )}
        </div>

        {/* Quick Toolbar Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddToCollectionOpen(true)}
            className="gap-1.5 text-xs text-slate-300 border-border/70 hover:text-white hover:border-brand/40"
          >
            <FolderPlus className="w-3.5 h-3.5 text-brand" />
            <span className="hidden sm:inline">Bộ sưu tập</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5 text-xs text-slate-300 border-border/70 hover:text-white hover:border-brand/40"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Chỉnh sửa</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 text-slate-400 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
            title="Xóa thẻ từ vựng"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ================= MAIN 2-COLUMN UNIFIED LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Learning Material (~67%) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. MASTER VOCABULARY CARD (Liền mạch: Tên từ + Phát âm + Định nghĩa + Ví dụ ngữ cảnh) */}
          <div className="rounded-2xl bg-surface/90 border border-border/70 shadow-sm overflow-hidden divide-y divide-border/40">
            {/* Header: Word & Phonetics */}
            <div className="p-6 sm:p-7 space-y-4 relative">
              {/* Subtle background ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {card.word}
                    </h1>
                    {card.cefr_level && (
                      <CEFRBadge level={card.cefr_level} size="md" />
                    )}
                    {card.part_of_speech && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-hover text-slate-300 border border-border/70 capitalize">
                        {card.part_of_speech}
                      </span>
                    )}
                  </div>

                  {/* IPA & Pronunciation Audio */}
                  <div className="flex items-center gap-3">
                    {card.ipa ? (
                      <span className="font-mono text-sm sm:text-[15px] text-slate-300 bg-base/70 px-3 py-1 rounded-lg border border-border/70 inline-flex items-center gap-1.5 shadow-2xs">
                        {formatIPA(card.ipa)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Chưa có phiên âm IPA</span>
                    )}
                    <AudioButton text={card.word} size="md" />
                  </div>
                </div>

                {/* AI Badge & Metadata */}
                <div className="flex flex-col items-end gap-2">
                  {card.source_type === 'ai_generated' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/25 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Tags inline */}
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-brand/90 bg-brand/10 px-2.5 py-0.5 rounded-md border border-brand/20 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Core Definition Section */}
            <div className="p-6 sm:p-7 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand" />
                <span>Định nghĩa tiếng Việt</span>
              </span>
              <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                {card.definition}
              </p>
            </div>

            {/* Context Example Sentence Section */}
            {card.example_sentence && (
              <div className="p-6 sm:p-7 bg-base/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-brand" />
                    <span>Ví dụ ngữ cảnh thực tế</span>
                  </span>
                  <AudioButton text={card.example_sentence} size="sm" />
                </div>

                <div className="border-l-2 border-brand/80 pl-4 py-1">
                  <p className="text-[15px] sm:text-[16px] text-slate-100 italic font-serif leading-relaxed">
                    &ldquo;{card.example_sentence}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. MNEMONIC INSIGHT (Khối mẹo nhớ ấm áp, phong cách AI Callout) */}
          {card.mnemonic && (
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/[0.04] to-transparent border border-amber-500/25 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Mẹo liên tưởng ghi nhớ (Mnemonic)
                </span>
              </div>
              <p className="text-[14.5px] sm:text-[15.5px] text-amber-100/95 leading-relaxed font-normal pl-9">
                {card.mnemonic}
              </p>
            </div>
          )}

          {/* 3. VOCABULARY EXPANSION: Collocations & Word Family (Gộp chung trong 1 container thoáng đãng) */}
          {((Array.isArray(collocations) && collocations.length > 0) ||
            (Array.isArray(wordFamily) && wordFamily.length > 0)) && (
            <div className="rounded-2xl bg-surface/90 border border-border/70 p-6 sm:p-7 space-y-6 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                <Layers className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mở rộng từ vựng & Ngữ cảnh
                </h3>
              </div>

              {/* Collocations Section */}
              {Array.isArray(collocations) && collocations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Link2 className="w-3.5 h-3.5 text-brand" />
                    <span>Cụm từ hay đi kèm (Collocations)</span>
                    <span className="text-slate-500 font-normal">({collocations.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {collocations.map((col, idx) => {
                      const phrase = typeof col === 'string' ? col : col.phrase;
                      const meaning = typeof col === 'object' ? col.meaning : null;
                      const example = typeof col === 'object' ? col.example : null;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-base/40 border border-border/60 hover:border-brand/40 hover:bg-base/60 transition-all flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-brand text-[15px] sm:text-[16px]">
                                {phrase}
                              </span>
                              {example && <AudioButton text={example} size="sm" />}
                            </div>
                            {meaning && (
                              <p className="text-xs text-slate-200 mt-1.5 font-medium leading-normal">
                                {meaning}
                              </p>
                            )}
                          </div>
                          {example && (
                            <p className="text-xs text-slate-400 italic pt-2 border-t border-border/40 leading-relaxed">
                              &ldquo;{example}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Word Family Section */}
              {Array.isArray(wordFamily) && wordFamily.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <GitFork className="w-3.5 h-3.5 text-purple-400" />
                    <span>Gia đình từ vựng (Word Family)</span>
                    <span className="text-slate-500 font-normal">({wordFamily.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wordFamily.map((wf, idx) => {
                      const formWord =
                        typeof wf === 'string'
                          ? wf
                          : wf.word || (wf as { form_word?: string }).form_word;
                      const pos = typeof wf === 'object' ? wf.part_of_speech : '';
                      const meaning = typeof wf === 'object' ? wf.meaning : null;
                      const example = typeof wf === 'object' ? wf.example : null;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-base/40 border border-border/60 hover:border-purple-400/40 hover:bg-base/60 transition-all flex flex-col justify-between space-y-2.5"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-[15px] sm:text-[16px]">
                                  {formWord}
                                </span>
                                {pos && (
                                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 text-slate-300 bg-surface border-border">
                                    {pos}
                                  </Badge>
                                )}
                              </div>
                              {example && <AudioButton text={example} size="sm" />}
                            </div>
                            {meaning && (
                              <p className="text-xs text-slate-200 mt-1.5 font-medium leading-normal">
                                {meaning}
                              </p>
                            )}
                          </div>
                          {example && (
                            <p className="text-xs text-slate-400 italic pt-2 border-t border-border/40 leading-relaxed">
                              &ldquo;{example}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FSRS Memory Health & Card Management (~33%) */}
        <div className="lg:col-span-4 space-y-5">
          {/* FSRS Memory Widget */}
          <div className="rounded-2xl p-5 sm:p-6 bg-surface/90 border border-border/70 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-brand" />
                <span className="text-sm font-bold text-white">Trí nhớ FSRS</span>
              </div>
              <div className="flex items-center gap-1.5">
                {userCard?.is_leech && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Leech
                  </span>
                )}
                <Badge variant={isDue ? 'danger' : 'default'} className="text-[10px] font-medium">
                  {!userCard
                    ? 'Chưa học'
                    : userCard.state === 'review'
                    ? isDue
                      ? 'Đến hạn ôn'
                      : 'Đang ôn tập'
                    : userCard.state === 'learning'
                    ? 'Đang học'
                    : userCard.state === 'relearning'
                    ? 'Cần học lại'
                    : 'Thẻ mới'}
                </Badge>
              </div>
            </div>

            {userCard ? (
              <div className="space-y-4">
                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Độ ổn định
                    </span>
                    <span className="text-[16px] sm:text-lg font-bold text-brand block">
                      {userCard.stability ? `${userCard.stability.toFixed(1)} ngày` : '—'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Độ khó (1-10)
                    </span>
                    <span className="text-[16px] sm:text-lg font-bold text-white block">
                      {userCard.difficulty ? userCard.difficulty.toFixed(1) : '—'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Số lần ôn
                    </span>
                    <span className="text-[16px] sm:text-lg font-bold text-white block">
                      {userCard.review_count ?? 0}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-base/50 border border-border/60 text-center space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Số lần quên
                    </span>
                    <span className={`text-[16px] sm:text-lg font-bold block ${userCard.lapse_count ? 'text-amber-400' : 'text-white'}`}>
                      {userCard.lapse_count ?? 0}
                    </span>
                  </div>
                </div>

                {/* Due Date Indicator */}
                <div className="p-3.5 rounded-xl bg-base/40 border border-border/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Lần ôn kế tiếp:
                    </span>
                    <span className="font-semibold text-white">
                      {userCard.due_at ? formatRelativeTime(userCard.due_at) : 'Chưa xếp lịch'}
                    </span>
                  </div>
                  {userCard.due_at && (
                    <div className="text-[11px] text-slate-400 text-right">
                      {formatDateTime(userCard.due_at)}
                    </div>
                  )}
                </div>

                {/* Review Action Button */}
                <Button
                  onClick={() => router.push(ROUTES.APP.REVIEW)}
                  variant={isDue ? 'primary' : 'outline'}
                  className="w-full gap-2 font-medium text-white shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isDue ? 'Ôn tập ngay bây giờ' : 'Đến trang ôn tập SRS'}</span>
                </Button>
              </div>
            ) : (
              <div className="py-4 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  Thẻ này chưa được đưa vào chu trình ghi nhớ Spaced Repetition.
                </p>
                <Button
                  onClick={() => router.push(ROUTES.APP.REVIEW)}
                  variant="primary"
                  className="w-full gap-2 text-xs text-white"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Bắt đầu phiên học</span>
                </Button>
              </div>
            )}
          </div>

          {/* Card Management & Metadata Hub */}
          <div className="rounded-2xl p-5 bg-surface/90 border border-border/70 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span>Thông tin quản lý</span>
            </div>

            <div className="space-y-2.5 divide-y divide-border/40 text-slate-400">
              <div className="flex items-center justify-between pt-1">
                <span>Nguồn tạo thẻ:</span>
                <Badge variant="outline" className="text-[10px] uppercase text-slate-300 border-border">
                  {card.source_type}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Ngày tạo thẻ:</span>
                <span className="font-medium text-white">
                  {card.created_at ? formatDateTime(card.created_at) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span>Phân loại từ:</span>
                <span className="font-medium text-white capitalize">
                  {card.card_type ?? 'Từ đơn (Word)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      <CardEditModal
        card={card}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => refetch()}
      />

      <CardDeleteDialog
        card={card}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => router.push(ROUTES.APP.VOCAB)}
      />

      <AddToCollectionModal
        card={card}
        isOpen={isAddToCollectionOpen}
        onClose={() => setIsAddToCollectionOpen(false)}
        onCreateNewCollection={() => {
          setIsAddToCollectionOpen(false);
          setIsCreateCollectionOpen(true);
        }}
      />

      <CreateCollectionModal
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
      />
    </div>
  );
}
