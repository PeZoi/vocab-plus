'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, CheckCircle2, Search, ListFilter } from 'lucide-react';
import { formatTimestamp } from '@/utils/youtube';
import type { TimedSegment } from '@/types/listening.types';

interface TranscriptSyncSidebarProps {
  segments: TimedSegment[];
  currentSegmentIndex: number;
  completedSegmentIds: Set<string>;
  onSelectSegment: (index: number) => void;
  onTextSelection?: (contextSentence?: string) => void;
}

export function TranscriptSyncSidebar({
  segments,
  currentSegmentIndex,
  completedSegmentIds,
  onSelectSegment,
  onTextSelection,
}: TranscriptSyncSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const activeItemRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Tự động cuộn đến câu đang phát khi chuyển câu
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentSegmentIndex]);

  const filteredSegments = segments.filter((s) =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full rounded-2xl bg-surface border border-border/70 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-border/60 space-y-2.5 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-4 h-4 text-brand" />
            <h3 className="text-xs sm:text-sm font-bold text-text-primary">
              Nội Dung Podcast ({segments.length} câu)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {completedSegmentIds.size} / {segments.length} đã xong
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu trong podcast..."
            className="w-full h-8 pl-8 pr-3 rounded-xl bg-base border border-border text-xs text-text-primary placeholder:text-text-secondary/50 outline-hidden focus:border-brand transition-colors"
          />
        </div>
      </div>

      {/* Segments Scrollable List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-2 max-h-[500px] lg:max-h-[620px]"
      >
        {filteredSegments.length === 0 ? (
          <p className="text-center text-xs text-text-secondary py-8">
            Không tìm thấy câu phù hợp với từ khóa.
          </p>
        ) : (
          filteredSegments.map((segment) => {
            const originalIndex = segments.findIndex((s) => s.id === segment.id);
            const isActive = originalIndex === currentSegmentIndex;
            const isCompleted = completedSegmentIds.has(segment.id);

            return (
              <div
                key={segment.id}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSelectSegment(originalIndex)}
                onMouseUp={() => onTextSelection?.(segment.text)}
                data-sentence={segment.text}
                className={`group p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col gap-1.5 select-text ${
                  isActive
                    ? 'bg-brand/10 border-brand/50 shadow-sm shadow-brand/5'
                    : 'bg-base/60 border-border/60 hover:bg-surface-hover hover:border-border'
                }`}
              >
                {/* Meta row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-brand text-white'
                          : 'bg-surface border border-border text-text-secondary'
                      }`}
                    >
                      {formatTimestamp(segment.start)}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-brand uppercase tracking-wider animate-pulse">
                        <Volume2 className="w-3 h-3" />
                        <span>Đang làm</span>
                      </span>
                    )}
                  </div>

                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đạt</span>
                    </span>
                  )}
                </div>

                {/* Sentence text */}
                <p
                  className={`text-xs leading-relaxed line-clamp-3 ${
                    isActive
                      ? 'text-text-primary font-semibold'
                      : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                >
                  {segment.text}
                </p>

                {/* Vietnamese meaning preview if available */}
                {segment.vietnameseTranslation && (
                  <p className="text-[11px] text-text-secondary/70 italic line-clamp-2">
                    {segment.vietnameseTranslation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
