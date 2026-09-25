'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cleanWord } from '@/lib/listening/cloze-generator';

interface ShadowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentence: string;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
  };
  length: number;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: unknown) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface IWindowSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export function ShadowingModal({ isOpen, onClose, sentence }: ShadowingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as IWindowSpeech;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setTimeout(() => {
        setHasSpeechSupport(false);
      }, 0);
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setUserTranscript(finalTranscript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  // Tính điểm so khớp khi người dùng nói (Derived State)
  const matchScore = useMemo(() => {
    if (!userTranscript || !sentence) return null;

    const expectedTokens = sentence.split(/\s+/).map((w) => cleanWord(w).toLowerCase()).filter(Boolean);
    const actualTokens = userTranscript.split(/\s+/).map((w) => cleanWord(w).toLowerCase()).filter(Boolean);

    let matchCount = 0;
    expectedTokens.forEach((exp) => {
      if (actualTokens.includes(exp)) {
        matchCount++;
      }
    });

    const score = Math.round((matchCount / Math.max(expectedTokens.length, 1)) * 100);
    return Math.min(100, score);
  }, [userTranscript, sentence]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setUserTranscript('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        // Có thể đang chạy
      }
    }
  };

  const handleSpeakSample = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(sentence);
      utter.lang = 'en-US';
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-brand" />
          <span>Shadowing Studio (Luyện Nhại Giọng)</span>
        </div>
      }
      description="Bật mic và đọc lại câu podcast theo đúng nhịp điệu và ngữ điệu tự nhiên."
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Câu mẫu */}
        <div className="p-4 rounded-2xl bg-base border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-text-secondary uppercase">
              Câu mẫu podcast:
            </span>
            <button
              type="button"
              onClick={handleSpeakSample}
              className="p-1 rounded-lg hover:bg-surface text-brand transition-colors cursor-pointer"
              title="Nghe mẫu phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm font-semibold text-text-primary leading-relaxed">
            &ldquo;{sentence}&rdquo;
          </p>
        </div>

        {/* Kết quả nhận diện giọng nói */}
        <div className="p-4 rounded-2xl bg-base/60 border border-border/80 min-h-[90px] flex flex-col justify-between">
          <span className="text-[11px] font-bold text-text-secondary uppercase mb-1">
            Giọng nói bạn vừa phát âm:
          </span>
          <p className="text-sm text-text-primary italic leading-relaxed">
            {userTranscript ? `“${userTranscript}”` : isRecording ? 'Đang lắng nghe bạn nói...' : 'Chưa có bản ghi âm. Hãy bấm Mic để bắt đầu.'}
          </p>

          {matchScore !== null && (
            <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="font-semibold text-text-secondary">Độ khớp phát âm:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                  matchScore >= 80
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : matchScore >= 50
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-red-500/15 text-red-500'
                }`}
              >
                {matchScore}% Khớp
              </span>
            </div>
          )}
        </div>

        {/* Mic Control Button */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {!hasSpeechSupport ? (
            <p className="text-xs text-red-400">
              Trình duyệt của bạn chưa hỗ trợ Web Speech API nhận diện giọng nói.
            </p>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              className={`h-14 px-6 rounded-full font-bold text-sm flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-brand hover:bg-brand-hover text-white shadow-brand/20'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Dừng Thu Âm</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Bắt Đầu Thu Âm</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
