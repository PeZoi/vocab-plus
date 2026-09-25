'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Sparkles, Info, Loader2 } from 'lucide-react';
import { listeningService } from '@/services/listening.service';
import type { ConnectedSpeechTip } from '@/types/listening.types';

interface ConnectedSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentence: string;
}

export function ConnectedSpeechModal({
  isOpen,
  onClose,
  sentence,
}: ConnectedSpeechModalProps) {
  const [loading, setLoading] = useState(false);
  const [tipData, setTipData] = useState<ConnectedSpeechTip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !sentence) return;

    let isMounted = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
    }, 0);

    listeningService
      .fetchConnectedSpeech(sentence)
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setTipData(res.data);
          } else {
            setError('Không thể lấy mẹo nối âm lúc này.');
          }
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Lỗi kết nối AI');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, sentence]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand" />
          <span>Giải Mã Âm Thanh Bản Xứ</span>
        </div>
      }
      description="Hiểu vì sao người bản xứ nói lướt hoặc biến đổi âm thanh trong câu này."
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-base border border-border text-xs sm:text-sm font-medium text-text-primary leading-relaxed">
          &ldquo;{sentence}&rdquo;
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-text-secondary">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
            <span className="text-xs">AI đang phân tích ngữ âm và hiện tượng nối âm...</span>
          </div>
        ) : error ? (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        ) : tipData ? (
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {tipData.phoneticPhantoms.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-base/70 border border-border/70 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">
                    {item.phrase}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-brand/10 border border-brand/20 font-mono text-[11px] font-bold text-brand">
                    {item.spokenSound}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}

            {tipData.generalTip && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{tipData.generalTip}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
