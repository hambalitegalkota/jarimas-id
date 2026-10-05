/**
 * Web Audio API Notification Synthesizer & Browser Alert Utilities
 * Jarimas-ID Global Notification System
 */

// Track audio context singleton
let audioCtx: AudioContext | null = null;
let titleInterval: any = null;
let originalDocumentTitle = "";
let isTabFlashing = false;

/**
 * Memutar suara notifikasi yang lembut, modern, dan terdengar jelas (Melodic 3-tone chime)
 * Menggunakan Web Audio API asli tanpa perlu file audio eksternal.
 */
export function playNotificationChime(isMuted: boolean = false): void {
  if (isMuted || typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Tone 1: Soft sparkling intro (D5 - 587.33 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.025);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: Bright ascending major chime (A5 - 880.00 Hz)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.1);

    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.24, now + 0.13);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);

    // Tone 3: Harmonic overtone shimmer (F#6 - 1479.98 Hz)
    const osc3 = audioCtx.createOscillator();
    const gain3 = audioCtx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(1479.98, now + 0.18);

    gain3.gain.setValueAtTime(0, now + 0.18);
    gain3.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc3.connect(gain3);
    gain3.connect(audioCtx.destination);

    osc3.start(now + 0.18);
    osc3.stop(now + 0.7);
  } catch (err) {
    // Browser may restrict audio before initial user gesture
    console.debug("Audio autoplay notice:", err);
  }
}

/**
 * Getar haptik pada perangkat smartphone/mobile yang mendukung Vibration API
 */
export function triggerNotificationHaptics(): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      // Double tap pulse: 100ms vibrate, 50ms pause, 120ms vibrate
      navigator.vibrate([100, 50, 120]);
    } catch {
      // Ignore
    }
  }
}

/**
 * Mengubah judul tab browser secara bergantian untuk menarik perhatian pengguna
 * ketika mereka sedang melihat tab lain atau scrolling halaman.
 */
export function startTabTitleFlash(
  senderName: string,
  unreadCount: number = 1
): void {
  if (typeof document === "undefined") return;

  if (!isTabFlashing) {
    originalDocumentTitle = document.title || "JARIMAS-ID";
    isTabFlashing = true;
  }

  clearInterval(titleInterval);
  let toggle = false;

  const countBadge = unreadCount > 1 ? `(${unreadCount}) ` : "(1) ";
  const cleanSender = (senderName || "Warga").split(" ")[0];

  titleInterval = setInterval(() => {
    if (typeof document === "undefined") return;
    if (toggle) {
      document.title = `${countBadge}💬 Pesan Baru dari ${cleanSender}!`;
    } else {
      document.title = `🔔 Tanggapi Pesan Masuk - JARIMAS-ID`;
    }
    toggle = !toggle;
  }, 1100);
}

/**
 * Mengembalikan judul tab browser ke teks aslinya
 */
export function stopTabTitleFlash(): void {
  if (typeof document === "undefined") return;

  if (titleInterval) {
    clearInterval(titleInterval);
    titleInterval = null;
  }

  if (isTabFlashing && originalDocumentTitle) {
    document.title = originalDocumentTitle;
  }

  isTabFlashing = false;
}
