'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { CardWithProgress } from '@/types/card.types';
import {
  ArrowLeft,
  ChevronRight,
  Edit2,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface VocabDetailHeaderProps {
  card: CardWithProgress;
  onOpenEdit: () => void;
  onOpenDelete: () => void;
  onOpenAddToCollection: () => void;
}

export function VocabDetailHeader({
  card,
  onOpenEdit,
  onOpenDelete,
  onOpenAddToCollection,
}: VocabDetailHeaderProps) {
  const router = useRouter();

  return (
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
          onClick={onOpenAddToCollection}
          className="gap-1.5 text-xs text-slate-300 border-border/70 hover:text-white hover:border-brand/40"
        >
          <FolderPlus className="w-3.5 h-3.5 text-brand" />
          <span className="hidden sm:inline">Bộ sưu tập</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenEdit}
          className="gap-1.5 text-xs text-slate-300 border-border/70 hover:text-white hover:border-brand/40"
        >
          <Edit2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Chỉnh sửa</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenDelete}
          className="p-2 text-slate-400 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
          title="Xóa thẻ từ vựng"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
