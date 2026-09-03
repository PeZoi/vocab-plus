import type { Metadata } from 'next';
import { Sora, Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam-pro',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vocab App — Học Từ Vựng Với FSRS & AI',
  description: 'Nền tảng học từ vựng tiếng Anh theo phương pháp Spaced Repetition (FSRS) kết hợp AI phân tích ngữ cảnh',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${sora.variable} ${beVietnamPro.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-base text-text-primary">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
