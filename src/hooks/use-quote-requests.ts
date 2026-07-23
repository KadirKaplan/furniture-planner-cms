import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuoteRequests,
  getQuoteRequest,
  updateQuoteRequest,
  deleteQuoteRequest,
  getQuoteRequestStats,
  createPlannerSession,
} from '../services/quoteRequests';
import type { QuoteRequestFilters } from '../services/quoteRequests';
import type { QuoteStatus } from '@/lib/quoteStatuses';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { getApiErrorMessage } from '@/lib/utils';

export const useQuoteRequests = (filters: QuoteRequestFilters = {}) => {
  return useQuery({
    // Filtreler anahtarın parçası — durum/arama/sayfa değiştiğinde ayrı bir önbellek
    // girdisi olur ve geri dönüldüğünde eski sonuç anında gösterilir.
    queryKey: ['quote-requests', filters],
    queryFn: () => getQuoteRequests(filters),
  });
};

export const useQuoteRequest = (id: string | null) => {
  return useQuery({
    queryKey: ['quote-requests', id],
    queryFn: () => getQuoteRequest(id!),
    enabled: !!id,
  });
};

/**
 * Kenar çubuğundaki "okunmamış teklif" rozetini besler. Teklifler admin bir işlem
 * yapmadan (müşteri planner'dan gönderdiğinde) geldiği için sorgu periyodik olarak
 * tazelenir — aksi halde rozet ancak sayfa yenilenince güncellenirdi.
 *
 * 60 sn: showroom'da anlık bildirim beklentisi yok, sayaç birkaç dakika geç görünse
 * sorun olmaz; daha sık yoklamak her admin sekmesi için gereksiz istek üretir.
 * Sekme arkaplandayken yoklama durur, öne gelince hemen tazelenir.
 */
export const useQuoteRequestStats = () => {
  return useQuery({
    queryKey: ['quote-requests', 'stats'],
    queryFn: getQuoteRequestStats,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    // Yetkisiz kullanıcıda (admin olmayan rol) 403 döner; tekrar denemenin anlamı yok,
    // rozet sessizce görünmez kalır.
    retry: false,
  });
};

export const useUpdateQuoteRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: QuoteStatus; adminNote?: string } }) =>
      updateQuoteRequest(id, data),
    onSuccess: () => {
      // Liste, detay ve istatistik aynı ön eki paylaşır — hepsi birden tazelenir.
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
      toast.success('Teklif isteği güncellendi');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Güncellenirken bir hata oluştu'));
    },
  });
};

/**
 * Teklifi planner'da açar. Bağlantı sunucuda üretilir ve yeni sekmede açılır —
 * showroom'da CMS ekranı açık kalsın diye aynı sekmede gezinilmez.
 *
 * Pencere açma isteği tıklamadan SONRA (async yanıt geldiğinde) yapıldığı için
 * tarayıcı pop-up engelleyicisi devreye girebilir; o durumda kullanıcı sessizce
 * hiçbir şey olmadığını sanmasın diye bağlantı panoya kopyalanır ve uyarılır.
 */
export const useOpenInPlanner = () => {
  return useMutation({
    mutationFn: createPlannerSession,
    onSuccess: (session: { url: string; version: number }) => {
      const opened = window.open(session.url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        navigator.clipboard?.writeText(session.url);
        toast.warning('Açılır pencere engellendi — bağlantı panoya kopyalandı');
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Planner bağlantısı oluşturulamadı'));
    },
  });
};

export const useDeleteQuoteRequest = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ id }: { id: string; redirect?: boolean }) => deleteQuoteRequest(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
      toast.success('Teklif isteği silindi');
      // Detay sayfasından silindiyse listeye dön — silinen kaydın sayfasında kalınamaz.
      if (variables.redirect) setLocation('/quote-requests');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Silinirken bir hata oluştu'));
    },
  });
};
