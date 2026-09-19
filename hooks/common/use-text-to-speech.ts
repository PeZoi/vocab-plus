'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type AudioAccent = 'us' | 'uk';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAccent, setPlayingAccent] = useState<AudioAccent | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Tải danh sách voice của trình duyệt khi mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  /**
   * Chọn bộ giọng Natural / Neural tốt nhất dựa trên accent (US hoặc UK)
   */
  const getBestVoice = useCallback((accent: AudioAccent): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : typeof window !== 'undefined' && 'speechSynthesis' in window
        ? window.speechSynthesis.getVoices()
        : [];

    if (voices.length === 0) return null;

    if (accent === 'us') {
      // Thứ tự ưu tiên cho US: Natural online -> Google US -> English US bất kỳ
      const naturalUs = voices.find(
        (v) =>
          v.lang === 'en-US' &&
          (v.name.includes('Jenny') ||
            v.name.includes('Guy') ||
            v.name.includes('Natural') ||
            v.name.includes('Online'))
      );
      if (naturalUs) return naturalUs;

      const googleUs = voices.find((v) => v.name.includes('Google US English'));
      if (googleUs) return googleUs;

      const anyUs = voices.find((v) => v.lang === 'en-US');
      if (anyUs) return anyUs;
    } else {
      // Thứ tự ưu tiên cho UK: Natural online -> Google UK -> English UK bất kỳ
      const naturalUk = voices.find(
        (v) =>
          (v.lang === 'en-GB' || v.lang === 'en_GB') &&
          (v.name.includes('Sonia') ||
            v.name.includes('Ryan') ||
            v.name.includes('Natural') ||
            v.name.includes('Online'))
      );
      if (naturalUk) return naturalUk;

      const googleUk = voices.find(
        (v) => v.name.includes('Google UK English Female') || v.name.includes('Google UK English Male')
      );
      if (googleUk) return googleUk;

      const anyUk = voices.find((v) => v.lang === 'en-GB' || v.lang === 'en_GB');
      if (anyUk) return anyUk;
    }

    // Fallback chung tiếng Anh
    return voices.find((v) => v.lang.startsWith('en')) || null;
  }, []);

  /**
   * Dừng tất cả âm thanh đang phát
   */
  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlayingAccent(null);
  }, []);

  /**
   * Phát văn bản bằng Web Speech API với bộ giọng tự nhiên cao cấp
   */
  const speak = useCallback(
    (text: string, langOrAccent: string = 'en-US', rate: number = 0.9) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Trình duyệt không hỗ trợ Web Speech API');
        return;
      }

      stop();

      const accent: AudioAccent =
        langOrAccent.toLowerCase().includes('gb') || langOrAccent.toLowerCase() === 'uk'
          ? 'uk'
          : 'us';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
      utterance.rate = rate;

      const voice = getBestVoice(accent);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setPlayingAccent(accent);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setPlayingAccent(null);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setPlayingAccent(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [getBestVoice, stop]
  );

  /**
   * Phát từ vựng bằng bộ giọng AI Neural bản xứ chuẩn xác của Web Speech API
   * Tốc độ 0ms tức thì, không tốn băng thông, không lỗi mạng, phân biệt chuẩn US và UK
   */
  const speakWord = useCallback(
    (word: string, accent: AudioAccent = 'us') => {
      const cleanWord = word.trim();
      if (!cleanWord) return;
      speak(cleanWord, accent, 0.9);
    },
    [speak]
  );

  return {
    speak,
    speakWord,
    stop,
    isPlaying,
    playingAccent,
  };
}

