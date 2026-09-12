'use client';

import { CEFRBadge } from '@/components/common/cefr-badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { CEFR_LEVELS_LIST } from '@/constants/cefr';
import { ROUTES } from '@/constants/routes';
import { useCardsQuery } from '@/hooks/features/cards/use-cards-query';
import { useCollectionsQuery } from '@/hooks/features/collections/use-collections';
import { cn } from '@/lib/utils';
import type { CEFRLevel } from '@/types/card.types';
import {
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  Hash,
  Loader2,
  Play,
  Target,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

interface CustomStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StudyMode = 'tag' | 'cefr' | 'collection';

export function CustomStudyModal({ isOpen, onClose }: CustomStudyModalProps) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<StudyMode>('tag');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCefr, setSelectedCefr] = useState<CEFRLevel | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const { data: cards = [], isLoading: isLoadingCards } = useCardsQuery();
  const { data: collections = [], isLoading: isLoadingCollections } = useCollectionsQuery({
    tab: 'my',
  });

  // Thống kê số lượng từ theo từng Tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach((card) => {
      if (Array.isArray(card.tags)) {
        card.tags.forEach((tag) => {
          const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
          counts[cleanTag] = (counts[cleanTag] || 0) + 1;
        });
      }
    });
    return counts;
  }, [cards]);

  const availableTags = useMemo(() => Object.keys(tagCounts).sort(), [tagCounts]);

  // Thống kê số lượng từ theo CEFR
  const cefrCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach((card) => {
      if (card.cefr_level && card.cefr_level !== 'none') {
        counts[card.cefr_level] = (counts[card.cefr_level] || 0) + 1;
      }
    });
    return counts;
  }, [cards]);

  // Đếm số lượng từ dự kiến ôn tập
  const targetWordCount = useMemo(() => {
    if (activeMode === 'tag' && selectedTag) {
      return tagCounts[selectedTag] || 0;
    }
    if (activeMode === 'cefr' && selectedCefr) {
      return cefrCounts[selectedCefr] || 0;
    }
    if (activeMode === 'collection' && selectedCollectionId) {
      const col = collections.find((c) => c.id === selectedCollectionId);
      return col?.card_count || 0;
    }
    return 0;
  }, [
    activeMode,
    selectedTag,
    selectedCefr,
    selectedCollectionId,
    tagCounts,
    cefrCounts,
    collections,
  ]);

  const canStart = Boolean(
    (activeMode === 'tag' && selectedTag) ||
      (activeMode === 'cefr' && selectedCefr) ||
      (activeMode === 'collection' && selectedCollectionId)
  );

  const handleStart = () => {
    if (!canStart) return;

    const query = new URLSearchParams();
    if (activeMode === 'tag' && selectedTag) {
      query.set('tag', selectedTag.replace('#', ''));
    } else if (activeMode === 'cefr' && selectedCefr) {
      query.set('cefr_level', selectedCefr);
    } else if (activeMode === 'collection' && selectedCollectionId) {
      query.set('collection_id', selectedCollectionId);
    }

    onClose();
    router.push(`${ROUTES.APP.REVIEW}?${query.toString()}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Phiên Học Tùy Chỉnh (Custom Study)</h3>
            <p className="text-xs text-text-secondary">
              Ôn tập tập trung theo Tag, Trình độ CEFR hoặc Bộ sưu tập mà không ảnh hưởng lịch
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5 pt-1">
        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-base border border-border/80 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode('tag')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-medium transition-all',
              activeMode === 'tag'
                ? 'bg-surface text-brand shadow-xs border border-border/60'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Theo Tag ({availableTags.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('cefr')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-medium transition-all',
              activeMode === 'cefr'
                ? 'bg-surface text-brand shadow-xs border border-border/60'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Theo CEFR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('collection')}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-medium transition-all',
              activeMode === 'collection'
                ? 'bg-surface text-brand shadow-xs border border-border/60'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Bộ sưu tập ({collections.length})</span>
          </button>
        </div>

        {/* Tab 1: Tags Selection */}
        {activeMode === 'tag' && (
          <div className="space-y-2">
            <span className="text-xs text-text-secondary block">
              Chọn 1 chủ đề / nhãn tag để ôn tập:
            </span>
            {isLoadingCards ? (
              <div className="flex items-center justify-center py-8 text-xs text-text-secondary gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
                <span>Đang tải danh sách tags...</span>
              </div>
            ) : availableTags.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-secondary bg-base/50 rounded-xl border border-dashed border-border">
                Bạn chưa có tag nào trong kho từ vựng. Hãy gán tag (vd: #ielts, #work) khi tạo hoặc sửa từ.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                {availableTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  const count = tagCounts[tag] || 0;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all',
                        isSelected
                          ? 'bg-brand/15 text-brand border-brand ring-1 ring-brand/50 shadow-xs'
                          : 'bg-base/70 text-text-secondary border-border/70 hover:bg-surface hover:text-text-primary'
                      )}
                    >
                      <Hash className="w-3 h-3" />
                      <span className="font-semibold">{tag.replace('#', '')}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface border border-border/60 text-text-secondary">
                        {count}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: CEFR Level Selection */}
        {activeMode === 'cefr' && (
          <div className="space-y-2">
            <span className="text-xs text-text-secondary block">
              Chọn cấp độ CEFR quốc tế bạn muốn ôn luyện:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CEFR_LEVELS_LIST.map((level: CEFRLevel) => {
                const isSelected = selectedCefr === level;
                const count = cefrCounts[level] || 0;
                return (
                  <div
                    key={level}
                    onClick={() => setSelectedCefr(level)}
                    className={cn(
                      'p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none',
                      isSelected
                        ? 'bg-surface border-brand ring-1 ring-brand shadow-xs'
                        : 'bg-base/60 border-border/70 hover:border-border hover:bg-surface'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CEFRBadge level={level as CEFRLevel} />
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand" />}
                    </div>
                    <div className="text-xs text-text-secondary">
                      Hiện có: <strong className="text-text-primary font-bold">{count}</strong> từ vựng
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Collection Selection */}
        {activeMode === 'collection' && (
          <div className="space-y-2">
            <span className="text-xs text-text-secondary block">
              Chọn 1 bộ từ vựng để ôn tập:
            </span>
            {isLoadingCollections ? (
              <div className="flex items-center justify-center py-8 text-xs text-text-secondary gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
                <span>Đang tải danh sách bộ sưu tập...</span>
              </div>
            ) : collections.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-secondary bg-base/50 rounded-xl border border-dashed border-border">
                Chưa có bộ sưu tập nào khả dụng. Hãy tạo hoặc clone một bộ sưu tập từ Thư viện cộng đồng.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                {collections.map((col) => {
                  const isSelected = selectedCollectionId === col.id;
                  return (
                    <div
                      key={col.id}
                      onClick={() => setSelectedCollectionId(col.id)}
                      className={cn(
                        'p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none text-left',
                        isSelected
                          ? 'bg-surface border-brand ring-1 ring-brand shadow-xs'
                          : 'bg-base/60 border-border/70 hover:border-border hover:bg-surface'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-text-primary truncate max-w-[170px]">
                          {col.title}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 border-t border-border/40">
                        <span>{col.card_count ?? 0} từ</span>
                        <span>{col.is_public ? 'Công khai' : 'Cá nhân'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom Banner & Action */}
        <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-text-secondary">
            {canStart ? (
              <span>
                Đã chọn: <strong className="text-brand font-bold">{targetWordCount}</strong> từ vựng khả dụng
              </span>
            ) : (
              <span>Vui lòng chọn 1 mục để bắt đầu ôn tập</span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Hủy
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleStart}
              disabled={!canStart || targetWordCount === 0}
              className="gap-1.5 text-xs font-semibold shadow-xs shadow-brand/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Bắt đầu ôn tập</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
