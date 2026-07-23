import { api } from './api';
import type { QuoteStatus } from '@/lib/quoteStatuses';

// Revizyon anındaki modül satırı — kayıt oluşturulurken kopyalandığı için modül CMS'ten
// sonradan silinse/yeniden adlandırılsa bile o revizyon olduğu gibi kalır.
export interface QuoteModuleLine {
  name: string;
  slug: string;
  type: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuoteItem {
  /** Ürün referansı — ürün silinmiş olabilir, görüntülemede productName kullanılır */
  product?: string;
  productName?: string;
  categorySlug?: string;
  width?: number;
  height?: number;
  depth?: number;
  materialName?: string;
  colorName?: string;
  modules: QuoteModuleLine[];
  /** Modüller hariç gövde fiyatı */
  bodyPrice?: number;
  finalPrice?: number;
}

/**
 * Teklifin bir sürümü. Müşterinin ilk gönderimi v1 (createdBy.kind === "customer"),
 * showroom'da yapılan düzenlemeler v2, v3… (kind === "admin"). Dizi append-only:
 * geçmiş revizyonlar değişmez, güncel olan her zaman sonuncusudur.
 */
export interface QuoteRevision {
  version: number;
  items: QuoteItem[];
  room?: { width?: number; depth?: number; height?: number };
  totalPrice?: number;
  snapshotUrl?: string;
  /** Planner'ın sahneyi yeniden kurmak için kullandığı ham tasarım — CMS bunu göstermez */
  design?: unknown;
  createdBy: {
    kind: 'customer' | 'admin';
    user?: string;
    name?: string;
  };
  note?: string;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    province?: string;
    note?: string;
  };
  revisions: QuoteRevision[];
  /** Son revizyondan türetilir — liste sorgusu revisions'ı yüklemeden bunları okur */
  currentVersion: number;
  totalPrice: number;
  itemCount: number;
  snapshotUrl?: string;
  currency: string;
  status: QuoteStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

/** Liste ucu revisions'ı döndürmez (performans) — o yüzden ayrı tip */
export type QuoteRequestListItem = Omit<QuoteRequest, 'revisions'>;

export interface QuoteRequestListResult {
  items: QuoteRequestListItem[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface QuoteRequestFilters {
  status?: QuoteStatus | '';
  search?: string;
  page?: number;
  limit?: number;
}

export const getQuoteRequests = async (filters: QuoteRequestFilters = {}) => {
  const { data } = await api.get('/quote-requests', {
    params: {
      status: filters.status || undefined,
      search: filters.search || undefined,
      page: filters.page,
      limit: filters.limit,
    },
  });
  return data.data as QuoteRequestListResult;
};

export const getQuoteRequest = async (id: string) => {
  const { data } = await api.get(`/quote-requests/${id}`);
  return data.data as QuoteRequest;
};

// Yalnızca durum ve admin notu değiştirilebilir — müşteri bilgisi ve revizyon geçmişi
// kanıt kaydıdır, API de diğer alanları reddeder.
export const updateQuoteRequest = async (
  id: string,
  payload: { status?: QuoteStatus; adminNote?: string }
) => {
  const { data } = await api.put(`/quote-requests/${id}`, payload);
  return data;
};

export const deleteQuoteRequest = async (id: string) => {
  const { data } = await api.delete(`/quote-requests/${id}`);
  return data;
};

export const getQuoteRequestStats = async () => {
  const { data } = await api.get('/quote-requests/stats');
  return data.data as { total: number; byStatus: Record<QuoteStatus, number> };
};

/**
 * Teklifi planner'da açmak için kısa ömürlü bir oturum bağlantısı üretir. Dönen URL
 * admin JWT'si taşımaz — yalnızca o teklife kilitli, süreli bir yetki belgesi
 * (bkz. API services/plannerSessionService.js).
 */
export const createPlannerSession = async ({
  id,
  version,
}: {
  id: string;
  /** Açılacak revizyon; verilmezse güncel (son) sürüm açılır */
  version?: number;
}) => {
  const { data } = await api.post(`/quote-requests/${id}/planner-session`, null, {
    params: { version },
  });
  return data.data as {
    token: string;
    url: string;
    version: number;
    expiresInSeconds: number;
  };
};
