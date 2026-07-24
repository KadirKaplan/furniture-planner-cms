let originalTitle: string | null = null;
let flashInterval: number | null = null;

const stopFlash = () => {
  if (flashInterval !== null) {
    window.clearInterval(flashInterval);
    flashInterval = null;
  }
  if (originalTitle !== null) {
    document.title = originalTitle;
    originalTitle = null;
  }
};

if (typeof document !== 'undefined') {
  // Sekmeye dönülünce (odaklanma veya görünürlük) yanıp sönme durur ve başlık
  // eski haline döner — bildirim yalnızca admin bakmıyorken dikkat çekmeli.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) stopFlash();
  });
  window.addEventListener('focus', stopFlash);
}

/**
 * Sekme başlığını bildirim mesajıyla ve orijinal başlıkla sırayla değiştirerek
 * "yanıp sönen" bir uyarı oluşturur — admin başka bir sekmedeyken (sekme "Eyce
 * Studio CMS" yerine "Yeni teklif isteği" gibi) fark etmesi için. Sekme zaten
 * görünürse hiçbir şey yapmaz.
 */
export const flashTitle = (message: string) => {
  if (!document.hidden) return;
  if (originalTitle === null) originalTitle = document.title;
  if (flashInterval !== null) window.clearInterval(flashInterval);

  let showingMessage = true;
  document.title = message;
  flashInterval = window.setInterval(() => {
    document.title = showingMessage ? originalTitle! : message;
    showingMessage = !showingMessage;
  }, 1000);
};
