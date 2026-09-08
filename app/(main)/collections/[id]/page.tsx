'use client';

import { EmptyState } from '@/components/common/empty-state';
import { CollectionDeleteDialog } from '@/components/features/collections/collection-delete-dialog';
import { CreateCollectionModal } from '@/components/features/collections/create-collection-modal';
import { CollectionDetailBanner } from '@/components/features/collections/detail/collection-detail-banner';
import { CollectionDetailWordList } from '@/components/features/collections/detail/collection-detail-word-list';
import { DuplicateResolutionModal } from '@/components/features/collections/duplicate-resolution-modal';
import { ForkLoadingModal } from '@/components/features/collections/fork-loading-modal';
import { ForkSuccessDialog } from '@/components/features/collections/fork-success-dialog';
import { SelectCardsModal } from '@/components/features/collections/select-cards-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { collectionsService } from '@/services/collections.service';
import type { AnalyzeForkResult, Collection } from '@/types/collection.types';
import {
  useCollectionDetailQuery,
  useForkCollectionMutation,
  useRemoveCardFromCollectionMutation,
  useToggleLikeMutation
} from '@/hooks/features/collections/use-collections';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSelectCardsOpen, setIsSelectCardsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [forkSuccessResult, setForkSuccessResult] = useState<{
    collection: Collection;
    cardsCount: number;
  } | null>(null);
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<AnalyzeForkResult | null>(null);
  const [forkLoadingState, setForkLoadingState] = useState<{
    isOpen: boolean;
    collectionTitle: string;
    isSuccess: boolean;
    pendingResult?: {
      collection: Collection;
      cardsCount: number;
    } | null;
  }>({
    isOpen: false,
    collectionTitle: '',
    isSuccess: false,
    pendingResult: null,
  });

  const { data: collection, isLoading, isError, refetch } = useCollectionDetailQuery(id);
  const forkMutation = useForkCollectionMutation();
  const likeMutation = useToggleLikeMutation();
  const removeCardMutation = useRemoveCardFromCollectionMutation();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="p-6 rounded-2xl bg-surface/80 border border-border/80 space-y-4">
          <Skeleton className="h-8 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>
      </div>
    );
  }

  if (isError || !collection) {
    return (
      <div className="max-w-2xl mx-auto my-12">
        <EmptyState
          icon={BookOpen}
          title="Không tìm thấy bộ sưu tập"
          description="Bộ sưu tập này không tồn tại hoặc bạn không có quyền truy cập."
          actionText="Quay lại danh sách"
          onAction={() => router.push(ROUTES.APP.COLLECTIONS)}
        />
      </div>
    );
  }

  const cards = collection.cards || [];

  const handleStudy = () => {
    router.push(`${ROUTES.APP.REVIEW}?collection_id=${collection.id}`);
  };

  const handleFork = async () => {
    try {
      setIsForking(true);
      setForkLoadingState({
        isOpen: true,
        collectionTitle: collection.title,
        isSuccess: false,
        pendingResult: null,
      });

      // Bước 1: Phân tích trùng lặp trước
      const analysis = await collectionsService.analyzeFork(collection.id);
      if (analysis.has_duplicates) {
        setForkLoadingState({
          isOpen: false,
          collectionTitle: '',
          isSuccess: false,
          pendingResult: null,
        });
        setDuplicateAnalysis(analysis);
        return;
      }

      // Bước 2: Không có trùng -> Clone toàn bộ
      const res = await forkMutation.mutateAsync(collection.id);
      if (res.collection) {
        setForkLoadingState((prev) => ({
          ...prev,
          isSuccess: true,
          pendingResult: {
            collection: res.collection,
            cardsCount: res.cards_cloned ?? collection.cards?.length ?? 0,
          },
        }));
      } else {
        setForkLoadingState({
          isOpen: false,
          collectionTitle: '',
          isSuccess: false,
          pendingResult: null,
        });
      }
    } catch (err: unknown) {
      setForkLoadingState({
        isOpen: false,
        collectionTitle: '',
        isSuccess: false,
        pendingResult: null,
      });
      const msg = err instanceof Error ? err.message : 'Lỗi khi fork bộ từ';
      console.error(msg);
    } finally {
      setIsForking(false);
    }
  };

  const handleConfirmSmartFork = async (selectedCardIds: string[]) => {
    try {
      setIsForking(true);
      setDuplicateAnalysis(null);
      setForkLoadingState({
        isOpen: true,
        collectionTitle: collection.title,
        isSuccess: false,
        pendingResult: null,
      });

      const res = await forkMutation.mutateAsync({
        id: collection.id,
        options: { selected_card_ids: selectedCardIds },
      });

      if (res.collection) {
        setForkLoadingState((prev) => ({
          ...prev,
          isSuccess: true,
          pendingResult: {
            collection: res.collection,
            cardsCount: res.cards_cloned ?? 0,
          },
        }));
      } else {
        setForkLoadingState({
          isOpen: false,
          collectionTitle: '',
          isSuccess: false,
          pendingResult: null,
        });
      }
    } catch (err: unknown) {
      setForkLoadingState({
        isOpen: false,
        collectionTitle: '',
        isSuccess: false,
        pendingResult: null,
      });
      const msg = err instanceof Error ? err.message : 'Lỗi khi clone bộ từ';
      console.error(msg);
    } finally {
      setIsForking(false);
    }
  };

  const handleFinishForkSuccess = () => {
    if (forkLoadingState.pendingResult) {
      setForkSuccessResult(forkLoadingState.pendingResult);
    }
    setForkLoadingState({
      isOpen: false,
      collectionTitle: '',
      isSuccess: false,
      pendingResult: null,
    });
  };

  const handleToggleLike = async () => {
    try {
      await likeMutation.mutateAsync(collection.id);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleRemoveCard = async (cardId: string, word: string) => {
    if (!confirm(`Xóa từ "${word}" khỏi bộ sưu tập này? (Từ vẫn được lưu trong kho cá nhân của bạn)`)) return;
    try {
      await removeCardMutation.mutateAsync({ collectionId: collection.id, cardId });
    } catch (err) {
      console.error('Remove card error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back Link */}
      <Link
        href={ROUTES.APP.COLLECTIONS}
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại Thư viện bộ từ</span>
      </Link>

      {/* Header Banner */}
      <CollectionDetailBanner
        collection={collection}
        isForking={isForking}
        onStudy={handleStudy}
        onFork={handleFork}
        onToggleLike={handleToggleLike}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* Cards List Section */}
      <CollectionDetailWordList
        cards={cards}
        isOwner={!!collection.is_owner}
        onRemoveCard={handleRemoveCard}
        onOpenSelectCards={() => setIsSelectCardsOpen(true)}
      />

      {/* Edit Collection Modal */}
      <CreateCollectionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        collectionToEdit={collection}
        onSuccess={() => refetch()}
      />

      {/* Select Cards from Vocab Modal */}
      <SelectCardsModal
        isOpen={isSelectCardsOpen}
        onClose={() => setIsSelectCardsOpen(false)}
        collectionId={collection.id}
        existingCardIds={cards.map((c) => c.id)}
        onSuccess={() => refetch()}
      />

      {/* Delete Collection Dialog */}
      <CollectionDeleteDialog
        collection={collection}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => router.push(ROUTES.APP.COLLECTIONS)}
      />

      {/* Fork Loading Modal with Progress */}
      <ForkLoadingModal
        isOpen={forkLoadingState.isOpen}
        collectionTitle={forkLoadingState.collectionTitle}
        isSuccess={forkLoadingState.isSuccess}
        onFinishSuccess={handleFinishForkSuccess}
      />

      {/* Duplicate Resolution Modal for Smart Fork */}
      <DuplicateResolutionModal
        isOpen={!!duplicateAnalysis}
        onClose={() => setDuplicateAnalysis(null)}
        collectionTitle={collection.title}
        analysis={duplicateAnalysis}
        onConfirm={handleConfirmSmartFork}
        isSubmitting={isForking}
      />

      {/* Fork Success Dialog */}
      <ForkSuccessDialog
        isOpen={!!forkSuccessResult}
        onClose={() => setForkSuccessResult(null)}
        clonedCollection={forkSuccessResult?.collection || null}
        cardsCount={forkSuccessResult?.cardsCount || 0}
      />
    </div>
  );
}
