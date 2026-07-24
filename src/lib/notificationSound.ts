let audioCtx: AudioContext | null = null;
let unlocked = false;

const getContext = (): AudioContext => {
  audioCtx ??= new AudioContext();
  return audioCtx;
};

const unlock = () => {
  if (unlocked) return;
  unlocked = true;
  const ctx = getContext();
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
};

// Bildirim sesi arka planda react-query'nin polling'inden tetiklenir — kullanıcı
// jesti YOKTUR. Tarayıcıların autoplay politikası jestsiz AudioContext'i
// başlatmayı reddedebilir, o yüzden context'i sayfadaki ilk tıklama/tuş basımında
// önceden kilidini açılmış hale getiriyoruz. Bu olmadan rozet güncellenir ama
// ses resume() promise'i çözülmediği için sessizce çalmayabilir.
if (typeof document !== 'undefined') {
  const events = ['pointerdown', 'keydown'] as const;
  const handler = () => {
    unlock();
    events.forEach((e) => document.removeEventListener(e, handler));
  };
  events.forEach((e) => document.addEventListener(e, handler));
}

const scheduleDing = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.25);
  });
};

/**
 * Kenar çubuğunda yeni teklif geldiğinde çalınan kısa "ding" sesi. Ses dosyası
 * yerine Web Audio API osilatörü kullanılıyor — ek asset yönetimi gerekmiyor.
 */
export const playNewQuoteSound = () => {
  try {
    const ctx = getContext();
    // Context hâlâ suspended ise (kilit açma jesti hiç olmadıysa) çalmadan önce
    // resume'un gerçekten bitmesini bekle — aksi halde ses hiç duyulmaz.
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => scheduleDing(ctx)).catch(() => {});
    } else {
      scheduleDing(ctx);
    }
  } catch {
    // Ses API'si desteklenmiyor/engellenmiş olabilir — sessizce yut, rozet zaten yeterli sinyal.
  }
};
