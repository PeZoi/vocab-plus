/**
 * Web Audio API Sound Effects Utility
 * Cung cấp các hiệu ứng âm thanh tổng hợp trong trẻo, nhẹ nhàng và 0ms latency.
 * Không cần tải bất kỳ file mp3 nào từ bên ngoài, hoạt động offline 100%.
 */

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  try {
    if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioContext = new AudioContextClass();
      }
    }

    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {
        // Trình duyệt có thể chặn nếu chưa có tương tác
      });
    }

    return sharedAudioContext;
  } catch (e) {
    console.warn('Không thể khởi tạo Web Audio API:', e);
    return null;
  }
}

/**
 * Phát âm thanh "Ting Ting" chuông ngân vui tươi, trong trẻo khi người dùng trả lời ĐÚNG
 * Sử dụng 2 nốt cao hài hòa (E6 1318.5Hz -> B6 1975.5Hz) dạng Triangle/Sine wave kèm decay tự nhiên
 */
export function playCorrectChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Nốt 1: E6 (~1318.5 Hz) - Ting nhẹ
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1318.51, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.24, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Nốt 2: B6 (~1975.5 Hz) - Ting cao ngân vang sau 80ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, now + 0.08);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.001, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.28, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // Bỏ qua lỗi âm thanh để không ảnh hưởng luồng chính
  }
}

/**
 * Phát âm thanh khi người dùng trả lời SAI
 * 2 nốt trầm nhẹ nhàng (C4 261.63Hz -> G3 196.00Hz), rõ ràng và lịch sự, không gây khó chịu
 */
export function playIncorrectChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Nốt 1: C4 (261.63 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(261.63, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.18);

    // Nốt 2: G3 (196.00 Hz) - Thấp hơn sau 90ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(196.0, now + 0.09);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.001, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.16, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.09);
    osc2.stop(now + 0.3);
  } catch {
    // Bỏ qua lỗi âm thanh
  }
}

/**
 * Âm thanh ăn mừng Streak bùng nổ, rực rỡ và hấp dẫn:
 * 1. Âm thanh bùng lửa (Whoosh & Roar)
 * 2. Hợp âm chiến thắng Fanfare arpeggio (C5 -> E5 -> G5 -> C6 -> E6)
 * 3. Chuông ánh kim lấp lánh (Shimmer chimes G6, C7)
 */
export function playStreakCelebrationSound(muted = false): void {
  if (muted || typeof window === 'undefined') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // 1. Tiếng lửa bùng cháy (Whoosh / Fire burst)
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, now);
    filter.frequency.exponentialRampToValueAtTime(130, now + 0.35);
    filter.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.28, now + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // 2. Hợp âm vươn lên kiểu Fanfare rạng rỡ (C5, E5, G5, C6, E6)
    const chordNotes = [
      { freq: 523.25, time: 0.12, dur: 0.45 }, // C5
      { freq: 659.25, time: 0.19, dur: 0.45 }, // E5
      { freq: 783.99, time: 0.26, dur: 0.48 }, // G5
      { freq: 1046.5, time: 0.34, dur: 0.55 }, // C6
      { freq: 1318.51, time: 0.42, dur: 0.7 }, // E6 - Nốt đỉnh ngân vang
    ];

    chordNotes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.24, now + time + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });

    // 3. Chuông lấp lánh (Sparkle Shimmer) nổ ra sau khi hợp âm đạt đỉnh
    const sparkles = [
      { freq: 1567.98, time: 0.46, dur: 0.4 }, // G6
      { freq: 2093.0, time: 0.52, dur: 0.5 }, // C7
    ];

    sparkles.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.linearRampToValueAtTime(0.18, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  } catch {
    // Tự động bỏ qua nếu trình duyệt chặn autoplay audio
  }
}

/**
 * Âm thanh ngọn lửa nhẹ nhàng khi click/tương tác với huy hiệu Streak Header
 */
export function playFlameSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Mini whoosh lửa
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);
    filter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);

    // Chuông nhỏ vui vẻ (E6)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1318.51, now + 0.05);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.setValueAtTime(0.001, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + 0.05);
    osc.stop(now + 0.28);
  } catch {
    // Bỏ qua lỗi
  }
}
