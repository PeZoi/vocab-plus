'use client';

import { AudioButton } from '@/components/common/audio-button';
import { CEFRBadge } from '@/components/common/cefr-badge';
import { EmptyState } from '@/components/common/empty-state';
import { CollectionDeleteDialog } from '@/components/features/collections/collection-delete-dialog';
import { CreateCollectionModal } from '@/components/features/collections/create-collection-modal';
import { SelectCardsModal } from '@/components/features/collections/select-cards-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { COLLECTION_CATEGORY_MAP } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';
import {
  useCollectionDetailQuery,
  useDeleteCollectionMutation,
  useForkCollectionMutation,
  useRemoveCardFromCollectionMutation,
  useToggleLikeMutation,
} from '@/hooks/features/collections/use-collections';
import { formatIPA } from '@/utils/formatters';
import {
  ArrowLeft,
  BookOpen,
  Edit3,
  GitFork,
  Globe,
  Heart,
  Loader2,
  Lock,
  Play,
  Plus,
  Trash2
} from 'lucide-react';
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

  const { data: collection, isLoading, isError, refetch } = useCollectionDetailQuery(id);
  const forkMutation = useForkCollectionMutation();
  const likeMutation = useToggleLikeMutation();
  const deleteMutation = useDeleteCollectionMutation();
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

  const catInfo = COLLECTION_CATEGORY_MAP[collection.category] || COLLECTION_CATEGORY_MAP.other;
  const cards = collection.cards || [];

  const handleStudy = () => {
    router.push(`${ROUTES.APP.REVIEW}?collection_id=${collection.id}`);
  };

  const handleFork = async () => {
    try {
      setIsForking(true);
      const res = await forkMutation.mutateAsync(collection.id);
      alert(res.message || 'Đã clone bộ từ vựng thành công!');
      if (res.collection?.id) {
        router.push(ROUTES.APP.COLLECTION_DETAIL(res.collection.id));
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Lỗi khi clone bộ từ');
    } finally {
      setIsForking(false);
    }
  };

  const handleToggleLike = async () => {
    try {
      await likeMutation.mutateAsync(collection.id);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
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
      {/* Back Button */}
      <Link
        href={ROUTES.APP.COLLECTIONS}
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Quay lại Thư viện bộ từ</span>
      </Link>

      {/* Collection Header Banner */}
      <div className="relative p-6 sm:p-7 rounded-2xl bg-surface/90 border border-border/80 shadow-xs space-y-4 overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${catInfo.gradient}`}
        />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            {/* Category & Privacy & Tag Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${catInfo.badgeBg} ${catInfo.badgeText} ${catInfo.badgeBorder}`}
              >
                {catInfo.label}
              </span>

              {collection.is_public ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-base px-2 py-0.5 rounded-full border border-border/60">
                  <Globe className="w-3 h-3 text-sky-400" />
                  <span>Công khai</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-base px-2 py-0.5 rounded-full border border-border/60">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Riêng tư</span>
                </span>
              )}

              {collection.tags?.map((t, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono text-text-secondary bg-base px-2 py-0.5 rounded border border-border/60"
                >
                  {t.startsWith('#') ? t : `#${t}`}
                </span>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {collection.title}
            </h1>

            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              {collection.description || 'Chưa có mô tả chi tiết cho bộ sưu tập này.'}
            </p>

            {/* Creator info & stats */}
            <div className="flex items-center gap-4 text-xs text-text-secondary pt-1 flex-wrap">
              {collection.creator && (
                <span>Tác giả: <strong className="text-text-primary">{collection.creator.display_name || 'Người dùng Vocab'}</strong></span>
              )}
              <span>•</span>
              <span><strong>{cards.length}</strong> từ vựng</span>
              <span>•</span>
              <button
                type="button"
                onClick={handleToggleLike}
                className={`flex items-center gap-1 transition-colors hover:text-rose-400 ${
                  collection.is_liked ? 'text-rose-400 font-bold' : ''
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${collection.is_liked ? 'fill-rose-400' : ''}`} />
                <span>{collection.likes_count} thích</span>
              </button>
              <span>•</span>
              <span className="flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5" />
                <span>{collection.fork_count} lượt clone</span>
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {cards.length > 0 && (
              <Button
                onClick={handleStudy}
                className="gap-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-xs shadow-brand/30"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Ôn tập bộ này</span>
              </Button>
            )}

            {!collection.is_owner ? (
              <Button
                onClick={handleFork}
                disabled={isForking}
                variant="outline"
                className="gap-1.5 text-xs border-brand/40 text-brand hover:bg-brand/10"
              >
                {isForking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitFork className="w-3.5 h-3.5" />
                )}
                <span>1-Click Clone</span>
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa bộ</span>
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-danger hover:bg-danger/10 border-danger/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Danh sách từ vựng trong bộ ({cards.length})
          </h2>

          {collection.is_owner && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSelectCardsOpen(true)}
              className="gap-1.5 text-xs border-brand/40 text-brand hover:bg-brand/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kho vựng</span>
            </Button>
          )}
        </div>

        {cards.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface/50 border border-dashed border-border/80 space-y-3">
            <BookOpen className="w-8 h-8 text-text-secondary mx-auto opacity-50" />
            <p className="text-xs text-text-secondary">
              Bộ sưu tập này chưa có từ vựng nào.
            </p>
            {collection.is_owner && (
              <Button
                size="sm"
                onClick={() => setIsSelectCardsOpen(true)}
                className="gap-1.5 text-xs bg-brand hover:bg-brand-hover text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm từ vựng</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => router.push(ROUTES.APP.VOCAB_DETAIL(card.id))}
                className="group p-4 rounded-xl bg-surface/70 hover:bg-surface border border-border/70 hover:border-brand/40 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base text-text-primary group-hover:text-brand transition-colors">
                        {card.word}
                      </span>
                      {card.ipa && (
                        <span className="font-mono text-xs text-text-secondary whitespace-nowrap">
                          {formatIPA(card.ipa)}
                        </span>
                      )}
                      {card.cefr_level && (
                        <CEFRBadge level={card.cefr_level} size="sm" />
                      )}
                      {card.part_of_speech && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                          {card.part_of_speech}
                        </Badge>
                      )}
                    </div>
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AudioButton text={card.word} size="sm" />
                      {collection.is_owner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(card.id, card.word)}
                          title="Xóa khỏi bộ từ"
                          className="w-7 h-7 rounded hover:bg-danger/10 text-text-secondary hover:text-danger flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2">
                    {card.definition}
                  </p>

                  {card.example_sentence && (
                    <p className="text-[11.5px] text-text-secondary/80 italic line-clamp-1 border-l-2 border-border/60 pl-2">
                      &ldquo;{card.example_sentence}&rdquo;
                    </p>
                  )}
                </div>

                {card.tags && card.tags.length > 0 && (
                  <div className="flex items-center gap-1 pt-1 flex-wrap">
                    {card.tags.slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-base text-text-secondary border border-border/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}
