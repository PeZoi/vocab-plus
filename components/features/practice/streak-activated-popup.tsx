'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, VolumeX } from 'lucide-react';

interface StreakActivatedPopupProps {
  isOpen: boolean;
  streakCount: number;
  onClose: () => void;
  /** Tùy chọn tự động đóng sau số giây (mặc định 7s, 0 là không tự đóng) */
  autoCloseDuration?: number;
}

/**
 * Âm thanh chúc mừng dạng Web Audio API tổng hợp (Không cần file mp3 ngoài)
 */
function playDuolingoCelebrationSound(muted: boolean) {
  if (muted || typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 1. Âm thanh bùng lửa (Whoosh / Fire burst)
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.25);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // 2. Hợp âm ăn mừng kiểu Duolingo (C5, E5, G5, C6)
    const chordNotes = [523.25, 659.25, 783.99, 1046.5];
    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.15 + idx * 0.08);

      gain.gain.setValueAtTime(0, now + 0.15 + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.15 + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + idx * 0.08 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.15 + idx * 0.08);
      osc.stop(now + 0.15 + idx * 0.08 + 0.6);
    });
  } catch {
    // Tự động bỏ qua nếu trình duyệt chặn autoplay audio
  }
}

/**
 * Tạo danh sách hạt Confetti nổ xung quanh ngọn lửa
 */
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  shape: 'circle' | 'square' | 'sparkle';
}

function generateBurstParticles(count = 24): Particle[] {
  const colors = ['#F59E0B', '#EA580C', '#FACC15', '#EF4444', '#38BDF8', '#10B981', '#FFFFFF'];
  const shapes: ('circle' | 'square' | 'sparkle')[] = ['circle', 'square', 'sparkle'];

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.2 - 0.1);
    const distance = 80 + Math.random() * 90;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      shape: shapes[i % shapes.length],
    };
  });
}

/**
 * Danh sách các hạt tàn lửa (Embers & Sparks) bốc lên từ ngọn lửa
 */
const FLAME_EMBERS = [
  { id: 1, left: '44%', size: 3.5, delay: 0.1, duration: 2.1, xOffset: -18 },
  { id: 2, left: '56%', size: 4, delay: 0.4, duration: 2.3, xOffset: 22 },
  { id: 3, left: '40%', size: 3, delay: 0.9, duration: 1.8, xOffset: -26 },
  { id: 4, left: '59%', size: 3.5, delay: 1.3, duration: 2.0, xOffset: 28 },
  { id: 5, left: '48%', size: 2.5, delay: 0.2, duration: 2.5, xOffset: -10 },
  { id: 6, left: '53%', size: 4.5, delay: 0.7, duration: 1.9, xOffset: 16 },
  { id: 7, left: '42%', size: 3.2, delay: 1.6, duration: 2.2, xOffset: -20 },
  { id: 8, left: '57%', size: 3.8, delay: 1.1, duration: 2.1, xOffset: 24 },
  { id: 9, left: '50%', size: 5, delay: 0.5, duration: 1.7, xOffset: 8 },
  { id: 10, left: '46%', size: 2.8, delay: 1.4, duration: 2.4, xOffset: -14 },
  { id: 11, left: '54%', size: 3.6, delay: 0.8, duration: 2.2, xOffset: 18 },
  { id: 12, left: '51%', size: 4.2, delay: 1.8, duration: 1.9, xOffset: -6 },
];

/**
 * Ngọn lửa chân thực, sống động và rực cháy (Realistic & Stylized Roaring Flame VFX)
 * - Đường nét hữu cơ bất đối xứng (Organic asymmetric flame licks & tongues)
 * - Đa tầng lưỡi lửa cuộn sóng độc lập (Multi-layered independently dancing tongues)
 * - Lõi phát sáng trắng nóng nhiệt độ cao (White-hot intense core)
 * - 12 hạt tàn lửa phát sáng bốc lên không trung (Floating rising embers & sparks)
 * - Vầng hào quang nhiệt tỏa sáng đa tầng (Multi-layered warm heat bloom)
 * - Không có khuôn mặt hoạt hình, mang lại cảm giác ngọn lửa thực sự mạnh mẽ, bùng cháy
 */
function RealisticStreakFlame({ isIgnited }: { isIgnited: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.3, y: -60, rotate: -8 }}
      animate={
        isIgnited
          ? {
              scale: [0.3, 1.25, 0.92, 1.05, 1],
              y: [-60, 0, -8, 2, 0],
              rotate: [-8, 6, -3, 2, 0],
            }
          : { scale: 1, y: 0, rotate: 0 }
      }
      transition={{ duration: 0.8, times: [0, 0.45, 0.7, 0.85, 1], ease: 'easeOut' }}
      className="relative w-44 h-52 mx-auto flex items-center justify-center select-none"
    >
      {/* 1. Vầng hào quang nhiệt tỏa sáng đa tầng phía sau (Radial Heat Aura) */}
      <motion.div
        animate={{
          scale: [1, 1.25, 0.95, 1.18, 1],
          opacity: [0.55, 0.9, 0.5, 0.85, 0.55],
        }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-t from-rose-600/40 via-brand/70 to-amber-400/50 rounded-full blur-3xl pointer-events-none"
      />

      {/* 2. Đáy nhiệt phát sáng dưới chân ngọn lửa (Base Ground Heat) */}
      <motion.div
        animate={{
          scaleX: [1, 1.15, 0.95, 1],
          opacity: [0.6, 0.85, 0.55, 0.6],
        }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        className="absolute bottom-2 inset-x-2 h-7 bg-gradient-to-r from-brand/20 via-amber-500/60 to-brand/20 rounded-full blur-xl pointer-events-none"
      />

      {/* 3. Các hạt tàn lửa phát sáng (Floating Embers & Sparks) bốc lên từ ngọn lửa */}
      {isIgnited &&
        FLAME_EMBERS.map((ember) => (
          <motion.div
            key={ember.id}
            className="absolute rounded-full pointer-events-none z-20"
            style={{
              left: ember.left,
              bottom: '22%',
              width: ember.size,
              height: ember.size,
              background: 'radial-gradient(circle, #FFFFFF 15%, #FDE047 50%, #EA580C 100%)',
              boxShadow: '0 0 6px #FDE047, 0 0 14px #EA580C',
            }}
            animate={{
              y: [0, -80, -170],
              x: [0, ember.xOffset * 0.4, ember.xOffset, ember.xOffset * 1.3],
              opacity: [0, 1, 0.85, 0],
              scale: [0.4, 1.3, 0.9, 0.2],
            }}
            transition={{
              repeat: Infinity,
              duration: ember.duration,
              delay: ember.delay,
              ease: 'easeOut',
            }}
          />
        ))}

      {/* 4. SVG Ngọn lửa chân thực đa tầng (Multi-Layered Realistic Vector Flame) */}
      <motion.svg
        viewBox="0 0 200 240"
        className="w-full h-full relative z-10 drop-shadow-[0_0_26px_rgba(234,88,12,0.9)] drop-shadow-[0_0_55px_rgba(249,115,22,0.5)]"
        animate={{
          scaleY: [1, 1.04, 0.97, 1.03, 1],
          scaleX: [1, 0.97, 1.03, 0.98, 1],
          rotate: [-1.2, 1.5, -1, 1.2, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut',
        }}
      >
        <defs>
          {/* Gradient vỏ lửa ngoài: Đỏ ruby đậm -> Đỏ tươi -> Cam rực -> Vàng cam */}
          <linearGradient id="realFlameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#7F1D1D" />
            <stop offset="20%" stopColor="#B91C1C" />
            <stop offset="45%" stopColor="#EA580C" />
            <stop offset="75%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>

          {/* Gradient lưỡi lửa phụ bên trái */}
          <linearGradient id="realFlameLeft" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="50%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          {/* Gradient lưỡi lửa phụ bên phải */}
          <linearGradient id="realFlameRight" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#991B1B" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>

          {/* Gradient thân lửa giữa: Cam hổ phách -> Vàng sáng rực */}
          <linearGradient id="realFlameMid" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C2410C" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>

          {/* Gradient lõi lửa trong: Vàng tươi -> Trắng vàng */}
          <linearGradient id="realFlameInner" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="30%" stopColor="#FDE047" />
            <stop offset="65%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Gradient tâm nhiệt độ cực đại: Trắng sáng phát quang */}
          <radialGradient id="realFlameWhiteHot" cx="50%" cy="65%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="55%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.75" />
          </radialGradient>
        </defs>

        {/* TẦNG 1: LỚP VỎ LỬA CHÍNH (OUTER ROARING FLAME - CÓ CÁC NHÁNH UỐN LƯỢN HỮU CƠ) */}
        <motion.path
          d="M 100 12
             C 114 44, 138 60, 150 88
             C 162 116, 166 148, 150 178
             C 136 204, 114 212, 100 212
             C 84 212, 60 204, 46 178
             C 32 148, 34 116, 48 88
             C 60 60, 84 44, 100 12 Z"
          fill="url(#realFlameOuter)"
          animate={{
            d: [
              "M 100 12 C 114 44, 138 60, 150 88 C 162 116, 166 148, 150 178 C 136 204, 114 212, 100 212 C 84 212, 60 204, 46 178 C 32 148, 34 116, 48 88 C 60 60, 84 44, 100 12 Z",
              "M 104 18 C 120 48, 142 66, 146 92 C 158 122, 160 152, 144 176 C 132 202, 112 210, 98 210 C 80 210, 62 202, 50 176 C 36 152, 38 122, 50 92 C 62 66, 86 48, 104 18 Z",
              "M 96 10 C 110 42, 136 58, 154 86 C 166 114, 170 146, 152 180 C 138 206, 116 214, 102 214 C 86 214, 58 206, 44 180 C 28 146, 32 114, 46 86 C 58 58, 82 42, 96 10 Z",
              "M 100 12 C 114 44, 138 60, 150 88 C 162 116, 166 148, 150 178 C 136 204, 114 212, 100 212 C 84 212, 60 204, 46 178 C 32 148, 34 116, 48 88 C 60 60, 84 44, 100 12 Z",
            ],
          }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        />

        {/* TẦNG 2: LƯỠI LỬA TÁCH NHÁNH SƯỜN TRÁI (LEFT CRACKLING TONGUE) */}
        <motion.path
          d="M 68 196
             C 34 168, 22 120, 52 72
             C 46 104, 64 126, 72 144
             C 80 162, 74 184, 68 196 Z"
          fill="url(#realFlameLeft)"
          opacity="0.92"
          animate={{
            scaleY: [1, 1.09, 0.92, 1],
            scaleX: [1, 0.94, 1.06, 1],
            rotate: [0, -4, 2.5, 0],
          }}
          style={{ transformOrigin: '68px 196px' }}
          transition={{ repeat: Infinity, duration: 1.35, ease: 'easeInOut' }}
        />

        {/* TẦNG 3: LƯỠI LỬA TÁCH NHÁNH SƯỜN PHẢI (RIGHT CRACKLING TONGUE) */}
        <motion.path
          d="M 132 196
             C 166 168, 178 120, 148 72
             C 154 104, 136 126, 128 144
             C 120 162, 126 184, 132 196 Z"
          fill="url(#realFlameRight)"
          opacity="0.92"
          animate={{
            scaleY: [0.93, 1.08, 1, 0.93],
            scaleX: [1.04, 0.95, 1, 1.04],
            rotate: [0, 4, -2.5, 0],
          }}
          style={{ transformOrigin: '132px 196px' }}
          transition={{ repeat: Infinity, duration: 1.45, ease: 'easeInOut' }}
        />

        {/* TẦNG 4: THÂN LỬA RỰC RỠ Ở GIỮA (MID VIBRANT FLAME BODY) */}
        <motion.path
          d="M 100 42
             C 114 68, 136 94, 140 126
             C 144 162, 126 195, 100 195
             C 74 195, 56 162, 60 126
             C 64 94, 86 68, 100 42 Z"
          fill="url(#realFlameMid)"
          animate={{
            scaleY: [1, 0.95, 1.06, 0.97, 1],
            scaleX: [1, 1.04, 0.95, 1.02, 1],
            rotate: [-1.2, 1.8, -1.5, 1.2, -1.2],
          }}
          style={{ transformOrigin: '100px 195px' }}
          transition={{ repeat: Infinity, duration: 1.25, ease: 'easeInOut' }}
        />

        {/* TẦNG 5: LƯỠI LỬA XOÁY TRUNG TÂM (CENTER DANCING LICK) */}
        <motion.path
          d="M 98 70
             C 108 94, 122 116, 122 146
             C 112 136, 106 114, 98 96
             C 94 116, 86 134, 78 146
             C 78 116, 92 94, 98 70 Z"
          fill="url(#realFlameMid)"
          opacity="0.88"
          animate={{
            scaleY: [1, 1.14, 0.91, 1],
            rotate: [-2.5, 3, -2, -2.5],
          }}
          style={{ transformOrigin: '98px 146px' }}
          transition={{ repeat: Infinity, duration: 1.05, ease: 'easeInOut' }}
        />

        {/* TẦNG 6: LÕI LỬA VÀNG SÁNG RỰC (GOLDEN INNER CORE) */}
        <motion.path
          d="M 100 88
             C 110 108, 124 126, 126 152
             C 128 176, 116 188, 100 188
             C 84 188, 72 176, 74 152
             C 76 126, 90 108, 100 88 Z"
          fill="url(#realFlameInner)"
          animate={{
            scaleY: [1, 1.06, 0.94, 1],
            scaleX: [1, 0.95, 1.05, 1],
          }}
          style={{ transformOrigin: '100px 188px' }}
          transition={{ repeat: Infinity, duration: 0.95, ease: 'easeInOut' }}
        />

        {/* TẦNG 7: TÂM TRẮNG NHIỆT ĐỘ CỰC ĐẠI (WHITE-HOT CENTER HEARTH) */}
        <motion.path
          d="M 100 126
             C 107 138, 115 150, 115 166
             C 115 180, 108 185, 100 185
             C 92 185, 85 180, 85 166
             C 85 150, 93 138, 100 126 Z"
          fill="url(#realFlameWhiteHot)"
          animate={{
            scale: [0.92, 1.1, 0.92],
            opacity: [0.85, 1, 0.85],
          }}
          style={{ transformOrigin: '100px 185px' }}
          transition={{ repeat: Infinity, duration: 0.72, ease: 'easeInOut' }}
        />
      </motion.svg>
    </motion.div>
  );
}

/**
 * Hàng lịch 7 ngày trong tuần kiểu Duolingo
 */
function DuolingoWeekTrack({
  isTodayIgnited,
  streakCount,
}: {
  isTodayIgnited: boolean;
  streakCount: number;
}) {
  const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Xác định thứ mấy trong tuần (0: Thứ 2, ..., 6: Chủ Nhật)
  const todayIndex = useMemo(() => {
    const d = new Date().getDay();
    return (d + 6) % 7;
  }, []);

  return (
    <div className="w-full pt-1 pb-2">
      <div className="flex items-center justify-between gap-1.5 px-2 py-3 rounded-2xl bg-base/80 border border-border/80">
        {WEEK_DAYS.map((dayLabel, index) => {
          const isPast = index < todayIndex;
          const isToday = index === todayIndex;
          const isFuture = index > todayIndex;

          // Các ngày quá khứ trong tuần nếu nằm trong chuỗi streak thì sáng
          const wasActiveInStreak = isPast && streakCount > todayIndex - index;

          return (
            <div key={dayLabel} className="flex flex-col items-center gap-1.5 flex-1">
              <span
                className={`text-[10px] font-black uppercase ${
                  isToday
                    ? 'text-amber-400 font-bold'
                    : wasActiveInStreak
                    ? 'text-text-primary'
                    : 'text-text-secondary/60'
                }`}
              >
                {dayLabel}
              </span>

              {/* Vòng tròn ngày */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                {isToday ? (
                  // Ngày hôm nay
                  <div className="relative flex items-center justify-center w-full h-full">
                    {/* Viền phát sáng xung quanh hôm nay */}
                    <motion.div
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="absolute inset-0 rounded-full border-2 border-amber-400/80 bg-amber-500/10 shadow-xs shadow-amber-500/40"
                    />

                    {isTodayIgnited ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -25 }}
                        animate={{ scale: [0, 1.45, 1], rotate: [0, 10, 0] }}
                        transition={{
                          duration: 0.5,
                          times: [0, 0.6, 1],
                          ease: 'easeOut',
                          delay: 0.1,
                        }}
                        className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand to-amber-400 flex items-center justify-center shadow-md shadow-brand/50"
                      >
                        <span className="text-xs">🔥</span>
                      </motion.div>
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-border/80" />
                    )}
                  </div>
                ) : wasActiveInStreak ? (
                  // Ngày đã hoàn thành trước đó trong tuần
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                    <span className="text-[10px]">🔥</span>
                  </div>
                ) : (
                  // Ngày tương lai hoặc chưa học
                  <div
                    className={`w-6 h-6 rounded-full border ${
                      isFuture
                        ? 'border-border/40 bg-surface/50 text-text-secondary/40'
                        : 'border-border/60 bg-base text-text-secondary/50'
                    } flex items-center justify-center`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-border/80" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Nội dung chi tiết của modal khi mở lên
 */
function StreakActivatedModalContent({
  streakCount,
  onClose,
  autoCloseDuration,
}: {
  streakCount: number;
  onClose: () => void;
  autoCloseDuration: number;
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isIgnited, setIsIgnited] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number>(Math.max(0, streakCount - 1));

  const particles = useMemo(() => generateBurstParticles(26), []);

  useEffect(() => {
    // 1. Kích hoạt hiệu ứng bùng nổ và âm thanh sau 350ms
    const igniteTimer = setTimeout(() => {
      setIsIgnited(true);
      playDuolingoCelebrationSound(isMuted);

      // Đếm số nhảy từ (streakCount - 1) lên streakCount
      const countTimer = setTimeout(() => {
        setDisplayNumber(streakCount);
      }, 250);

      return () => clearTimeout(countTimer);
    }, 350);

    // 2. Tự động đóng sau autoCloseDuration (nếu > 0)
    let autoCloseTimer: NodeJS.Timeout | undefined;
    if (autoCloseDuration > 0) {
      autoCloseTimer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
    }

    return () => {
      clearTimeout(igniteTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [streakCount, isMuted, autoCloseDuration, onClose]);

  // Thông điệp động khích lệ theo số ngày streak
  const motivationalMessage = useMemo(() => {
    if (streakCount <= 1) {
      return 'Ngọn lửa học tập đã được thắp sáng rực rỡ! Hãy quay lại vào ngày mai để duy trì chuỗi nhé!';
    }
    if (streakCount < 7) {
      return `Tuyệt vời! Bạn đã kiên trì học bài ${streakCount} ngày liên tiếp. Tiếp tục phát huy nào!`;
    }
    if (streakCount === 7) {
      return 'Xuất sắc! Tròn 1 tuần học tập liên tục không ngừng nghỉ. Bạn thật đáng nể!';
    }
    return `Kỷ lục ấn tượng! ${streakCount} ngày liên tiếp duy trì ngọn lửa đam mê học tập!`;
  }, [streakCount]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none cursor-pointer overflow-hidden"
    >
      {/* Card Container Duolingo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 25 }}
        transition={{ type: 'spring', damping: 18, stiffness: 320, bounce: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm w-full rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-surface via-surface/95 to-base border border-amber-500/40 shadow-2xl shadow-brand/30 text-center overflow-hidden space-y-4 cursor-default"
      >
        {/* Thanh màu gradient cam - vàng trên đỉnh card */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-brand to-rose-500" />

        {/* Nút bật / tắt âm thanh góc phải */}
        <button
          type="button"
          onClick={() => setIsMuted((prev) => !prev)}
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-base/80 border border-border/80 text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors z-20"
          title={isMuted ? 'Bật âm thanh chúc mừng' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Vùng Nhân vật Ngọn lửa & Hiệu ứng Pháo hoa nổ */}
        <div className="relative pt-2 pb-1 flex items-center justify-center">
          {/* Sóng chấn động lửa lan tỏa khi kích hoạt */}
          {isIgnited && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute w-28 h-28 rounded-full border-4 border-amber-400/80 pointer-events-none"
            />
          )}

          {/* Các hạt Confetti & Tia lửa bắn ra 360 độ */}
          {isIgnited &&
            particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.2, 0.7],
                  x: p.x,
                  y: p.y,
                  opacity: [1, 1, 0],
                  rotate: [0, p.rotation],
                }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'sparkle' ? '2px' : '4px',
                }}
                className="absolute pointer-events-none z-0"
              />
            ))}

          {/* Ngọn Lửa Chân Thực & Bùng Cháy */}
          <RealisticStreakFlame isIgnited={isIgnited} />
        </div>

        {/* Nội dung tiêu đề & đếm số bùng nổ */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>STREAK ACTIVATED!</span>
          </div>

          {/* Số ngày đếm với hiệu ứng Scale Punch kiểu Duolingo */}
          <motion.div
            key={displayNumber}
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.35, 1] }}
            transition={{
              duration: 0.45,
              times: [0, 0.6, 1],
              ease: 'easeOut',
            }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2"
          >
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-brand bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              {displayNumber} NGÀY
            </span>
            <span>LIÊN TIẾP!</span>
          </motion.div>

          <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed px-1">
            {motivationalMessage}
          </p>
        </div>

        {/* Hàng lịch tuần 7 ngày của Duolingo */}
        <DuolingoWeekTrack isTodayIgnited={isIgnited} streakCount={streakCount} />

        {/* Nút 3D phong cách Duolingo trứ danh: TIẾP TỤC */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-b from-brand via-amber-600 to-brand border-b-4 border-amber-800 hover:border-amber-900 active:border-b-0 active:translate-y-1 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-brand/25 transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>TIẾP TỤC</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function StreakActivatedPopup({
  isOpen,
  streakCount,
  onClose,
  autoCloseDuration = 7000,
}: StreakActivatedPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <StreakActivatedModalContent
          streakCount={streakCount}
          onClose={onClose}
          autoCloseDuration={autoCloseDuration}
        />
      )}
    </AnimatePresence>
  );
}
