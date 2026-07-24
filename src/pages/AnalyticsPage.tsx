import { useState, lazy, Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';
import { useAnalyticsSummary } from '@/hooks/use-analytics';
import type { BreakdownItem, DailyPoint, RangeStats } from '@/services/analytics';
import { countryFlag, countryName } from '@/lib/country';
import { cn } from '@/lib/utils';
import { Users, Eye, Globe, ArrowUp, ArrowDown, Monitor, Smartphone, Tablet } from 'lucide-react';
import type { ReactNode } from 'react';

const WorldMap = lazy(() => import('@/components/analytics/WorldMap'));

const nf = new Intl.NumberFormat('tr-TR');

// Son N İstanbul gününün "YYYY-MM-DD" listesi — API yalnızca veri olan günleri
// döndürür, grafiğin zaman ekseni düzgün olsun diye boş günleri 0 ile dolduruyoruz.
const TZ_OFFSET_MS = 3 * 60 * 60 * 1000;
const istanbulDay = (ms: number) => new Date(ms + TZ_OFFSET_MS).toISOString().slice(0, 10);
const lastNDays = (n: number): string[] => {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => istanbulDay(now - (n - 1 - i) * 86400000));
};

const shortDate = (day: string) => {
  const [, m, d] = day.split('-');
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${Number(d)} ${months[Number(m) - 1]}`;
};

const pctChange = (cur: number, prev: number): number => {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
};

const Delta = ({ cur, prev }: { cur: number; prev: number }) => {
  const pct = pctChange(cur, prev);
  if (pct === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const up = pct > 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', up ? 'text-emerald-500' : 'text-red-500')}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
};

const StatTile = ({
  label, stats, prev, icon: Icon, accent,
}: {
  label: string; stats?: RangeStats; prev?: RangeStats; icon: typeof Users; accent: string;
}) => (
  <Card className="border-border shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <div className={`p-2 rounded-md ${accent}`}><Icon className="h-4 w-4" /></div>
    </CardHeader>
    <CardContent>
      <div className="flex items-end justify-between gap-2">
        <div className="text-3xl font-bold tabular-nums leading-none">{nf.format(stats?.visitors ?? 0)}</div>
        {prev && <Delta cur={stats?.visitors ?? 0} prev={prev.visitors} />}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{nf.format(stats?.visits ?? 0)}</span> ziyaret
      </div>
    </CardContent>
  </Card>
);

// Umami tarzı dikey bar grafiği: açık "ziyaret" barı arkada, koyu "ziyaretçi" barı önde.
const BarChart = ({ series }: { series: DailyPoint[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((s) => s.visits));
  return (
    <div className="flex h-48 items-end gap-[3px]">
      {series.map((d, i) => {
        const isHot = hovered === i;
        return (
          <div
            key={d.day}
            className="relative flex h-full flex-1 items-end justify-center"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className={cn('absolute bottom-0 w-full rounded-sm transition-colors', isHot ? 'bg-primary/25' : 'bg-primary/12')} style={{ height: `${(d.visits / max) * 100}%` }} aria-hidden="true" />
            <div className={cn('absolute bottom-0 w-full rounded-sm transition-colors', isHot ? 'bg-primary' : 'bg-primary/70')} style={{ height: `${(d.visitors / max) * 100}%` }} aria-hidden="true" />
            {isHot && (
              <div className="pointer-events-none absolute bottom-full z-10 mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                <div className="font-medium text-foreground">{shortDate(d.day)}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-primary" />{nf.format(d.visitors)} ziyaretçi</div>
                <div className="flex items-center gap-1.5 text-muted-foreground"><span className="inline-block h-2 w-2 rounded-sm bg-primary/25" />{nf.format(d.visits)} ziyaret</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Umami'deki yatay-bar kırılım listesi — ülke/bölge/tarayıcı/kaynak hepsi bunu kullanır.
type LabelFormat = (key: string) => { icon?: ReactNode; label: string };

const BreakdownList = ({ items, format }: { items: BreakdownItem[]; format: LabelFormat }) => {
  if (!items || items.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Henüz veri yok.</div>;
  }
  const total = items.reduce((s, i) => s + i.visitors, 0);
  const max = Math.max(1, ...items.map((i) => i.visitors));
  return (
    <div className="space-y-0.5">
      {items.slice(0, 8).map((item) => {
        const { icon, label } = format(item.key);
        const share = total > 0 ? Math.round((item.visitors / total) * 100) : 0;
        return (
          <div key={item.key} className="relative flex items-center gap-2.5 rounded-md px-2 py-1.5">
            <div className="absolute inset-y-0 left-0 rounded-md bg-primary/8" style={{ width: `${(item.visitors / max) * 100}%` }} aria-hidden="true" />
            {icon && <span className="relative flex h-4 w-4 items-center justify-center text-base leading-none">{icon}</span>}
            <span className="relative flex-1 truncate text-sm font-medium">{label}</span>
            <span className="relative text-sm font-semibold tabular-nums">{nf.format(item.visitors)}</span>
            <span className="relative w-9 text-right text-xs text-muted-foreground tabular-nums">%{share}</span>
          </div>
        );
      })}
    </div>
  );
};

// Kırılım etiketleyicileri
const countryFmt: LabelFormat = (k) => ({ icon: countryFlag(k), label: countryName(k) });
const plainFmt: LabelFormat = (k) => ({ label: k });
const deviceLabels: Record<string, string> = { desktop: 'Masaüstü', mobile: 'Mobil', tablet: 'Tablet' };
const deviceFmt: LabelFormat = (k) => {
  const Icon = k === 'mobile' ? Smartphone : k === 'tablet' ? Tablet : Monitor;
  return { icon: <Icon className="h-4 w-4 text-muted-foreground" />, label: deviceLabels[k] ?? k };
};
const sourceFmt: LabelFormat = (k) => ({
  icon: <Globe className="h-4 w-4 text-muted-foreground" />,
  label: k === 'direct' ? 'Doğrudan' : k,
});

const RANGE_OPTIONS = [
  { key: 7, label: 'Son 7 gün' },
  { key: 30, label: 'Son 30 gün' },
] as const;

const MapSkeleton = () => <div className="w-full rounded-md bg-muted animate-pulse" style={{ aspectRatio: '360 / 150' }} />;

export const AnalyticsPage = () => {
  const { data, isLoading } = useAnalyticsSummary();
  const [range, setRange] = useState<7 | 30>(30);

  const byDay = new Map((data?.daily ?? []).map((d) => [d.day, d]));
  const series = lastNDays(range).map((day) => byDay.get(day) ?? { day, visits: 0, visitors: 0 });
  const hasData = series.some((s) => s.visits > 0);

  return (
    <Layout title="İstatistikler">
      <div className="space-y-8">
        {/* Ziyaretçi kutuları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
          ) : (
            <>
              <StatTile label="Bugün" stats={data?.totals.today} icon={Eye} accent="bg-primary/10 text-primary" />
              <StatTile label="Son 7 gün" stats={data?.totals.last7} prev={data?.previous.last7} icon={Users} accent="bg-blue-500/10 text-blue-500" />
              <StatTile label="Son 30 gün" stats={data?.totals.last30} prev={data?.previous.last30} icon={Users} accent="bg-amber-500/10 text-amber-500" />
              <StatTile label="Tüm zamanlar" stats={data?.totals.allTime} icon={Globe} accent="bg-purple-500/10 text-purple-500" />
            </>
          )}
        </div>

        {/* Ziyaret grafiği */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg">Ziyaretler</CardTitle>
              <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
                {RANGE_OPTIONS.map((opt) => (
                  <button key={opt.key} onClick={() => setRange(opt.key)}
                    className={cn('rounded px-2.5 py-1 text-xs font-medium transition-colors', range === opt.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/70" /> Ziyaretçi</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary/12" /> Ziyaret</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 rounded-md bg-muted animate-pulse" />
            ) : !hasData ? (
              <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">Bu dönemde henüz ziyaret kaydı yok.</div>
            ) : (
              <>
                <BarChart series={series} />
                <div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{shortDate(series[0].day)}</span><span>bugün</span></div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dünya haritası */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Ziyaretçi konumları</CardTitle>
              <span className="text-xs text-muted-foreground">son 30 gün</span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <MapSkeleton /> : (
              <Suspense fallback={<MapSkeleton />}>
                <WorldMap countries={data?.countries ?? []} />
              </Suspense>
            )}
          </CardContent>
        </Card>

        {/* Konum / Ortam / Kaynaklar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Konum */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Konum</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <ListSkeleton /> : (
                <Tabs defaultValue="countries">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="countries">Ülkeler</TabsTrigger>
                    <TabsTrigger value="regions">Bölgeler</TabsTrigger>
                    <TabsTrigger value="cities">Şehirler</TabsTrigger>
                  </TabsList>
                  <TabsContent value="countries" className="mt-3"><BreakdownList items={data?.countries ?? []} format={countryFmt} /></TabsContent>
                  <TabsContent value="regions" className="mt-3"><BreakdownList items={data?.regions ?? []} format={plainFmt} /></TabsContent>
                  <TabsContent value="cities" className="mt-3"><BreakdownList items={data?.cities ?? []} format={plainFmt} /></TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Ortam */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Ortam</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <ListSkeleton /> : (
                <Tabs defaultValue="browsers">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="browsers">Tarayıcı</TabsTrigger>
                    <TabsTrigger value="os">İşletim S.</TabsTrigger>
                    <TabsTrigger value="devices">Cihaz</TabsTrigger>
                  </TabsList>
                  <TabsContent value="browsers" className="mt-3"><BreakdownList items={data?.browsers ?? []} format={plainFmt} /></TabsContent>
                  <TabsContent value="os" className="mt-3"><BreakdownList items={data?.os ?? []} format={plainFmt} /></TabsContent>
                  <TabsContent value="devices" className="mt-3"><BreakdownList items={data?.devices ?? []} format={deviceFmt} /></TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Kaynaklar */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Kaynaklar</CardTitle>
                <span className="text-xs text-muted-foreground">nereden geldiler</span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <ListSkeleton /> : <div className="pt-1"><BreakdownList items={data?.sources ?? []} format={sourceFmt} /></div>}
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground">
          Ziyaretçiler çerezsiz, günlük dönen bir kimlikle sayılır — kişisel veri veya IP saklanmaz.
          Konum ve ortam bilgisi yaklaşık olup bağlantıya ve tarayıcıya göre belirlenir.
        </p>
      </div>
    </Layout>
  );
};

const ListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 rounded bg-muted animate-pulse" />)}
  </div>
);
