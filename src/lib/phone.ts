/**
 * Telefon numaraları API'de E.164 olarak saklanır (+905321112233) — `tel:`
 * bağlantısı için doğru biçim ama ekranda okunmuyor. Burada yalnızca gösterim
 * biçimlendirmesi yapılır; doğrulama API'nin işi (bkz. api `src/utils/phone.js`).
 *
 * Normalize edilmemiş eski kayıtlar (migrateQuotePhones.js çalışmadan önce
 * yazılanlar) olduğu gibi gösterilir — biçime uymayan değeri kırpmak, yanlış
 * numarayı doğru göstermekten daha kötü.
 */
export function formatPhone(e164: string): string {
  const m = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(e164 ?? "");
  return m ? `+90 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : e164;
}
