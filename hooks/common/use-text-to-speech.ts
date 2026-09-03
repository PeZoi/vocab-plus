'use client';

import { useState, useCallback } from 'react';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Trình duyệt không hỗ trợ Web Speech API');
      return;
    }

    window.speechSynthesis.cancel(); // Hủy âm thanh đang phát trước đó nếu có

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Tốc độ vừa phải cho người học

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak, isPlaying };
}
