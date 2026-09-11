/**
 * Web Audio API Sound Effects Utility
 * Cung cấp các hiệu ứng âm thanh tổng hợp trong trẻo, nhẹ nhàng và 0ms latency.
 * Không cần tải bất kỳ file mp3 nào từ bên ngoài, hoạt động offline 100%.
 */

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
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
 * Sử dụng 2 nốt cao hài hòa (E6 1318.5Hz -> B6 1975.5Hz) dạng Triangle wave kèm decay tự nhiên
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
    gain1.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Nốt 2: B6 (~1975.5 Hz) - Ting cao ngân vang sau 80ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1975.53, now + 0.09);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.001, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.26, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.09);
    osc2.stop(now + 0.45);
  } catch {
    // Bỏ qua nếu có lỗi âm thanh để không ảnh hưởng luồng chính
  }
}

/**
 * Phát âm thanh nhẹ khi người dùng trả lời sai (thấp và êm dịu, không gây khó chịu)
 */
export function playIncorrectChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now); // E4
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.22); // C4

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    // Bỏ qua lỗi
  }
}
