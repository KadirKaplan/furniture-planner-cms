// Teklif isteği durumları — API'deki config/quoteStatuses.js ile birebir aynı kapalı
// küme. Değerler DB'ye yazıldığı için değiştirilemez; yalnızca etiketler burada
// Türkçeleştirilir. Yeni durum eklenecekse önce API enum'u güncellenmeli.
export const QUOTE_STATUSES = ['yeni', 'inceleniyor', 'arandi', 'tamamlandi', 'iptal'] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  yeni: 'Yeni',
  inceleniyor: 'İnceleniyor',
  arandi: 'Arandı',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
};

// Liste ve detaydaki rozet renkleri. "yeni" dikkat çeksin diye vurgu rengiyle,
// kapanmış durumlar (tamamlandı/iptal) sönük tonlarla gösterilir.
export const QUOTE_STATUS_BADGE_CLASSES: Record<QuoteStatus, string> = {
  yeni: 'bg-primary/10 text-primary border-primary/20',
  inceleniyor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  arandi: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  tamamlandi: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  iptal: 'bg-muted text-muted-foreground border-border',
};
