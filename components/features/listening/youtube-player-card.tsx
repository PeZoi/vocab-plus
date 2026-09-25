'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Gauge,
  Volume2,
  Headphones,
  Video,
  Radio,
} from 'lucide-react';
import { formatTimestamp } from '@/utils/youtube';
import type { TimedSegment } from '@/types/listening.types';

interface YouTubePlayerCardProps {
  containerId: string;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  currentSegment: TimedSegment | null;
  playbackRate: number;
  isLooping: boolean;
  autoPauseAtEnd: boolean;
  isAudioFallback?: boolean;
  onToggleAudioFallback?: () => void;
  thumbnailUrl?: string;
  videoTitle?: string;
  channelName?: string;
  onPlay: () => void;
  onPause: () => void;
  onReplaySegment: () => void;
  onPrevSegment: () => void;
  onNextSegment: () => void;
  onToggleLoop: () => void;
  onToggleAutoPause: () => void;
  onChangeRate: (rate: number) => void;
}

const SPEED_OPTIONS = [0.75, 0.85, 1.0, 1.25];

export function YouTubePlayerCard({
  containerId,
  isReady,
  isPlaying,
  currentTime,
  currentSegment,
  playbackRate,
  isLooping,
  autoPauseAtEnd,
  isAudioFallback = false,
  onToggleAudioFallback,
  thumbnailUrl,
  videoTitle,
  channelName,
  onPlay,
  onPause,
  onReplaySegment,
  onPrevSegment,
  onNextSegment,
  onToggleLoop,
  onToggleAutoPause,
  onChangeRate,
}: YouTubePlayerCardProps) {
  // Tính % tiến trình trong phạm vi câu hiện tại
  let segmentProgress = 0;
  if (currentSegment && currentSegment.end > currentSegment.start) {
    const elapsed = Math.max(0, currentTime - currentSegment.start);
    const duration = currentSegment.end - currentSegment.start;
    segmentProgress = Math.min(100, Math.max(0, (elapsed / duration) * 100));
  }

  return (
    <div className="rounded-2xl bg-surface border border-border/70 overflow-hidden shadow-xs flex flex-col">
      {/* 16:9 Player Container */}
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        {/* Hidden YouTube container when in Audio fallback to preserve iframe instance */}
        <div id={containerId} className={`w-full h-full ${isAudioFallback ? 'hidden' : ''}`} />

        {/* Audio Podcast Player View khi YouTube bị chặn nhúng hoặc ở chế độ Audio */}
        {isAudioFallback && (
          <div className="absolute inset-0 bg-gradient-to-br from-base via-surface to-base overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Ambient blurred backdrop thumbnail */}
            {thumbnailUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-125"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />

            {/* Top Badge & Toggle */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/15 border border-brand/30 text-brand text-xs font-semibold shadow-xs backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
                <Headphones className="w-3.5 h-3.5" />
                <span>Audio Podcast (Đã vượt rào cản chặn nhúng)</span>
              </div>

              {onToggleAudioFallback && (
                <button
                  type="button"
                  onClick={onToggleAudioFallback}
                  className="px-2.5 py-1 rounded-lg bg-base/80 hover:bg-surface-hover border border-border/80 text-text-secondary hover:text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-md"
                  title="Chuyển về thử chế độ Video"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chế độ Video</span>
                </button>
              )}
            </div>

            {/* Center Content: Artwork + Waveform Visualizer */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="relative group">
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-brand/40 shadow-xl transition-all duration-300 ${
                    isPlaying ? 'scale-105 ring-4 ring-brand/20 shadow-brand/20' : 'opacity-85'
                  }`}
                >
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={videoTitle || 'Podcast Thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-base flex items-center justify-center">
                      <Radio className="w-10 h-10 text-brand animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Animated Sound Wave Indicator */}
                {isPlaying && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-1 px-2.5 py-1 rounded-full bg-base/95 border border-brand/40 shadow-lg">
                    <span className="w-1 h-3 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-4 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-2 bg-brand rounded-full animate-bounce [animation-delay:-0.45s]" />
                    <span className="w-1 h-5 bg-brand rounded-full animate-bounce" />
                    <span className="w-1 h-3 bg-brand rounded-full animate-bounce [animation-delay:-0.2s]" />
                  </div>
                )}
              </div>

              {/* Title & Channel */}
              <div className="max-w-md px-4 text-center">
                <h3 className="text-sm sm:text-base font-bold text-text-primary line-clamp-1">
                  {videoTitle || 'Đang phát Audio Podcast'}
                </h3>
                {channelName && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1 font-medium">
                    {channelName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!isReady && !isAudioFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-base/90 text-text-secondary">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              <span className="text-xs">Đang tải trình phát YouTube...</span>
            </div>
          </div>
        )}

        {/* Thanh tiến trình phân đoạn mỏng ở đáy video */}
        {currentSegment && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-10">
            <div
              className="h-full bg-brand transition-all duration-100 shadow-sm shadow-brand"
              style={{ width: `${segmentProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Thanh điều khiển nâng cao */}
      <div className="p-3 sm:p-4 space-y-3 bg-surface">
        {/* Hàng 1: Các nút điều hướng câu & lặp A-B */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Câu trước */}
            <button
              type="button"
              onClick={onPrevSegment}
              className="p-2 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
              title="Câu trước (Shift + Tab)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={isPlaying ? onPause : onPlay}
              className="h-9 px-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-brand/20 transition-all cursor-pointer"
              title="Phát / Dừng (Phím ` hoặc Space)"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Phát</span>
                </>
              )}
              <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-brand-hover/90 border border-white/20 text-[10px] font-mono font-bold text-white shadow-xs">
                `
              </kbd>
            </button>

            {/* Replay câu hiện tại */}
            <button
              type="button"
              onClick={onReplaySegment}
              className="h-9 px-3 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Nghe lại câu hiện tại (Phím Ctrl)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand" />
              <span>Nghe lại</span>
              <kbd className="hidden sm:inline-block px-1 py-0.5 rounded bg-surface border border-border text-[9px] font-mono text-text-secondary">
                Ctrl
              </kbd>
            </button>

            {/* Câu tiếp theo */}
            <button
              type="button"
              onClick={onNextSegment}
              className="p-2 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
              title="Câu kế tiếp"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Vòng lặp A-B & Tự động dừng */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleLoop}
              className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLooping
                  ? 'bg-brand/10 border-brand/40 text-brand shadow-xs'
                  : 'bg-base border-border text-text-secondary hover:text-text-primary'
              }`}
              title="Lặp lại câu cho tới khi gõ xong"
            >
              <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'animate-spin-slow text-brand' : ''}`} />
              <span className="hidden sm:inline">Lặp A-B:</span>
              <span>{isLooping ? 'BẬT' : 'TẮT'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleAutoPause}
              className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                autoPauseAtEnd
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-xs'
                  : 'bg-base border-border text-text-secondary hover:text-text-primary'
              }`}
              title="Tự dừng khi hết câu để gõ"
            >
              <span>Tự dừng: {autoPauseAtEnd ? 'BẬT' : 'TẮT'}</span>
            </button>
          </div>
        </div>

        {/* Hàng 2: Tốc độ phát & Timestamp câu & Chuyển đổi Audio/Video */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-brand" />
            <span className="font-semibold text-text-primary">Tốc độ:</span>
            <div className="inline-flex rounded-lg bg-base border border-border p-0.5">
              {SPEED_OPTIONS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onChangeRate(rate)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-colors ${
                    playbackRate === rate
                      ? 'bg-brand text-white font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Chuyển đổi thủ công giữa Video và Audio */}
            {onToggleAudioFallback && (
              <button
                type="button"
                onClick={onToggleAudioFallback}
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isAudioFallback
                    ? 'bg-brand/15 border-brand/40 text-brand'
                    : 'bg-base border-border text-text-secondary hover:text-text-primary'
                }`}
                title={isAudioFallback ? 'Chuyển sang chế độ Video YouTube' : 'Chuyển sang chế độ Audio Podcast'}
              >
                {isAudioFallback ? (
                  <>
                    <Headphones className="w-3 h-3 text-brand" />
                    <span>Audio Mode</span>
                  </>
                ) : (
                  <>
                    <Headphones className="w-3 h-3" />
                    <span className="hidden sm:inline">Nghe Audio</span>
                  </>
                )}
              </button>
            )}

            {currentSegment && (
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <Volume2 className="w-3.5 h-3.5 text-brand" />
                <span>
                  {formatTimestamp(currentTime)} / {formatTimestamp(currentSegment.end)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
