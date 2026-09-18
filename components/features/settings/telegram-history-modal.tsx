'use client';

import React from 'react';
import {
  History,
  Bell,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Clock,
  Swords,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTelegramHistory } from '@/hooks/features/settings/use-telegram-history';
import { formatDateTime, formatRelativeTime } from '@/utils/datetime';
import { normalizeEscapedText } from '@/utils/formatters';
import type { TelegramNotificationLog, TelegramNotificationType } from '@/types/telegram.types';

interface TelegramHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Hiển thị huy hiệu loại thông báo
 */
function NotificationTypeBadge({ type }: { type: TelegramNotificationType }) {
  switch (type) {
    case 'test':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Send className="w-2.5 h-2.5" />
          Thử nghiệm
        </span>
      );
    case 'reminder':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Bell className="w-2.5 h-2.5" />
          Nhắc nhở SRS
        </span>
      );
    case 'welcome':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-2.5 h-2.5" />
          Kết nối
        </span>
      );
    case 'duel':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Swords className="w-2.5 h-2.5" />
          Thách đấu
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border">
          <Info className="w-2.5 h-2.5" />
          Hệ thống
        </span>
      );
  }
}

/**
 * Giải mã các ký tự HTML entity cơ bản cho các đoạn text thuần
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Phân tích và hiển thị đệ quy chuỗi chứa các thẻ HTML Telegram:
 * - Hỗ trợ các thẻ lồng nhau (nested tags) như <b><a href="...">...</a></b> hoặc <i>...<b>...</b>...</i>
 * - Hỗ trợ các thẻ Telegram chuẩn: b, strong, i, em, code, pre, a, s, strike, del, u
 */
function parseTelegramMarkup(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const tagRegex = /<(b|strong|i|em|code|pre|a|s|strike|del|u)(?: [^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(decodeHtmlEntities(text.substring(lastIndex, match.index)));
    }

    const rawTag = match[1].toLowerCase();
    const innerContent = match[2];
    const matchIndex = match.index;
    const currentKey = `${keyPrefix}-${matchIndex}-${rawTag}`;

    // Đệ quy phân tích nội dung bên trong thẻ nếu không phải code block
    const isCode = rawTag === 'code' || rawTag === 'pre';
    const children = isCode ? innerContent : parseTelegramMarkup(innerContent, currentKey);

    if (rawTag === 'b' || rawTag === 'strong') {
      parts.push(
        <strong key={currentKey} className="font-semibold text-text-primary">
          {children}
        </strong>
      );
    } else if (rawTag === 'i' || rawTag === 'em') {
      parts.push(
        <em key={currentKey} className="italic text-text-secondary">
          {children}
        </em>
      );
    } else if (rawTag === 'code') {
      parts.push(
        <code
          key={currentKey}
          className="font-mono bg-surface px-1.5 py-0.5 rounded text-sky-300 border border-border/50 text-[11px]"
        >
          {children}
        </code>
      );
    } else if (rawTag === 'pre') {
      parts.push(
        <pre
          key={currentKey}
          className="font-mono bg-surface p-2 rounded text-sky-300 border border-border/50 text-[11px] overflow-x-auto my-1"
        >
          {children}
        </pre>
      );
    } else if (rawTag === 'a') {
      const fullTag = match[0];
      const hrefMatch = fullTag.match(/href=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3]) : undefined;

      if (href) {
        parts.push(
          <a
            key={currentKey}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:text-brand-hover font-semibold underline underline-offset-2 inline-flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            {children}
            <ExternalLink className="w-2.5 h-2.5 inline-block ml-0.5 shrink-0" />
          </a>
        );
      } else {
        parts.push(
          <span key={currentKey} className="text-brand font-medium underline">
            {children}
          </span>
        );
      }
    } else if (rawTag === 's' || rawTag === 'strike' || rawTag === 'del') {
      parts.push(
        <s key={currentKey} className="line-through text-text-secondary">
          {children}
        </s>
      );
    } else if (rawTag === 'u') {
      parts.push(
        <u key={currentKey} className="underline underline-offset-2">
          {children}
        </u>
      );
    }

    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(decodeHtmlEntities(text.substring(lastIndex)));
  }

  return parts.length > 0 ? parts : [decodeHtmlEntities(text)];
}

/**
 * Xử lý hiển thị từng dòng tin nhắn Telegram
 */
function renderLineMarkup(line: string, lineIdx: number) {
  // Thay thế ký tự tab \t bằng 4 khoảng trắng thụt lề chuẩn
  const lineWithTabs = line.replace(/\t/g, '\u00A0\u00A0\u00A0\u00A0');
  return parseTelegramMarkup(lineWithTabs, `line-${lineIdx}`);
}

/**
 * Hiển thị nội dung tin nhắn Telegram có hỗ trợ các ký tự điều khiển (\n, \t, \r) và thẻ HTML
 */
function TelegramMessageContent({ content }: { content: string }) {
  // Chuẩn hóa toàn bộ các ký tự \n, \t, \r (cả dạng thực lẫn chuỗi escaped literal)
  const normalized = normalizeEscapedText(content);
  const lines = normalized.split('\n');

  return (
    <div className="p-3.5 rounded-xl bg-base/85 border border-border/70 text-xs text-text-primary/95 font-sans leading-relaxed break-words shadow-inner space-y-1 select-text">
      {lines.map((line, idx) => {
        // Dòng trống (tạo khoảng cách ngắt đoạn tương ứng với \n\n)
        if (!line.trim()) {
          return <div key={idx} className="h-2.5" aria-hidden="true" />;
        }

        return (
          <div key={idx} className="min-h-[1.25em]">
            {renderLineMarkup(line, idx)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Thẻ hiển thị một bản ghi thông báo
 */
function NotificationLogItem({ log }: { log: TelegramNotificationLog }) {
  const isSent = log.status === 'sent';

  return (
    <div className="p-3.5 rounded-xl bg-surface/90 border border-border/80 hover:border-border transition-all space-y-2.5">
      {/* Hàng tiêu đề & trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <NotificationTypeBadge type={log.type} />
          <h4 className="text-xs sm:text-sm font-semibold text-text-primary tracking-tight">
            {log.title}
          </h4>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isSent ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Đã gửi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              <AlertTriangle className="w-3 h-3" />
              Gửi lỗi
            </span>
          )}

          <div
            className="text-[11px] text-text-secondary flex items-center gap-1.5"
            title={formatDateTime(log.created_at, 'dd/MM/yyyy HH:mm:ss')}
          >
            <Clock className="w-3 h-3 shrink-0 text-text-secondary/70" />
            <span className="font-mono text-text-primary/90 font-medium">
              {formatDateTime(log.created_at, 'dd/MM/yyyy HH:mm')}
            </span>
            <span className="text-text-secondary/50">•</span>
            <span className="text-text-secondary">
              {formatRelativeTime(log.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Bong bóng tin nhắn Telegram */}
      <TelegramMessageContent content={log.message} />

      {/* Lỗi nếu có */}
      {log.error_message && (
        <div className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{log.error_message}</span>
        </div>
      )}
    </div>
  );
}

export function TelegramHistoryModal({ isOpen, onClose }: TelegramHistoryModalProps) {
  const { logs, isLoading, isError, refetch, isFetching } = useTelegramHistory({
    limit: 5,
    enabled: isOpen,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-semibold text-text-primary">
              Lịch Sử Thông Báo Telegram
            </div>
            <p className="text-xs text-text-secondary font-normal mt-0.5">
              Hiển thị tối đa 5 thông báo gần nhất đã gửi tới tài khoản của bạn
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Danh sách nội dung */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface border border-border/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">
              Không thể tải lịch sử thông báo Telegram. Vui lòng thử lại.
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Thử lại
            </Button>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-base/40 rounded-xl border border-dashed border-border/80 p-6">
            <div className="w-12 h-12 rounded-2xl bg-surface text-text-secondary border border-border flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6 opacity-60" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-semibold text-text-primary">
                Chưa có lịch sử thông báo nào
              </h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Các thông báo nhắc nhở ôn tập SRS và tin nhắn thử nghiệm sẽ được lưu trữ tự động tại đây ngay khi gửi.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {logs.map((log) => (
              <NotificationLogItem key={log.id} log={log} />
            ))}
          </div>
        )}

        {/* Footer controls */}
        <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-text-secondary flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Tự động đồng bộ với máy chủ Telegram Bot</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-xs gap-1.5 text-text-secondary hover:text-text-primary"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs px-4"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
