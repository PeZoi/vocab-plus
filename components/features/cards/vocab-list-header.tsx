'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { BookOpen, LayoutGrid, List, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';

interface VocabListHeaderProps {
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function VocabListHeader({
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: VocabListHeaderProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top row: Title and Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Kho từ vựng cá nhân
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand/15 text-brand border border-brand/30">
                {filteredCount !== undefined && filteredCount !== totalCount
                  ? `${filteredCount}/${totalCount} từ`
                  : `${totalCount} từ`}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Quản lý, tìm kiếm, lọc theo cấp độ CEFR và theo dõi tiến độ ghi nhớ
            </p>
          </div>
        </div>

        <Link href={ROUTES.APP.ADD}>
          <Button variant="primary" size="default" className="gap-1.5 w-full sm:w-auto shadow-xs">
            <Plus className="w-4 h-4" />
            <span>Thêm từ vựng mới</span>
          </Button>
        </Link>
      </div>

      {/* Second row: Search bar and View mode toggle */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm theo từ tiếng Anh, nghĩa tiếng Việt, câu ví dụ..."
            className="pl-9 pr-8 text-xs sm:text-sm h-10 w-full bg-surface/80 border-border/80"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-0.5 rounded-full transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-surface border border-border rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-brand text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="Dạng lưới thẻ (Grid view)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              viewMode === 'table'
                ? 'bg-brand text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )}
            title="Dạng danh sách bảng (Table view)"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
