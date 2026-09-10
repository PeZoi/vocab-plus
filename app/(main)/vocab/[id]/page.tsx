'use client';

import { VocabDetailExpansion } from '@/components/features/cards/detail/vocab-detail-expansion';
import { VocabDetailFsrsCard } from '@/components/features/cards/detail/vocab-detail-fsrs-card';
import { VocabDetailHeader } from '@/components/features/cards/detail/vocab-detail-header';
import { VocabDetailHero } from '@/components/features/cards/detail/vocab-detail-hero';
import { VocabDetailLevelCard } from '@/components/features/cards/detail/vocab-detail-level-card';
import { VocabDetailMetadata } from '@/components/features/cards/detail/vocab-detail-metadata';
import { VocabDetailSkeleton } from '@/components/features/cards/detail/vocab-detail-skeleton';
import { CardDeleteDialog } from '@/components/features/cards/card-delete-dialog';
import { CardEditModal } from '@/components/features/cards/card-edit-modal';
import { AddToCollectionModal } from '@/components/features/collections/add-to-collection-modal';
import { CreateCollectionModal } from '@/components/features/collections/create-collection-modal';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useCardDetailQuery } from '@/hooks/features/cards/use-cards-query';
import type { CollocationItem, WordFamilyItem } from '@/types/card.types';
import { ArrowLeft, BookOpen } from 'lucide-react';
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
    return <VocabDetailSkeleton />;
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
          <p className="text-xs text-slate-400">
            Từ vựng này có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => router.push(ROUTES.APP.VOCAB)}
          variant="surface"
          className="gap-2 text-xs"
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-1">
      {/* Top Header & Breadcrumb Bar */}
      <VocabDetailHeader
        card={card}
        onOpenEdit={() => setIsEditOpen(true)}
        onOpenDelete={() => setIsDeleteOpen(true)}
        onOpenAddToCollection={() => setIsAddToCollectionOpen(true)}
      />

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Learning Content */}
        <div className="lg:col-span-8 space-y-5">
          <VocabDetailHero card={card} />
          <VocabDetailExpansion collocations={collocations} wordFamily={wordFamily} />
        </div>

        {/* Right Column: Word Growth Level, FSRS Memory & Metadata */}
        <div className="lg:col-span-4 space-y-5">
          <VocabDetailLevelCard userCard={userCard} />
          <VocabDetailFsrsCard userCard={userCard} />
          <VocabDetailMetadata card={card} />
        </div>
      </div>

      {/* Modals */}
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
