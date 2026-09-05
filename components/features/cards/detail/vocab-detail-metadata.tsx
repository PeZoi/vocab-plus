import { Badge } from '@/components/ui/badge';
import type { CardWithProgress } from '@/types/card.types';
import { formatDateTime } from '@/utils/datetime';
import { ShieldCheck } from 'lucide-react';
import React from 'react';

interface VocabDetailMetadataProps {
  card: CardWithProgress;
}

export function VocabDetailMetadata({ card }: VocabDetailMetadataProps) {
  return (
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
  );
}
