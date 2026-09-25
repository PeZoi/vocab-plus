'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Clock, Sparkles } from 'lucide-react';
import type { CuratedPodcast } from '@/types/listening.types';
import { CURATED_PODCASTS } from '@/constants/curated-podcasts';

interface CuratedPodcastShelfProps {
  onSelectPodcast: (podcast: CuratedPodcast) => void;
  activeYoutubeId?: string | null;
}

export function CuratedPodcastShelf({
  onSelectPodcast,
  activeYoutubeId,
}: CuratedPodcastShelfProps) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
            Tuyển Tập Podcast Được Đề Xuất
          </h2>
        </div>
        <span className="text-xs text-text-secondary">
          Phân loại theo chuẩn CEFR & chuẩn bị sẵn phụ đề chất lượng cao
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CURATED_PODCASTS.map((podcast) => {
          const isActive = activeYoutubeId === podcast.youtubeId;

          // Màu sắc CEFR badge
          const cefrColor =
            podcast.cefrLevel === 'A1' || podcast.cefrLevel === 'A2'
              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25'
              : podcast.cefrLevel === 'B1' || podcast.cefrLevel === 'B2'
              ? 'bg-sky-500/15 text-sky-500 border-sky-500/25'
              : 'bg-purple-500/15 text-purple-400 border-purple-500/25';

          return (
            <div
              key={podcast.id}
              onClick={() => onSelectPodcast(podcast)}
              className={`group relative rounded-2xl bg-surface border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'border-brand ring-2 ring-brand/40 shadow-md shadow-brand/10'
                  : 'border-border/70 hover:border-brand/40 hover:shadow-md'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <Image
                  src={podcast.thumbnailUrl}
                  alt={podcast.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badges on Thumbnail */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border backdrop-blur-xs ${cefrColor}`}
                  >
                    {podcast.cefrLevel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white/90 border border-white/10 backdrop-blur-xs">
                    {podcast.topic}
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/90">
                  <Clock className="w-3 h-3" />
                  <span>{podcast.duration}</span>
                </div>

                {/* Center Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-text-secondary truncate">
                    {podcast.channelName}
                  </p>
                  <h3 className="text-xs sm:text-sm font-bold text-text-primary line-clamp-2 leading-snug group-hover:text-brand transition-colors mt-0.5">
                    {podcast.title}
                  </h3>
                </div>

                <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                  {podcast.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
