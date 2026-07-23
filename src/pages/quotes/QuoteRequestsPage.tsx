import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useQuoteRequests, useDeleteQuoteRequest } from '@/hooks/use-quote-requests';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { motion } from 'framer-motion';
import {
  QUOTE_STATUSES, QUOTE_STATUS_LABELS, QUOTE_STATUS_BADGE_CLASSES,
} from '@/lib/quoteStatuses';
import type { QuoteStatus } from '@/lib/quoteStatuses';
import { formatPhone } from '@/lib/phone';

const PAGE_SIZE = 25;

// Arama/filtre değişince sayfa 1'e dönmeli — 3. sayfadayken filtre daraltılırsa
// sonuç 1 sayfaya düşer ve kullanıcı boş bir sayfada kalırdı.
const ALL_STATUSES = '__all__';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const QuoteRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<QuoteStatus | ''>('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuoteRequests({
    search: searchTerm,
    status,
    page,
    limit: PAGE_SIZE,
  });
  const deleteQuoteRequest = useDeleteQuoteRequest();

  const quotes = data?.items ?? [];
  const pageCount = data?.pageCount ?? 1;

  return (
    <Layout title="Teklif İstekleri">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İsim, telefon veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 bg-card"
              />
            </div>
            <Select
              value={status === '' ? ALL_STATUSES : status}
              onValueChange={(value) => {
                setStatus(value === ALL_STATUSES ? '' : (value as QuoteStatus));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44 bg-card">
                <SelectValue placeholder="Tüm durumlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>Tüm durumlar</SelectItem>
                {QUOTE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data && (
            <span className="text-sm text-muted-foreground">
              Toplam {data.total} talep
            </span>
          )}
        </div>

        <div className="rounded-md border border-border bg-card overflow-x-auto">
          {isLoading ? (
            <TableSkeleton columns={8} rows={5} />
          ) : quotes.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[190px]">Müşteri</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>İl</TableHead>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Sürüm</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote, i) => (
                  <motion.tr
                    key={quote.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="font-medium">
                      {quote.customer.fullName}
                      {quote.customer.email && (
                        <div className="text-xs font-normal text-muted-foreground">
                          {quote.customer.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {/* Telefonu tıklanabilir yapıyoruz — masaüstü/mobil arama uygulaması açılır */}
                      <a href={`tel:${quote.customer.phone}`} className="hover:text-primary">
                        {formatPhone(quote.customer.phone)}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {quote.customer.province || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {quote.itemCount ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {/* v1'de rozet göstermiyoruz — revize edilmiş teklifler göze çarpsın */}
                      {quote.currentVersion > 1 ? (
                        <Badge variant="outline" className="font-medium">v{quote.currentVersion}</Badge>
                      ) : (
                        <span className="text-muted-foreground/60">v1</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      ₺{Math.round(quote.totalPrice).toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-medium ${QUOTE_STATUS_BADGE_CLASSES[quote.status]}`}>
                        {QUOTE_STATUS_LABELS[quote.status] ?? quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(quote.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/quote-requests/${quote.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(quote.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium">Teklif isteği yok</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || status
                  ? 'Bu filtreye uyan talep bulunamadı.'
                  : 'Müşteriler planner üzerinden teklif istediğinde burada listelenir.'}
              </p>
            </div>
          )}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" /> Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Sonraki <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteQuoteRequest.mutate({ id: deleteId });
          setDeleteId(null);
        }}
        title="Teklif isteğini sil"
        description="Bu teklif isteği kalıcı olarak silinecek. Bu işlem geri alınamaz."
      />
    </Layout>
  );
};
