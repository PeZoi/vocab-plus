'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Headphones,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { ListeningHeroBanner } from '@/components/features/listening/listening-hero-banner';
import { ListeningEmptyGuide } from '@/components/features/listening/listening-empty-guide';
import { RecentListeningShelf } from '@/components/features/listening/recent-listening-shelf';
import { YouTubePlayerCard } from '@/components/features/listening/youtube-player-card';
import { DictationWorkspace } from '@/components/features/listening/dictation-workspace';
import { TranscriptSyncSidebar } from '@/components/features/listening/transcript-sync-sidebar';
import { ListeningSummaryModal } from '@/components/features/listening/listening-summary-modal';
import { ListeningVocabContextMenu } from '@/components/features/listening/listening-vocab-context-menu';
import { WordQuickPopover } from '@/components/features/import/word-quick-popover';
import { useYouTubePlayer } from '@/hooks/features/listening/use-youtube-player';
import { useListeningSession } from '@/hooks/features/listening/use-listening-session';
import { useListeningVocabSelection } from '@/hooks/features/listening/use-listening-vocab-selection';
import { listeningService } from '@/services/listening.service';
import { formatTimestamp } from '@/utils/youtube';
import type {
  ListeningDifficulty,
  TimedSegment,
  VideoMetadata,
  UserListeningProgressWithMeta,
} from '@/types/listening.types';

type ListeningViewMode = 'selection' | 'workspace';

export default function ListeningPage() {
  const [viewMode, setViewMode] = useState<ListeningViewMode>('selection');
  const [activeYoutubeId, setActiveYoutubeId] = useState<string>('');
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [segments, setSegments] = useState<TimedSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<ListeningDifficulty>('medium');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<UserListeningProgressWithMeta[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Tải danh sách lịch sử bài nghe đã học của user
  const loadUserHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const history = await listeningService.getUserHistory();
      setHistoryList(history);
    } catch {
      // ignore
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    listeningService
      .getUserHistory()
      .then((history) => {
        if (isMounted) setHistoryList(history);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Ref để gọi handlePlaySegment từ useListeningSession mà không lo TDZ
  const playSegmentHandlerRef = useRef<(start: number, end: number) => void>(() => {});
  const setActiveSegmentBoundsRef = useRef<(start: number, end: number) => void>(() => {});

  // 1. Hook điều phối bài tập Dictation
  const {
    currentIndex,
    currentSegment,
    totalSegments,
    isLooping,
    toggleLooping,
    autoPauseAtEnd,
    toggleAutoPause,
    showHint,
    setShowHint,
    showAnswer,
    setShowAnswer,
    completedSegmentIds,
    wordClozeItems,
    setWordAnswer,
    chunkClozeItem,
    chunkClozeState,
    setChunkAnswer,
    fullDictationText,
    setDictationAnswer,
    diffResult,
    checkCurrentAnswer,
    nextSegment,
    prevSegment,
    goToSegment,
  } = useListeningSession({
    youtubeId: activeYoutubeId,
    segments,
    difficulty,
    onPlaySegment: (start, end) => playSegmentHandlerRef.current(start, end),
  });

  // Hook bôi đen text để tra cứu & lưu từ vựng bằng AI context-aware (giống Story)
  const {
    textSelection,
    activeToken,
    activeContextSentence,
    handleTextSelection,
    handleOpenVocabPopover,
    handleCloseVocabPopover,
    getKnownCardInfo,
  } = useListeningVocabSelection({
    currentSegmentText: currentSegment?.text,
  });

  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  });

  // 2. Tìm câu trong podcast tương ứng với mốc thời gian hiện tại của video
  const findSegmentIndexAtTime = useCallback((time: number, segList: TimedSegment[]): number => {
    if (!segList || segList.length === 0) return -1;
    for (let i = 0; i < segList.length; i++) {
      const seg = segList[i];
      const nextSeg = segList[i + 1];
      if (!nextSeg) {
        if (time >= seg.start - 0.2) return i;
      } else {
        if (time >= seg.start - 0.2 && time < nextSeg.start) {
          return i;
        }
      }
    }
    return -1;
  }, []);

  // 3. Callback xử lý khi video đến cuối câu hiện tại
  const handleSegmentEnd = useCallback(() => {
    const isCurrentCompleted = currentSegment ? completedSegmentIds.has(currentSegment.id) : false;
    const isContinuousMode = !isLooping && !autoPauseAtEnd;

    // Nếu đã hoàn thành câu HOẶC đang ở chế độ phát liên tục:
    if (isCurrentCompleted || isContinuousMode) {
      if (currentIndexRef.current < segments.length - 1) {
        const nextIdx = currentIndexRef.current + 1;
        const nextSeg = segments[nextIdx];
        currentIndexRef.current = nextIdx;
        goToSegment(nextIdx);
        if (nextSeg) {
          setActiveSegmentBoundsRef.current(nextSeg.start, nextSeg.end);
        }
      }
    }
  }, [currentSegment, completedSegmentIds, isLooping, autoPauseAtEnd, segments, goToSegment]);

  // 4. Callback đồng bộ realtime timeline theo tiến trình video
  const handleTimeUpdate = useCallback(
    (time: number) => {
      if (viewMode !== 'workspace') return;

      const isContinuousMode = !isLooping && !autoPauseAtEnd;
      const isCurrentCompleted = currentSegment ? completedSegmentIds.has(currentSegment.id) : false;

      // Khi ở chế độ chạy liên tục HOẶC câu hiện tại đã hoàn thành:
      // Tự động chuyển câu theo thời gian thực của video
      if (isContinuousMode || isCurrentCompleted) {
        const matchedIdx = findSegmentIndexAtTime(time, segments);
        if (matchedIdx !== -1 && matchedIdx !== currentIndexRef.current) {
          currentIndexRef.current = matchedIdx;
          goToSegment(matchedIdx);
          const nextSeg = segments[matchedIdx];
          if (nextSeg) {
            setActiveSegmentBoundsRef.current(nextSeg.start, nextSeg.end);
          }
        }
      }
    },
    [viewMode, isLooping, autoPauseAtEnd, currentSegment, completedSegmentIds, findSegmentIndexAtTime, segments, goToSegment]
  );

  // 5. Hook YouTube Player
  const {
    isReady,
    isPlaying,
    currentTime,
    playbackRate,
    isAudioFallback,
    toggleAudioFallback,
    play,
    pause,
    seekTo,
    setPlaybackRate,
    playSegment,
    setActiveSegmentBounds,
    isEmbedBlockedPromptOpen,
    blockedErrorCode,
    confirmSwitchToAudio,
    dismissEmbedBlockedPrompt,
  } = useYouTubePlayer({
    containerId: 'youtube-listening-player',
    videoId: activeYoutubeId,
    isLooping,
    autoPauseAtEnd,
    isCurrentSegmentCompleted: currentSegment ? completedSegmentIds.has(currentSegment.id) : false,
    onSegmentEnd: handleSegmentEnd,
    onTimeUpdate: handleTimeUpdate,
  });

  useEffect(() => {
    setActiveSegmentBoundsRef.current = setActiveSegmentBounds;
    playSegmentHandlerRef.current = (start: number, end: number) => {
      // Nếu video đang phát và thời gian hiện tại đã nằm trong khoảng phân đoạn này,
      // chỉ cần cập nhật ranh giới phân đoạn mà không cần seekTo gây giật âm thanh
      if (isPlaying && currentTime >= start - 0.2 && currentTime <= end) {
        setActiveSegmentBounds(start, end);
        return;
      }
      playSegment(start, end);
    };
  });

  // Bắt đầu phát phân đoạn khi bấm nút Phát
  const handlePlay = useCallback(() => {
    if (currentSegment) {
      setActiveSegmentBounds(currentSegment.start, currentSegment.end);
    }
    play();
  }, [currentSegment, setActiveSegmentBounds, play]);

  // Replay câu hiện tại
  const handleReplaySegment = useCallback(() => {
    if (currentSegment) {
      seekTo(currentSegment.start);
      playSegment(currentSegment.start, currentSegment.end);
    }
  }, [currentSegment, seekTo, playSegment]);

  // Kiểm tra bài làm
  const handleCheckAnswer = useCallback(() => {
    const isSuccess = checkCurrentAnswer();
    if (isSuccess) {
      toast.success('Chính xác! Bạn đã nghe rất tốt.', {
        description: 'Đoạn đang phát sẽ chạy hết và tự động chuyển câu tiếp theo.',
      });

      // Nếu là câu cuối cùng trong danh sách
      if (currentIndex === segments.length - 1) {
        setIsSummaryOpen(true);
        return true;
      }

      // Theo yêu cầu:
      // "không phải cứ kiểm tra đúng là sẽ sang đoạn tiếp theo luôn mà là sẽ chạy hết đoạn cũ đang dở và sẽ chuyển qua đoạn tiếp theo luôn chứ không cần lặp lại hay tự dừng (nếu được active nữa)"
      // 1. Nếu video đang phát (isPlaying): để chạy hết đoạn cũ đang dở. Khi chạm seg.end, handleSegmentEnd sẽ tự động chuyển sang câu tiếp theo mà không lặp hay tự dừng.
      // 2. Nếu video đang tạm dừng (pause):
      //    - Nếu đã ở cuối câu (currentTime >= currentSegment.end - 0.5): đã chạy hết đoạn cũ, chuyển sang câu tiếp theo.
      //    - Nếu đang dừng ở giữa câu: tiếp tục phát (play()) để chạy nốt đoạn cũ đang dở rồi tự chuyển câu khi chạm mốc kết thúc.
      if (!isPlaying) {
        if (currentSegment && currentTime >= currentSegment.end - 0.5) {
          const nextIdx = currentIndex + 1;
          const nextSeg = segments[nextIdx];
          setTimeout(() => {
            currentIndexRef.current = nextIdx;
            goToSegment(nextIdx);
            if (nextSeg) {
              seekTo(nextSeg.start);
              playSegment(nextSeg.start, nextSeg.end);
            }
          }, 350);
        } else {
          // Tiếp tục phát nốt phần audio còn lại của câu
          play();
        }
      }
    } else {
      toast.error('Chưa chính xác, hãy lắng nghe lại nhé!', {
        description: 'Bạn có thể bấm phím Ctrl để nghe lại hoặc phím H để xem gợi ý.',
      });
    }
    return isSuccess;
  }, [checkCurrentAnswer, currentIndex, segments, isPlaying, currentSegment, currentTime, goToSegment, seekTo, playSegment, play]);

  // Đồng bộ video ID lên URL query (?v=...) và lưu vào localStorage để giữ trạng thái khi F5
  const updateVideoUrlParam = useCallback((videoId: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vocab_last_listening_video_id', videoId);
      const url = new URL(window.location.href);
      url.searchParams.set('v', videoId);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
  }, []);

  // Xử lý nạp link YouTube từ form hoặc khôi phục dữ liệu video
  const handleLoadUrl = useCallback(
    async (url: string, autoEnterWorkspace = true) => {
      try {
        setIsLoading(true);
        const res = await listeningService.fetchTranscript(url);

        if (res.success && res.metadata) {
          setActiveYoutubeId(res.metadata.id);
          setVideoMetadata(res.metadata);
          updateVideoUrlParam(res.metadata.id);

          if (res.segments && res.segments.length > 0) {
            setSegments(res.segments);
            if (autoEnterWorkspace) {
              toast.success(`Đã tải thành công phụ đề: ${res.metadata.title}`, {
                description: `Tìm thấy ${res.segments.length} câu hoàn chỉnh. Đang mở phòng luyện nghe!`,
              });
              // Chuyển sang phòng luyện nghe khi người dùng chủ động nạp
              setViewMode('workspace');
            }
          } else {
            if (autoEnterWorkspace) {
              toast.info(res.message || 'Không tìm thấy phụ đề tiếng Anh cho video này.');
            }
            setSegments([]);
          }
        } else {
          if (autoEnterWorkspace) {
            toast.error(res.message || 'Không thể tải phụ đề cho video này.');
          }
        }
      } catch (err: unknown) {
        if (autoEnterWorkspace) {
          const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
          toast.error(msg);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [updateVideoUrlParam]
  );

  // Hủy video đang chọn để quay lại trạng thái chưa chọn link
  const handleClearSelectedVideo = () => {
    setActiveYoutubeId('');
    setVideoMetadata(null);
    setSegments([]);
    try {
      localStorage.removeItem('vocab_last_listening_video_id');
      const url = new URL(window.location.href);
      url.searchParams.delete('v');
      window.history.replaceState(null, '', url.toString());
    } catch {
      // ignore
    }
    toast.info('Đã hủy video đang chọn. Bạn có thể dán link mới vào ô bên trên.');
  };

  // Tự động khôi phục video đang học từ URL query (?v=...) hoặc localStorage khi F5 (chỉ nạp dữ liệu xem trước, không tự động chuyển sang workspace)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('v') || localStorage.getItem('vocab_last_listening_video_id');

        if (targetId) {
          // Tải thông tin video và phụ đề vào bộ nhớ xem trước, không tự động chuyển sang workspace
          handleLoadUrl(targetId, false);
        }
      } catch {
        // ignore
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [handleLoadUrl]);

  // Chọn bài nghe từ danh sách bài đã nghe / đang làm dở
  const handleSelectHistoryPodcast = async (youtubeId: string, diff: ListeningDifficulty) => {
    setDifficulty(diff);
    await handleLoadUrl(youtubeId, true);
  };

  // Chuyển sang khu vực lựa chọn video (tự động pause & cập nhật lại lịch sử)
  const handleBackToSelection = () => {
    pause();
    setViewMode('selection');
    loadUserHistory();
  };

  // Bắt đầu vào khu vực luyện nghe
  const handleEnterWorkspace = () => {
    setViewMode('workspace');
    // Nhảy tới đúng câu đang học dở / active câu chưa hoàn thành (currentSegment)
    const targetSeg = currentSegment || segments[0];
    if (targetSeg) {
      setTimeout(() => {
        seekTo(targetSeg.start);
      }, 150);
    }
  };

  // Phím tắt toàn cục (Pro Shortcuts - chỉ kích hoạt khi đang ở workspace)
  useEffect(() => {
    if (viewMode !== 'workspace') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Phím ` (Backtick / Tilde cạnh số 1): Play / Pause audio hoặc video (kể cả khi đang ở trong ô input)
      if (e.key === '`' || e.code === 'Backquote') {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
        return;
      }

      // Phím Ctrl (Control): Replay câu hiện tại (kể cả khi đang ở trong ô input)
      if (e.key === 'Control') {
        e.preventDefault();
        handleReplaySegment();
        return;
      }

      // Phím Space: Play / Pause khi không gõ text
      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
        return;
      }

      // Phím '[' hoặc ']': Đổi tốc độ phát
      if (!isInput) {
        if (e.key === '[') {
          setPlaybackRate(Math.max(0.75, playbackRate - 0.1));
        } else if (e.key === ']') {
          setPlaybackRate(Math.min(1.25, playbackRate + 0.1));
        } else if (e.key.toLowerCase() === 'h') {
          setShowHint((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    viewMode,
    isPlaying,
    play,
    pause,
    handleReplaySegment,
    prevSegment,
    playbackRate,
    setPlaybackRate,
    setShowHint,
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* MÀN HÌNH CHỜ: LỰA CHỌN VIDEO ĐỂ LUYỆN NGHE (SELECTION / WAITING LOBBY)   */}
      {/* ========================================================================= */}

      {/* ========================================================================= */}
      {/* KHU VỰC 1: LỰA CHỌN VIDEO ĐỂ LUYỆN NGHE (WAITING / SELECTION LOBBY)        */}
      {/* ========================================================================= */}
      {viewMode === 'selection' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Hero Banner: Nhập link & chọn cấp độ */}
          <ListeningHeroBanner
            onLoadUrl={handleLoadUrl}
            isLoading={isLoading}
            selectedDifficulty={difficulty}
            onChangeDifficulty={(diff) => setDifficulty(diff)}
          />

          {/* Card Xác Nhận & Xem Trước Video Đang Chọn (Chỉ hiện khi ĐÃ CÓ link video) */}
          {videoMetadata && segments.length > 0 && (
            (() => {
              const displayDuration =
                segments.length > 0 ? formatTimestamp(segments[segments.length - 1].end) : '08:55';

              return (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface via-surface to-brand/10 border border-brand/40 p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in-50 duration-200">
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-52 aspect-video rounded-2xl overflow-hidden bg-black shrink-0 border border-border/80 shadow-md">
                      <Image
                        src={videoMetadata.thumbnailUrl || 'https://img.youtube.com/vi/s2EYIDY8wSM/hqdefault.jpg'}
                        alt={videoMetadata.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand" />
                        <span>{displayDuration}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-brand/15 text-brand border border-brand/30">
                          Level: {videoMetadata.cefrLevel || 'A1'}
                        </span>
                        <span className="text-xs text-text-secondary font-medium">
                          Kênh: {videoMetadata.channelTitle}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-text-primary line-clamp-2 leading-snug">
                        {videoMetadata.title}
                      </h3>

                      <p className="text-xs text-text-secondary">
                        Trạng thái phụ đề:{' '}
                        <strong className="text-emerald-500 font-semibold">
                          Đã sẵn sàng trọn vẹn {segments.length} câu bài tập
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Chọn chế độ & Nút Vào Luyện Nghe Ngay */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                    <div className="flex items-center justify-center p-1 rounded-xl bg-base border border-border gap-1">
                      <button
                        type="button"
                        onClick={() => setDifficulty('easy')}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          difficulty === 'easy'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shadow-xs'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                        title="Chế độ điền các từ khóa còn thiếu"
                      >
                        🟢 Dễ (Từ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDifficulty('medium')}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          difficulty === 'medium'
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-xs'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                        title="Chế độ điền cụm từ ngữ pháp"
                      >
                        🟡 Vừa (Cụm)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDifficulty('hard')}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          difficulty === 'hard'
                            ? 'bg-red-500/15 text-red-500 border border-red-500/30 shadow-xs'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                        title="Chế độ chép chính tả trọn vẹn cả câu"
                      >
                        🔴 Khó (Cả câu)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleEnterWorkspace}
                      className="h-12 px-6 rounded-2xl bg-brand hover:bg-brand-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand/25 transition-all cursor-pointer shrink-0 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Headphones className="w-4 h-4" />
                      <span>Vào Luyện Nghe Ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleClearSelectedVideo}
                      className="h-12 px-3 rounded-2xl bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Hủy chọn video này để nhập link khác"
                    >
                      <X className="w-4 h-4 text-text-secondary" />
                      <span className="hidden sm:inline">Đổi link</span>
                    </button>
                  </div>
                </div>
              );
            })()
          )}

          {/* Danh sách bài học đang dở & đã nghe gần đây */}
          <RecentListeningShelf
            historyList={historyList}
            onSelectPodcast={handleSelectHistoryPodcast}
            isLoading={isLoadingHistory}
          />

          {/* Các bước chỉ dẫn: CHỈ HIỆN KHI CHƯA CÓ LINK VÀ CHƯA CÓ BÀI HỌC NÀO TRONG LỊCH SỬ */}
          {!videoMetadata && (!historyList || historyList.length === 0) && !isLoadingHistory && (
            <ListeningEmptyGuide />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* KHU VỰC 2: PHÒNG LUYỆN NGHE TẬP TRUNG (ACTIVE DICTATION WORKSPACE)         */}
      {/* Giữ DOM luôn mounted để iframe YouTube không bị reload khi chuyển tab     */}
      {/* ========================================================================= */}
      <div
        className={
          viewMode === 'workspace'
            ? 'space-y-5 animate-in fade-in-50 duration-200'
            : 'fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none'
        }
      >
        {/* Workspace Sub-header: Nút quay lại & Bộ chọn độ khó trực tiếp */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-border/70">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToSelection}
              className="h-9 px-3 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>Đổi video khác</span>
            </button>

            <div className="hidden sm:block h-4 w-px bg-border" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Chế độ bài tập:</span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  difficulty === 'easy'
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                    : difficulty === 'medium'
                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                    : 'bg-red-500/15 text-red-500 border-red-500/30'
                }`}
              >
                {difficulty === 'easy'
                  ? '🟢 Dễ (Điền từ)'
                  : difficulty === 'medium'
                  ? '🟡 Vừa (Điền cụm)'
                  : '🔴 Khó (Chép cả câu)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tiến độ:</span>
            <span className="text-text-primary font-bold font-mono">
              {completedSegmentIds.size} / {segments.length} câu hoàn thành
            </span>
          </div>
        </div>

        {/* Lưới 2 Cột: Video Player + Dictation Workspace | Transcript Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Cột trái & giữa (8 cols): Video Player + Khung làm bài */}
          <div className="lg:col-span-8 space-y-5">
            {/* YouTube Video Player / Audio Fallback Player */}
            <YouTubePlayerCard
              containerId="youtube-listening-player"
              isReady={isReady}
              isPlaying={isPlaying}
              currentTime={currentTime}
              currentSegment={currentSegment}
              playbackRate={playbackRate}
              isLooping={isLooping}
              autoPauseAtEnd={autoPauseAtEnd}
              isAudioFallback={isAudioFallback}
              onToggleAudioFallback={toggleAudioFallback}
              thumbnailUrl={videoMetadata?.thumbnailUrl}
              videoTitle={videoMetadata?.title}
              channelName={videoMetadata?.channelTitle}
              onPlay={handlePlay}
              onPause={pause}
              onReplaySegment={handleReplaySegment}
              onPrevSegment={prevSegment}
              onNextSegment={nextSegment}
              onToggleLoop={toggleLooping}
              onToggleAutoPause={toggleAutoPause}
              onChangeRate={setPlaybackRate}
            />

            {/* Dictation Workspace */}
            <DictationWorkspace
              currentSegment={currentSegment}
              currentIndex={currentIndex}
              totalSegments={totalSegments}
              difficulty={difficulty}
              showHint={showHint}
              showAnswer={showAnswer}
              wordClozeItems={wordClozeItems}
              chunkClozeItem={chunkClozeItem}
              chunkClozeState={chunkClozeState}
              fullDictationText={fullDictationText}
              diffResult={diffResult}
              isCurrentSegmentCompleted={
                currentSegment ? completedSegmentIds.has(currentSegment.id) : false
              }
              onToggleHint={() => setShowHint((prev) => !prev)}
              onToggleAnswer={() => setShowAnswer((prev) => !prev)}
              onWordAnswerChange={setWordAnswer}
              onChunkAnswerChange={setChunkAnswer}
              onDictationAnswerChange={setDictationAnswer}
              onCheckAnswer={handleCheckAnswer}
              onNextSegment={nextSegment}
              onTextSelection={() => handleTextSelection(currentSegment?.text)}
            />
          </div>

          {/* Cột phải (4 cols): Đồng bộ Timeline phụ đề Karaoke */}
          <div className="lg:col-span-4 sticky top-4">
            <TranscriptSyncSidebar
              segments={segments}
              currentSegmentIndex={currentIndex}
              completedSegmentIds={completedSegmentIds}
              onSelectSegment={(idx) => {
                goToSegment(idx);
                const seg = segments[idx];
                if (seg) {
                  seekTo(seg.start);
                  playSegment(seg.start, seg.end);
                }
              }}
              onTextSelection={(contextSentence) => handleTextSelection(contextSentence)}
            />
          </div>
        </div>
      </div>

      {/* Summary Celebration Modal */}
      <ListeningSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        totalSegments={totalSegments}
        completedCount={completedSegmentIds.size}
        podcastTitle={videoMetadata?.title || 'Bài luyện nghe'}
        onRestart={() => {
          goToSegment(0);
          if (segments[0]) {
            seekTo(segments[0].start);
          }
        }}
      />

      {/* Modal Thông Báo & Xác Nhận Chuyển Sang Audio Mode khi Video bị Cấm Embed (150/101) */}
      <Modal
        isOpen={isEmbedBlockedPromptOpen}
        onClose={dismissEmbedBlockedPrompt}
        maxWidth="md"
      >
        <div className="flex flex-col items-center text-center p-2 sm:p-4 space-y-4 select-none">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10 animate-bounce">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-text-primary">
              Video Giới Hạn Quyền Nhúng
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
              Chủ sở hữu video YouTube này đã tắt tính năng xem trực tiếp trên các website bên ngoài{' '}
              <span className="font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                (Mã lỗi {blockedErrorCode ?? 150})
              </span>
              .
            </p>
          </div>

          <div className="w-full p-4 rounded-xl bg-surface border border-border/80 text-left text-xs space-y-2 text-text-secondary">
            <div className="flex items-center gap-2 text-brand font-semibold">
              <Headphones className="w-4 h-4" />
              <span>Giải pháp Chế độ Chỉ Nghe (Audio Mode):</span>
            </div>
            <p className="leading-relaxed">
              Hệ thống sẽ kết nối luồng phát âm thanh trực tiếp (Audio Stream) để bạn tiếp tục nghe, tua phân đoạn và chép chính tả như bình thường mà không cần hiển thị khung video YouTube.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
            <button
              type="button"
              onClick={confirmSwitchToAudio}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-hover text-white text-sm font-bold shadow-md shadow-brand/25 hover:shadow-lg hover:shadow-brand/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>🎧 Chuyển sang Audio & Học tiếp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                dismissEmbedBlockedPrompt();
                handleBackToSelection();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-base hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary text-sm font-medium transition-colors cursor-pointer"
            >
              Đổi video khác
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Context Menu khi bôi đen từ/cụm từ */}
      <ListeningVocabContextMenu
        textSelection={textSelection}
        onAddVocabulary={handleOpenVocabPopover}
      />

      {/* Word Quick Popover: Tự động phân tích AI theo ngữ cảnh nguyên câu (giống Story) */}
      <WordQuickPopover
        key={activeToken ? `${activeToken.clean}-${activeToken.id}` : 'empty-listening-popover'}
        token={activeToken}
        contextSentence={activeContextSentence || currentSegment?.text || ''}
        knownCard={activeToken ? getKnownCardInfo(activeToken.clean) : undefined}
        onClose={handleCloseVocabPopover}
        autoAnalyze={true}
      />
    </div>
  );
}
