import { api } from './api';

export interface RangeStats {
  /** Toplam sayfa açılışı (aynı kişinin tekrarları dahil) */
  visits: number;
  /** Tekil ziyaretçi (çerezsiz günlük hash'e göre) */
  visitors: number;
}

export interface DailyPoint {
  /** "YYYY-MM-DD" (Europe/Istanbul) */
  day: string;
  visits: number;
  visitors: number;
}

/** Ülke/bölge/şehir/tarayıcı/OS/cihaz/kaynak kırılımlarının ortak şekli */
export interface BreakdownItem {
  /** Kırılım değeri: ISO ülke kodu, bölge/şehir adı, "Chrome", "google.com", "direct"… */
  key: string;
  visits: number;
  visitors: number;
}

export interface AnalyticsSummary {
  totals: {
    today: RangeStats;
    last7: RangeStats;
    last30: RangeStats;
    allTime: RangeStats;
  };
  /** Önceki eşdeğer dönem — tile'lardaki % değişim için */
  previous: {
    last7: RangeStats;
    last30: RangeStats;
  };
  /** Son 30 günün günlük serisi (grafik için, artan sırada) */
  daily: DailyPoint[];
  /** Aşağıdaki kırılımların hepsi son 30 gün, ziyaretçiye göre azalan */
  countries: BreakdownItem[];
  regions: BreakdownItem[];
  cities: BreakdownItem[];
  browsers: BreakdownItem[];
  os: BreakdownItem[];
  devices: BreakdownItem[];
  sources: BreakdownItem[];
}

export const getAnalyticsSummary = async () => {
  const { data } = await api.get('/analytics/summary');
  return data.data as AnalyticsSummary;
};
