'use client';

import { Button } from '@/components/ui/button';
import { COLLECTION_CATEGORY_MAP } from '@/constants/categories';
import type { CollectionCategory, CollectionWithCards } from '@/types/collection.types';
import {
  Edit3,
  GitFork,
  Globe,
  Heart,
  Loader2,
  Lock,
  Play,
  Trash2,
} from 'lucide-react';
import React from 'react';

interface CollectionDetailBannerProps {
  collection: CollectionWithCards;
  isForking: boolean;
  onStudy: () => void;
  onFork: () => void;
  onToggleLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CollectionDetailBanner({
  collection,
  isForking,
  onStudy,
  onFork,
  onToggleLike,
  onEdit,
  onDelete,
}: CollectionDetailBannerProps) {
  const categoryKey = (collection.category || 'other') as CollectionCategory;
  const catInfo = COLLECTION_CATEGORY_MAP[categoryKey] || COLLECTION_CATEGORY_MAP.other;
  const cards = collection.cards || [];

  return (
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

            {Array.isArray(collection.tags) &&
              collection.tags.map((t: string, i: number) => (
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
              <span>
                Tác giả: <strong className="text-text-primary">{collection.creator.display_name || 'Người dùng Vocab'}</strong>
              </span>
            )}
            <span>•</span>
            <span>
              <strong className="text-text-primary">{cards.length}</strong> từ vựng
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={onToggleLike}
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
              onClick={onStudy}
              className="gap-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-xs shadow-brand/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ôn tập bộ này</span>
            </Button>
          )}

          {!collection.is_owner ? (
            <Button
              onClick={onFork}
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
                onClick={onEdit}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-text-secondary hover:text-text-primary"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa bộ</span>
              </Button>
              <Button
                onClick={onDelete}
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
  );
}
