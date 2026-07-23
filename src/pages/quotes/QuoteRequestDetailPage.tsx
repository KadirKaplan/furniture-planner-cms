import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useParams, Link } from 'wouter';
import {
  useQuoteRequest, useUpdateQuoteRequest, useDeleteQuoteRequest, useOpenInPlanner,
} from '@/hooks/use-quote-requests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { cn } from '@/lib/utils';
import { formatPhone } from '@/lib/phone';
import {
  ArrowLeft, Phone, Mail, MapPin, Trash2, Save, ImageOff, ExternalLink, User, Store,
} from 'lucide-react';
import {
  QUOTE_STATUSES, QUOTE_STATUS_LABELS, QUOTE_STATUS_BADGE_CLASSES,
} from '@/lib/quoteStatuses';
import type { QuoteStatus } from '@/lib/quoteStatuses';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

const money = (value?: number) =>
  `₺${Math.round(value ?? 0).toLocaleString('tr-TR')}`;

export const QuoteRequestDetailPage = () => {
  const params = useParams();
  const id = params.id ?? null;

  const { data: quote, isLoading } = useQuoteRequest(id);
  const updateQuoteRequest = useUpdateQuoteRequest();
  const deleteQuoteRequest = useDeleteQuoteRequest();
  const openInPlanner = useOpenInPlanner();

  const [status, setStatus] = useState<QuoteStatus>('yeni');
  const [adminNote, setAdminNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Hangi revizyonun gösterildiği. null = güncel (son) revizyon.
  const [viewVersion, setViewVersion] = useState<number | null>(null);

  // Kayıt yüklendiğinde/değiştiğinde formu sunucudaki hale eşitle.
  useEffect(() => {
    if (!quote) return;
    setStatus(quote.status);
    setAdminNote(quote.adminNote ?? '');
  }, [quote]);

  const isDirty =
    !!quote && (status !== quote.status || adminNote !== (quote.adminNote ?? ''));

  if (isLoading) {
    return (
      <Layout title="Teklif İsteği">
        <CardSkeleton />
      </Layout>
    );
  }

  if (!quote) {
    return (
      <Layout title="Teklif İsteği">
        <div className="rounded-md border border-border bg-card p-10 text-center">
          <p className="font-medium">Teklif isteği bulunamadı</p>
          <Link href="/quote-requests">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Listeye dön
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Revizyonlar en yeniden eskiye listelenir; seçili olan yoksa sonuncusu gösterilir.
  const revisions = [...quote.revisions].sort((a, b) => b.version - a.version);
  const latest = revisions[0];
  const shown = revisions.find((r) => r.version === viewVersion) ?? latest;
  const isViewingOld = !!shown && !!latest && shown.version !== latest.version;

  return (
    <Layout title="Teklif İsteği">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/quote-requests">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" /> Teklif İstekleri
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`font-medium ${QUOTE_STATUS_BADGE_CLASSES[quote.status]}`}>
              {QUOTE_STATUS_LABELS[quote.status] ?? quote.status}
            </Badge>
            <span className="text-sm text-muted-foreground">{formatDate(quote.createdAt)}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* ── Sol: tasarım görseli + ürün dökümü ── */}
          <div className="space-y-6">
            {isViewingOld && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                v{shown.version} görüntüleniyor — bu eski bir revizyon. Güncel sürüm v{latest.version}.
              </div>
            )}

            <div className="rounded-md border border-border bg-card overflow-hidden">
              {shown?.snapshotUrl ? (
                <img
                  src={shown.snapshotUrl}
                  alt={`Tasarım v${shown.version}`}
                  className="w-full object-cover max-h-[420px]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                  <ImageOff className="h-8 w-8 opacity-50" />
                  <p className="text-sm">Bu revizyon için sahne görüntüsü kaydedilmemiş</p>
                </div>
              )}
            </div>

            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between p-4">
                <h3 className="font-semibold">
                  Tasarım v{shown?.version} · {shown?.items.length ?? 0} ürün
                </h3>
                {shown?.room?.width != null && (
                  <span className="text-sm text-muted-foreground">
                    Oda: {shown.room.width}×{shown.room.depth}×{shown.room.height} cm
                  </span>
                )}
              </div>
              <Separator />

              <div className="divide-y divide-border">
                {shown?.items.map((item, i) => (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">{item.productName ?? 'Ürün'}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.width}×{item.height}×{item.depth} cm
                          {item.materialName ? ` · ${item.materialName}` : ''}
                          {item.colorName ? ` · ${item.colorName}` : ''}
                        </p>
                      </div>
                      <span className="font-medium text-primary whitespace-nowrap">
                        {money(item.finalPrice)}
                      </span>
                    </div>

                    <div className="space-y-1 rounded-md bg-muted/30 p-3 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Gövde{item.materialName ? ` — ${item.materialName}` : ''}</span>
                        <span>{money(item.bodyPrice)}</span>
                      </div>
                      {item.modules.map((m, j) => (
                        <div key={j} className="flex justify-between text-muted-foreground">
                          <span>{m.name} × {m.quantity}</span>
                          <span>{money(m.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex items-center justify-between p-4">
                <span className="font-semibold">Toplam</span>
                <span className="text-xl font-bold text-primary">{money(shown?.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* ── Sağ: müşteri + revizyonlar + durum ── */}
          <div className="space-y-6">
            <div className="rounded-md border border-border bg-card p-4 space-y-4">
              <h3 className="font-semibold">Müşteri</h3>

              <p className="text-lg font-medium">{quote.customer.fullName}</p>

              <div className="space-y-2 text-sm">
                <a
                  href={`tel:${quote.customer.phone}`}
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  {formatPhone(quote.customer.phone)}
                </a>

                {quote.customer.email && (
                  <a
                    href={`mailto:${quote.customer.email}`}
                    className="flex items-center gap-2 hover:text-primary break-all"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    {quote.customer.email}
                  </a>
                )}

                {quote.customer.province && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {quote.customer.province}
                  </div>
                )}
              </div>

              {quote.customer.note && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                      Müşteri notu
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{quote.customer.note}</p>
                  </div>
                </>
              )}
            </div>

            {/* ── Revizyon geçmişi ── */}
            <div className="rounded-md border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Revizyonlar</h3>
                <span className="text-xs text-muted-foreground">{revisions.length} sürüm</span>
              </div>

              <div className="space-y-1.5">
                {revisions.map((rev) => {
                  const active = rev.version === shown?.version;
                  const isCustomer = rev.createdBy.kind === 'customer';
                  return (
                    <button
                      key={rev.version}
                      onClick={() => setViewVersion(rev.version)}
                      className={cn(
                        'w-full rounded-md border px-3 py-2 text-left transition-colors',
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/40'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          {isCustomer
                            ? <User className="h-3.5 w-3.5 text-muted-foreground" />
                            : <Store className="h-3.5 w-3.5 text-muted-foreground" />}
                          v{rev.version}
                          {rev.version === latest.version && (
                            <span className="text-[10px] font-semibold uppercase text-primary">güncel</span>
                          )}
                        </span>
                        <span className="text-sm font-medium text-primary">
                          {money(rev.totalPrice)}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {isCustomer ? 'Müşteri' : rev.createdBy.name ?? 'Yönetici'} · {formatShortDate(rev.createdAt)}
                      </div>
                      {rev.note && (
                        <div className="mt-1 text-xs text-muted-foreground italic">{rev.note}</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <Separator />

              {/* Yukarıda hangi revizyon seçiliyse o açılır — eski bir sürüme dönüp
                  "buradan devam edelim" demek showroom'da sık ihtiyaç. Kaydetme her
                  hâlükârda sona yeni revizyon ekler; açılan sürümün üzerine yazılmaz. */}
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={openInPlanner.isPending}
                onClick={() => openInPlanner.mutate({ id: quote.id, version: shown?.version })}
              >
                <ExternalLink className="h-4 w-4" />
                {openInPlanner.isPending
                  ? 'Bağlantı hazırlanıyor…'
                  : `v${shown?.version}'i Planner'da Aç`}
              </Button>
              <p className="text-xs text-muted-foreground">
                {isViewingOld
                  ? `v${shown.version} yeni sekmede açılır. Kaydederseniz v${latest.version + 1} olarak eklenir — v${shown.version} ve sonraki sürümler korunur.`
                  : 'Tasarım yeni sekmede açılır. Yaptığınız değişiklik kaydedilirse yeni bir revizyon oluşur, geçmiş sürümler korunur.'}
              </p>
            </div>

            <div className="rounded-md border border-border bg-card p-4 space-y-4">
              <h3 className="font-semibold">Durum</h3>

              <Select value={status} onValueChange={(v) => setStatus(v as QuoteStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUOTE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Dahili not
                </label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Görüşme notları, verilen fiyat vb."
                  rows={4}
                  maxLength={2000}
                  className="mt-1.5"
                />
              </div>

              <Button
                className="w-full gap-2"
                disabled={!isDirty || updateQuoteRequest.isPending}
                onClick={() =>
                  updateQuoteRequest.mutate({ id: quote.id, data: { status, adminNote } })
                }
              >
                <Save className="h-4 w-4" />
                {updateQuoteRequest.isPending ? 'Kaydediliyor…' : 'Kaydet'}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" /> Teklif isteğini sil
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={() => {
          deleteQuoteRequest.mutate({ id: quote.id, redirect: true });
          setConfirmDelete(false);
        }}
        title="Teklif isteğini sil"
        description="Bu teklif isteği, tüm revizyon geçmişiyle birlikte kalıcı olarak silinecek. Bu işlem geri alınamaz."
      />
    </Layout>
  );
};
