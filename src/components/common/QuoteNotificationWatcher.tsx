import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useQuoteRequestStats } from '@/hooks/use-quote-requests';
import { playNewQuoteSound } from '@/lib/notificationSound';
import { flashTitle } from '@/lib/titleFlash';

const QUOTE_REQUESTS_HREF = '/quote-requests';

/**
 * Yeni teklif geldiğinde ses + sağ üst toast + sekme başlığı bildirimini tetikler.
 *
 * Sidebar/Layout her sayfa kendi içinde render ettiği için (bkz. her *Page.tsx'in
 * kendi <Layout>'u) sayfa geçişlerinde tamamen unmount/remount olur. Bildirim
 * mantığı orada yaşasaydı, previousCountRef her navigasyonda sıfırlanır ve tam o
 * remount anına denk gelen bir artış sessizce kaçırılırdı. Bu yüzden bu izleyici
 * App.tsx'te Router'ın dışında, sayfa geçişlerinden etkilenmeyen TEK bir yerde
 * mount edilir. Sidebar hâlâ aynı sorguyu okuyup rozeti gösterir — o taraf remount
 * olsa da sorun değil, rozet zaten her render'da güncel sayıyı yansıtır.
 */
export const QuoteNotificationWatcher = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: quoteStats } = useQuoteRequestStats();
  // Toplam kayıt sayısı — status'tan BAĞIMSIZ, yalnızca yeni bir teklif oluşunca
  // artar (silme dışında hiçbir admin işlemiyle azalmaz). "yeni" durumundaki sayıyı
  // (byStatus.yeni) kullanmak yanlıştı: admin aynı ~60 sn poll penceresinde eski
  // "yeni" talepleri işleme alırken yeni talepler de gelirse net sayı düşebilir/aynı
  // kalabilir ve artış hiç yakalanmazdı — gerçekten yeni gelen teklifler sessizce
  // kaçırılıyordu. total, aritmetik olarak "kaç yeni kayıt eklendi"yi birebir verir.
  const totalCount = quoteStats?.total ?? 0;

  // Sayaç ilk yüklemede değil, YÜKSELİRKEN bildirilir — açılışta zaten bekleyen
  // teklifler için ses/kart tetiklenmez, yalnızca yeni gelenler bildirilir.
  const previousCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (previousCountRef.current !== null && totalCount > previousCountRef.current) {
      const arrivedCount = totalCount - previousCountRef.current;
      const message = arrivedCount === 1 ? 'Yeni bir teklif isteği geldi' : `${arrivedCount} yeni teklif isteği geldi`;
      playNewQuoteSound();
      toast.info(message, {
        action: { label: 'Görüntüle', onClick: () => setLocation(QUOTE_REQUESTS_HREF) },
      });
      flashTitle(message);
      // Teklif İstekleri listesi/detayı o an açık olabilir — sadece rozet/toast
      // güncellenip liste bayat kalırsa admin manuel F5 atmak zorunda kalır.
      // Aynı ön eki paylaşan tüm sorguları geçersiz kılmak, açık ekranı sessizce
      // tazeler (kapalıysa zaten sonraki mount'ta taze veri çekilir).
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
    }
    previousCountRef.current = totalCount;
  }, [totalCount, setLocation, queryClient]);

  return null;
};
