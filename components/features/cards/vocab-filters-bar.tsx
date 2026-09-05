'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CEFR_FILTER_OPTIONS } from '@/constants/cefr';
import type { CEFRLevel, FSRSState, VocabSortOption } from '@/types/card.types';
import { Filter, RotateCcw } from 'lucide-react';

interface VocabFiltersBarProps {
  availableTags: string[];
  cefrLevel: CEFRLevel | 'all';
  onCefrChange: (val: CEFRLevel | 'all') => void;
  selectedTag: string | 'all';
  onTagChange: (val: string | 'all') => void;
  fsrsState: FSRSState;
  onFsrsStateChange: (val: FSRSState) => void;
  sortBy: VocabSortOption;
  onSortChange: (val: VocabSortOption) => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

const FSRS_STATE_OPTIONS: { value: FSRSState; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'review', label: 'Cần ôn tập (Due/Review)' },
  { value: 'learning', label: 'Đang học (Learning)' },
  { value: 'new', label: 'Thẻ mới (New)' },
  { value: 'leech', label: 'Từ khó (Leech)' },
];

const SORT_OPTIONS: { value: VocabSortOption; label: string }[] = [
  { value: 'created_desc', label: 'Mới thêm gần đây' },
  { value: 'created_asc', label: 'Thêm cũ nhất' },
  { value: 'due_asc', label: 'Hạn ôn gần nhất' },
  { value: 'alpha_asc', label: 'Bảng chữ cái A → Z' },
  { value: 'alpha_desc', label: 'Bảng chữ cái Z → A' },
  { value: 'difficulty_desc', label: 'Độ khó cao nhất' },
  { value: 'stability_desc', label: 'Độ nhớ lâu nhất' },
];

export function VocabFiltersBar({
  availableTags,
  cefrLevel,
  onCefrChange,
  selectedTag,
  onTagChange,
  fsrsState,
  onFsrsStateChange,
  sortBy,
  onSortChange,
  onResetFilters,
  isFiltered,
}: VocabFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-surface/50 border border-border/60">
      <div className="flex items-center gap-1.5 text-xs text-text-secondary px-1 shrink-0">
        <Filter className="w-3.5 h-3.5 text-brand" />
        <span className="font-medium hidden sm:inline">Bộ lọc:</span>
      </div>

      {/* CEFR Level Filter */}
      <div className="w-[140px] sm:w-[150px]">
        <Select
          value={cefrLevel}
          onValueChange={(val) => onCefrChange(val as CEFRLevel | 'all')}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-base/60">
            <SelectValue placeholder="Cấp độ CEFR" />
          </SelectTrigger>
          <SelectContent>
            {CEFR_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      <div className="w-[140px] sm:w-[150px]">
        <Select
          value={selectedTag}
          onValueChange={onTagChange}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-base/60">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* FSRS State Filter */}
      <div className="w-[140px] sm:w-[160px]">
        <Select
          value={fsrsState}
          onValueChange={(val) => onFsrsStateChange(val as FSRSState)}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-base/60">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {FSRS_STATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="w-[140px] sm:w-[165px] ml-auto">
        <Select
          value={sortBy}
          onValueChange={(val) => onSortChange(val as VocabSortOption)}
        >
          <SelectTrigger className="w-full h-8 text-xs bg-base/60">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Filter Button */}
      {isFiltered && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-8 px-2 text-xs text-text-secondary hover:text-text-primary gap-1"
          title="Đặt lại toàn bộ bộ lọc"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Đặt lại</span>
        </Button>
      )}
    </div>
  );
}
