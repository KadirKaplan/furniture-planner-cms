import { useQuery } from '@tanstack/react-query';
import { getAnalyticsSummary } from '../services/analytics';
import { useAuth } from '@/contexts/AuthContext';

/**
 * "İstatistikler" ekranının ziyaret özetini çeker. 5 dakikada bir tazelenir —
 * ziyaret sayacının saniye saniye güncel olması gerekmiyor, bu aralık yeterli.
 * Yalnızca giriş yapılmışken çalışır (uç admin'e kapalı; oturumsuzken 401 döner).
 */
export const useAnalyticsSummary = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalyticsSummary,
    enabled: isAuthenticated,
    refetchInterval: 5 * 60_000,
    retry: false,
  });
};
