// ISO-2 ülke kodunu bayrak emojisi ve Türkçe ada çevirir. Tarayıcının yerleşik
// Intl.DisplayNames'i kullanılır — ayrı bir ülke listesi paketi taşımaya gerek yok.

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['tr'], { type: 'region' })
    : null;

/** "TR" → "🇹🇷". Geçersiz/bilinmeyen kodda dünya simgesi döner. */
export const countryFlag = (code: string): string => {
  if (!code || code.length !== 2 || code === 'XX') return '🌐';
  const A = 0x1f1e6;
  const base = 'A'.charCodeAt(0);
  return String.fromCodePoint(
    A + (code.toUpperCase().charCodeAt(0) - base),
    A + (code.toUpperCase().charCodeAt(1) - base),
  );
};

/** "TR" → "Türkiye". Bilinmeyen kod "Bilinmiyor" olur. */
export const countryName = (code: string): string => {
  if (!code || code === 'XX') return 'Bilinmiyor';
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};
