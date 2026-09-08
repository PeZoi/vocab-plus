'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useImageSearch } from '@/hooks/features/images/use-image-search';
import { cn } from '@/lib/utils';
import type { CuratedPhotoItem } from '@/types/image.types';
import { Check, ExternalLink, Image as ImageIcon, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';

interface ImageSelectorProps {
  defaultQuery?: string;
  selectedImageUrl?: string | null;
  onSelectImage: (imageUrl: string | null) => void;
  className?: string;
}

export function ImageSelector({
  defaultQuery = '',
  selectedImageUrl,
  onSelectImage,
  className,
}: ImageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [activeQuery, setActiveQuery] = useState(defaultQuery);
  const [prevDefaultQuery, setPrevDefaultQuery] = useState(defaultQuery);

  // Cập nhật khi defaultQuery thay đổi từ bên ngoài (ví dụ sau khi AI phân tích xong)
  if (defaultQuery !== prevDefaultQuery) {
    setPrevDefaultQuery(defaultQuery);
    setSearchQuery(defaultQuery);
    setActiveQuery(defaultQuery);
  }

  const { data, isLoading, isError, refetch } = useImageSearch(activeQuery, {
    enabled: isOpen && !!activeQuery,
    perPage: 8,
  });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery.trim());
    }
  };

  const photos = data?.photos || [];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header & Selected Preview Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-brand" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Ảnh minh họa liên tưởng (Dual-Coding)
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-xs gap-1.5 h-8 border-border/80 hover:border-brand/50 hover:bg-brand/10 hover:text-brand"
        >
          {isOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Thu gọn</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5 text-brand" />
              <span>{selectedImageUrl ? 'Đổi ảnh Pexels' : 'Tìm ảnh Pexels'}</span>
            </>
          )}
        </Button>
      </div>

      {/* Selected Image Banner if any */}
      {selectedImageUrl && !isOpen && (
        <div className="relative group rounded-xl overflow-hidden border border-border/70 bg-surface/70 flex items-center gap-3 p-2.5">
          <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-base border border-border/60">
            <Image
              src={selectedImageUrl}
              alt="Ảnh minh họa đã chọn"
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">
              Đã gán ảnh minh họa cho thẻ
            </p>
            <p className="text-[11px] text-text-secondary truncate mt-0.5">
              Hình ảnh giúp kích hoạt cơ chế ghi nhớ kép trực quan
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectImage(null)}
            className="h-8 w-8 p-0 text-text-secondary hover:text-danger hover:bg-danger/10"
            title="Xóa ảnh"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Collapsible Image Picker Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border/80 bg-surface/90 p-3.5 sm:p-4 space-y-3.5 overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSearch();
                    }
                  }}
                  placeholder="Tìm từ khóa ảnh khác (vd: forest, reading, success)..."
                  className="pl-8 text-xs h-9 bg-base/60"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="surface"
                onClick={() => handleSearch()}
                disabled={isLoading || !searchQuery.trim()}
                className="h-9 px-3 text-xs gap-1.5 shrink-0"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Tìm ảnh</span>
              </Button>
            </div>

            {/* Photos Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-secondary space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
                <span className="text-xs">Đang tìm ảnh chất lượng cao từ Pexels...</span>
              </div>
            ) : isError ? (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-xs text-danger flex items-center justify-between">
                <span>Không thể tải ảnh từ Pexels. Vui lòng thử lại.</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => refetch()}
                  className="h-7 text-xs gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Thử lại
                </Button>
              </div>
            ) : photos.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-secondary space-y-1">
                <p>Không tìm thấy ảnh nào cho từ khóa &ldquo;{activeQuery}&rdquo;.</p>
                <p className="text-[11px] text-text-secondary/70">
                  Hãy thử gõ từ khóa tiếng Anh chung hơn hoặc vật thể liên quan.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {photos.map((photo: CuratedPhotoItem) => {
                    const isSelected = selectedImageUrl === photo.medium_url;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => {
                          if (isSelected) {
                            onSelectImage(null);
                          } else {
                            onSelectImage(photo.medium_url);
                          }
                        }}
                        className={cn(
                          'group relative rounded-lg overflow-hidden border cursor-pointer aspect-video bg-base transition-all duration-200 select-none',
                          isSelected
                            ? 'border-brand ring-2 ring-brand/40 shadow-md shadow-brand/20'
                            : 'border-border/60 hover:border-text-secondary/60 hover:scale-[1.02]'
                        )}
                      >
                        <Image
                          src={photo.thumbnail_url || photo.medium_url}
                          alt={photo.alt}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover"
                          unoptimized
                        />

                        {/* Selected overlay */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand/30 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        )}

                        {/* Photographer credit badge */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-[9px] text-white/90">
                          <span className="truncate max-w-[85%]">{photo.photographer}</span>
                          <a
                            href={photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white/80 hover:text-white shrink-0"
                            title="Xem trên Pexels"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 text-[10px] text-text-secondary/70 border-t border-border/40">
                  <span>Ảnh cung cấp miễn phí bởi Pexels API</span>
                  {selectedImageUrl && (
                    <button
                      type="button"
                      onClick={() => onSelectImage(null)}
                      className="text-text-secondary hover:text-danger hover:underline"
                    >
                      Bỏ chọn ảnh
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
