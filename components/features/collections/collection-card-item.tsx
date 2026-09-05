'use client';

import { Button } from '@/components/ui/button';
import { COLLECTION_CATEGORY_MAP } from '@/constants/categories';
import { ROUTES } from '@/constants/routes';
import type { Collection } from '@/types/collection.types';
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  Briefcase,
  Compass,
  Edit3,
  Folder,
  GitFork,
  Globe,
  GraduationCap,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  MoreVertical,
  Play,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  ielts: GraduationCap,
  toeic: Briefcase,
  toefl: BookMarked,
  daily_communication: MessageCircle,
  business: TrendingUp,
  academic: Award,
  travel: Compass,
  slang_idioms: Sparkles,
  other: Folder,
};

interface CollectionCardItemProps {
  collection: Collection;
  onFork?: (id: string) => void;
  onToggleLike?: (id: string) => void;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  isForking?: boolean;
}

export function CollectionCardItem({
  collection,
  onFork,
  onToggleLike,
  onEdit,
  onDelete,
  isForking = false,
}: CollectionCardItemProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = React.useState(false);

  const catInfo = COLLECTION_CATEGORY_MAP[collection.category] || COLLECTION_CATEGORY_MAP.other;
  const CategoryIcon = CATEGORY_ICONS[collection.category] || Folder;

  const handleStudy = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`${ROUTES.APP.REVIEW}?collection_id=${collection.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-surface/85 border border-border/70 hover:border-brand/40 shadow-xs hover:shadow-md transition-all overflow-hidden"
    >
      {/* Top Banner Gradient subtle accent */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${catInfo.gradient}`}
      />

      <div className="space-y-3.5">
        {/* Header Row: Category Badge & Privacy & Menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${catInfo.badgeBg} ${catInfo.badgeText} ${catInfo.badgeBorder}`}
            >
              <CategoryIcon className="w-3 h-3" />
              <span>{catInfo.label}</span>
            </span>

            {collection.is_public ? (
              <span
                title="Công khai trên cộng đồng"
                className="inline-flex items-center gap-1 text-[10px] text-text-secondary bg-base/80 px-2 py-0.5 rounded-full border border-border/60"
              >
                <Globe className="w-3 h-3 text-sky-400" />
                <span>Công khai</span>
              </span>
            ) : (
              <span
                title="Chỉ mình bạn xem được"
                className="inline-flex items-center gap-1 text-[10px] text-text-secondary bg-base/80 px-2 py-0.5 rounded-full border border-border/60"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Riêng tư</span>
              </span>
            )}
          </div>

          {/* Action Menu (Owner only) */}
          {collection.is_owner && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className="w-7 h-7 rounded-lg hover:bg-surface-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-50 w-36 py-1 bg-surface border border-border/80 rounded-xl shadow-xl space-y-0.5">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onEdit(collection);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-left text-text-primary hover:bg-surface-hover flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(false);
                          onDelete(collection);
                        }}
                        className="w-full px-3 py-1.5 text-xs text-left text-danger hover:bg-danger/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bộ từ</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <Link
            href={ROUTES.APP.COLLECTION_DETAIL(collection.id)}
            className="block font-semibold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1"
          >
            {collection.title}
          </Link>
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed min-h-[32px]">
            {collection.description || 'Chưa có mô tả chi tiết cho bộ sưu tập này.'}
          </p>
        </div>

        {/* Tags */}
        {collection.tags && collection.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {collection.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-base text-text-secondary border border-border/60"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
            {collection.tags.length > 3 && (
              <span className="text-[10px] text-text-secondary">
                +{collection.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Details & Actions */}
      <div className="pt-4 mt-3 border-t border-border/60 space-y-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          {/* Creator info or word count */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand" />
            <span className="font-semibold text-text-primary">
              {collection.card_count ?? 0}
            </span>
            <span>từ vựng</span>
          </div>

          {/* Likes & Forks Stats */}
          <div className="flex items-center gap-3">
            {/* Like button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike?.(collection.id);
              }}
              className={`flex items-center gap-1 transition-colors hover:text-rose-400 ${
                collection.is_liked ? 'text-rose-400 font-semibold' : ''
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${collection.is_liked ? 'fill-rose-400' : ''}`}
              />
              <span className="text-[11px] font-mono">{collection.likes_count}</span>
            </button>

            {/* Fork stat */}
            <div
              title="Số lượt người dùng khác đã clone"
              className="flex items-center gap-1 text-text-secondary"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">{collection.fork_count}</span>
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          {/* Custom Study Button (available if cards > 0) */}
          {(collection.card_count || 0) > 0 ? (
            <Button
              onClick={handleStudy}
              size="sm"
              className="flex-1 gap-1.5 text-xs h-8 bg-brand hover:bg-brand-hover text-white font-medium"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Ôn tập bộ này</span>
            </Button>
          ) : (
            <Button
              disabled
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-xs h-8 opacity-60 cursor-not-allowed"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Chưa có từ</span>
            </Button>
          )}

          {/* 1-Click Fork Button (if not owner) */}
          {!collection.is_owner ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onFork?.(collection.id);
              }}
              disabled={isForking}
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs h-8 border-brand/40 text-brand hover:bg-brand/10"
            >
              {isForking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <GitFork className="w-3.5 h-3.5" />
              )}
              <span>Clone</span>
            </Button>
          ) : (
            <Link href={ROUTES.APP.COLLECTION_DETAIL(collection.id)}>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs h-8 text-text-secondary hover:text-text-primary"
              >
                <span>Xem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
