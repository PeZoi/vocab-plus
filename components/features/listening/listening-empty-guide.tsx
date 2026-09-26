'use client';

import React from 'react';
import {
  Sparkles,
  Layers,
  Headphones,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';

export function ListeningEmptyGuide() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* 1. Hướng Dẫn Quy Trình 3 Bước Luyện Nghe */}
      <div className="rounded-3xl bg-surface border border-border/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chưa Có Video Nào Được Chọn</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
              Cách Bắt Đầu Luyện Nghe Chủ Động Với YouTube
            </h2>
          </div>
          <p className="text-xs text-text-secondary max-w-sm">
            Dán đường dẫn YouTube vào ô bên trên để hệ thống tự động bóc tách phụ đề và tạo bài tập chép chính tả thông minh.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Bước 1 */}
          <div className="relative rounded-2xl bg-base/80 border border-border/70 p-5 space-y-3 flex flex-col justify-between hover:border-brand/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 font-bold">
                <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                  Bước 1
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  Dán Link YouTube Bất Kỳ
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Hỗ trợ mọi podcast, tin tức BBC, TED-Ed, talkshow phỏng vấn hoặc bài hát tiếng Anh có phụ đề trên YouTube.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chỉ cần paste link là học được ngay</span>
            </div>
          </div>

          {/* Bước 2 */}
          <div className="relative rounded-2xl bg-base/80 border border-border/70 p-5 space-y-3 flex flex-col justify-between hover:border-brand/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-brand uppercase tracking-wider">
                  Bước 2
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  Tự Động Tạo Bài Tập Thông Minh
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  AI tự động phân tách câu theo từng nhịp ngắt nghỉ, nhận diện từ then chốt và tạo 3 chế độ: Điền từ, Điền cụm hoặc Chép cả câu.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chuẩn xác mốc thời gian từng câu</span>
            </div>
          </div>

          {/* Bước 3 */}
          <div className="relative rounded-2xl bg-base/80 border border-border/70 p-5 space-y-3 flex flex-col justify-between hover:border-brand/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                  Bước 3
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  Luyện Chép & Lưu Từ Vào FSRS
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Lặp đoạn A-B tự động giúp tai bắt kịp tốc độ nói tự nhiên. Bôi đen từ mới để tra cứu ngữ cảnh và lưu thẳng vào kho ôn tập SRS.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Đồng bộ tiến độ học tập liên tục</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bảng Phím Tắt Luyện Nghe Nhanh */}
      <div className="rounded-2xl bg-surface/60 border border-border/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-base border border-border flex items-center justify-center text-text-secondary">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary">Phím Tắt Thao Tác Nhanh Khi Luyện Nghe</h4>
            <p className="text-[11px] text-text-secondary">Giúp bạn chép chính tả mà không cần chạm tay vào chuột</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-1 rounded-lg bg-base border border-border text-text-secondary flex items-center gap-1">
            <kbd className="font-bold text-text-primary">Space</kbd> Phát/Dừng
          </span>
          <span className="px-2 py-1 rounded-lg bg-base border border-border text-text-secondary flex items-center gap-1">
            <kbd className="font-bold text-text-primary">Ctrl</kbd> Nghe lại câu
          </span>
          <span className="px-2 py-1 rounded-lg bg-base border border-border text-text-secondary flex items-center gap-1">
            <kbd className="font-bold text-text-primary">Tab</kbd> Chuyển từ
          </span>
          <span className="px-2 py-1 rounded-lg bg-base border border-border text-text-secondary flex items-center gap-1">
            <kbd className="font-bold text-text-primary">Enter</kbd> Nộp bài
          </span>
          <span className="px-2 py-1 rounded-lg bg-base border border-border text-text-secondary flex items-center gap-1">
            <kbd className="font-bold text-text-primary">H</kbd> Gợi ý
          </span>
        </div>
      </div>
    </div>
  );
}
