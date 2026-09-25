'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Khai báo các interface tối thiểu cho YouTube Iframe API
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setPlaybackRate: (suggestedRate: number) => void;
  getPlaybackRate: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      videoId?: string;
      height?: string | number;
      width?: string | number;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number; target: YTPlayer }) => void;
        onError?: (event: { data: number }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface UseYouTubePlayerProps {
  containerId: string;
  videoId: string | null;
  isLooping?: boolean;
  autoPauseAtEnd?: boolean;
  isCurrentSegmentCompleted?: boolean;
  onSegmentEnd?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onFallbackTriggered?: (errorCode: number) => void;
}

export function useYouTubePlayer({
  containerId,
  videoId,
  isLooping = false,
  autoPauseAtEnd = false,
  isCurrentSegmentCompleted = false,
  onSegmentEnd,
  onTimeUpdate,
  onFallbackTriggered,
}: UseYouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isAudioFallback, setIsAudioFallback] = useState(false);
  const [blockedErrorCode, setBlockedErrorCode] = useState<number | null>(null);
  const [isEmbedBlockedPromptOpen, setIsEmbedBlockedPromptOpen] = useState(false);

  // Lưu trữ ranh giới phân đoạn đang phát [start, end]
  const activeSegmentRef = useRef<{ start: number; end: number } | null>(null);
  const onSegmentEndRef = useRef(onSegmentEnd);
  onSegmentEndRef.current = onSegmentEnd;

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  const onFallbackTriggeredRef = useRef(onFallbackTriggered);
  onFallbackTriggeredRef.current = onFallbackTriggered;

  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;

  const autoPauseAtEndRef = useRef(autoPauseAtEnd);
  autoPauseAtEndRef.current = autoPauseAtEnd;

  const isCompletedRef = useRef(isCurrentSegmentCompleted);
  isCompletedRef.current = isCurrentSegmentCompleted;

  // 1. Tải YouTube IFrame API Script an toàn một lần duy nhất
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.YT) {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }
    }
  }, []);

  // 2. Khởi tạo YT.Player khi script sẵn sàng và có videoId
  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return false;

      const containerEl = document.getElementById(containerId);
      if (!containerEl) return false;

      setIsReady(false);

      // Hủy player cũ nếu có
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
      playerRef.current = null;

      try {
        const newPlayer = new window.YT.Player(containerId, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            controls: 1,
            iv_load_policy: 3,
          },
          events: {
            onReady: (event: { target: YTPlayer }) => {
              if (!isMounted) return;
              // Luôn gán instance chính thức từ event.target
              playerRef.current = event.target || newPlayer;
              setIsReady(true);
            },
            onStateChange: (event: { data: number; target: YTPlayer }) => {
              if (!isMounted) return;
              if (event.target) {
                playerRef.current = event.target;
              }
              const state = event.data;
              if (state === 1) {
                // PLAYING
                setIsPlaying(true);
              } else if (state === 2 || state === 0) {
                // PAUSED hoặc ENDED
                setIsPlaying(false);
              }
            },
            onError: (event: { data: number }) => {
              if (!isMounted) return;
              setIsPlaying(false);
              const errorCode = event.data;
              console.warn(`[YouTubePlayer] Gặp lỗi mã ${errorCode}.`);
              if (errorCode === 101 || errorCode === 150) {
                // Video bị cấm nhúng ngoài YouTube -> Kích hoạt popup xác nhận từ người dùng
                setBlockedErrorCode(errorCode);
                setIsEmbedBlockedPromptOpen(true);
              }
              onFallbackTriggeredRef.current?.(errorCode);
            },
          },
        });

        playerRef.current = newPlayer;
        return true;
      } catch {
        return false;
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        if (isMounted) initPlayer();
      };

      pollInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(pollInterval);
          if (isMounted) initPlayer();
        }
      }, 200);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
      playerRef.current = null;
      setIsReady(false);
      setIsPlaying(false);
    };
  }, [containerId, videoId]);

  // 3. Quản lý Audio Fallback Player khi YouTube bị chặn nhúng hoặc bật Audio Mode
  useEffect(() => {
    if (!isAudioFallback || !videoId) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = `/api/listening/stream?videoId=${videoId}`;
    audio.playbackRate = playbackRate;

    const handleCanPlay = () => setIsReady(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onSegmentEndRef.current?.();
    };

    const handleTimeUpdate = () => {
      const curr = audio.currentTime;
      if (typeof curr === 'number' && !isNaN(curr)) {
        setCurrentTime((prev) => (Math.abs(curr - prev) > 0.05 ? curr : prev));
        onTimeUpdateRef.current?.(curr);

        const seg = activeSegmentRef.current;
        if (seg && curr >= seg.end) {
          const loop = isLoopingRef.current;
          const autoPause = autoPauseAtEndRef.current;
          const isCompleted = isCompletedRef.current;

          if (isCompleted) {
            activeSegmentRef.current = null;
            onSegmentEndRef.current?.();
          } else if (loop) {
            audio.currentTime = seg.start;
            audio.play().catch(() => {});
          } else if (autoPause) {
            audio.pause();
            activeSegmentRef.current = null;
            onSegmentEndRef.current?.();
          } else {
            activeSegmentRef.current = null;
            onSegmentEndRef.current?.();
          }
        }
      }
    };

    audio.addEventListener('loadedmetadata', handleCanPlay);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('loadedmetadata', handleCanPlay);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.pause();
    };
  }, [isAudioFallback, videoId]);

  // 4. Theo dõi thời gian thực & kiểm soát vòng lặp A-B theo segment (Chỉ chạy timer khi đang Play trên YouTube)
  useEffect(() => {
    if (!isPlaying || !isReady || isAudioFallback) return;

    const timer = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== 'function') return;

      try {
        const curr = p.getCurrentTime();
        if (typeof curr === 'number' && !isNaN(curr)) {
          setCurrentTime((prev) => (Math.abs(curr - prev) > 0.05 ? curr : prev));
          onTimeUpdateRef.current?.(curr);

          const seg = activeSegmentRef.current;
          if (seg && curr >= seg.end) {
            const loop = isLoopingRef.current;
            const autoPause = autoPauseAtEndRef.current;
            const isCompleted = isCompletedRef.current;

            // Nếu câu ĐÃ HOÀN THÀNH:
            // Tự động chuyển tiếp câu tiếp theo, không lặp lại kẹt câu
            if (isCompleted) {
              activeSegmentRef.current = null;
              onSegmentEndRef.current?.();
            }
            // Nếu câu CHƯA HOÀN THÀNH:
            else if (loop && typeof p.seekTo === 'function' && typeof p.playVideo === 'function') {
              // 1. Chế độ lặp lại A-B
              p.seekTo(seg.start, true);
              p.playVideo();
            } else if (autoPause && typeof p.pauseVideo === 'function') {
              // 2. Chế độ tự dừng ở cuối câu
              p.pauseVideo();
              activeSegmentRef.current = null;
              onSegmentEndRef.current?.();
            } else {
              // 3. Cả 2 nút đều TẮT: chạy liên tục cho tới khi hết video, timeline realtime
              activeSegmentRef.current = null;
              onSegmentEndRef.current?.();
            }
          }
        }
      } catch {
        // Player có thể đang chuyển trạng thái
      }
    }, 150);

    return () => clearInterval(timer);
  }, [isPlaying, isReady, isAudioFallback]);

  // Các hàm điều khiển Player thích ứng với cả YouTube IFrame lẫn Audio Stream
  const play = useCallback(() => {
    if (isAudioFallback) {
      audioRef.current?.play().catch(() => {});
      return;
    }
    const p = playerRef.current;
    if (p && typeof p.playVideo === 'function') {
      try {
        p.playVideo();
      } catch {
        // ignore
      }
    }
  }, [isAudioFallback]);

  const pause = useCallback(() => {
    if (isAudioFallback) {
      audioRef.current?.pause();
      return;
    }
    const p = playerRef.current;
    if (p && typeof p.pauseVideo === 'function') {
      try {
        p.pauseVideo();
      } catch {
        // ignore
      }
    }
  }, [isAudioFallback]);

  const seekTo = useCallback((seconds: number) => {
    if (isAudioFallback) {
      if (audioRef.current) {
        audioRef.current.currentTime = seconds;
      }
      return;
    }
    const p = playerRef.current;
    if (p && typeof p.seekTo === 'function') {
      try {
        p.seekTo(seconds, true);
      } catch {
        // ignore
      }
    }
  }, [isAudioFallback]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (isAudioFallback) {
      if (audioRef.current) {
        audioRef.current.playbackRate = rate;
      }
      return;
    }
    const p = playerRef.current;
    if (p && typeof p.setPlaybackRate === 'function') {
      try {
        p.setPlaybackRate(rate);
      } catch {
        // ignore
      }
    }
  }, [isAudioFallback]);

  const playSegment = useCallback((start: number, end: number) => {
    activeSegmentRef.current = { start, end };
    if (isAudioFallback) {
      if (audioRef.current) {
        audioRef.current.currentTime = start;
        audioRef.current.play().catch(() => {});
      }
      return;
    }
    const p = playerRef.current;
    if (p && typeof p.seekTo === 'function' && typeof p.playVideo === 'function') {
      try {
        p.seekTo(start, true);
        p.playVideo();
      } catch {
        // ignore
      }
    }
  }, [isAudioFallback]);

  const setActiveSegmentBounds = useCallback((start: number, end: number) => {
    activeSegmentRef.current = { start, end };
  }, []);

  const toggleAudioFallback = useCallback(() => {
    setIsAudioFallback((prev) => {
      const next = !prev;
      if (next) {
        playerRef.current?.pauseVideo();
      } else {
        audioRef.current?.pause();
      }
      return next;
    });
  }, []);

  const confirmSwitchToAudio = useCallback(() => {
    setIsEmbedBlockedPromptOpen(false);
    setIsAudioFallback(true);
    // Tự động phát audio sau khi chuyển đổi
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }, 150);
  }, []);

  const dismissEmbedBlockedPrompt = useCallback(() => {
    setIsEmbedBlockedPromptOpen(false);
  }, []);

  return {
    isReady,
    isPlaying,
    currentTime,
    playbackRate,
    isAudioFallback,
    toggleAudioFallback,
    isEmbedBlockedPromptOpen,
    blockedErrorCode,
    confirmSwitchToAudio,
    dismissEmbedBlockedPrompt,
    play,
    pause,
    seekTo,
    setPlaybackRate,
    playSegment,
    setActiveSegmentBounds,
  };
}
