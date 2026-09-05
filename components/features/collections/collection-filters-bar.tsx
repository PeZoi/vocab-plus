'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COLLECTION_CATEGORIES } from '@/constants/categories';
import type { CollectionCategory } from '@/types/collection.types';
import { RotateCcw, Search } from 'lucide-react';

interface CollectionFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CollectionCategory | 'all';
  onCategoryChange: (cat: CollectionCategory | 'all') => void;
  sortBy: 'popular' | 'newest' | 'alpha';
  onSortChange: (sort: 'popular' | 'newest' | 'alpha') => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export function CollectionFiltersBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onResetFilters,
  isFiltered,
}: CollectionFiltersBarProps) {
  return (
    <div className="space-y-3">
      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bộ từ vựng theo tên hoặc mô tả..."
            className="pl-9 bg-surface border-border/80 text-xs h-9"
          />
        </div>

        {/* Sort & Reset */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(val: any) => onSortChange(val)}>
            <SelectTrigger className="w-40 h-9 text-xs bg-surface border-border/80">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Phổ biến nhất</SelectItem>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="alpha">Tên A - Z</SelectItem>
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-9 px-2.5 text-xs text-text-secondary hover:text-text-primary gap-1"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt lại</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills (Horizontal scrollable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-brand text-white border-brand shadow-xs shadow-brand/20'
              : 'bg-surface/80 hover:bg-surface text-text-secondary border-border/70 hover:text-text-primary'
          }`}
        >
          Tất cả
        </button>

        {COLLECTION_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-brand text-white border-brand shadow-xs shadow-brand/20'
                  : 'bg-surface/80 hover:bg-surface text-text-secondary border-border/70 hover:text-text-primary'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
