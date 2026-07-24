import { useMemo, useRef, useState } from 'react';
import worldData from '@/data/world-110m.geo.json';
import { countryFlag, countryName } from '@/lib/country';
import type { BreakdownItem } from '@/services/analytics';

// Hafif choropleth dünya haritası — harici harita kütüphanesi (react-simple-maps/d3)
// yok. Veri, kırpılmış Natural Earth 110m GeoJSON'u (yalnızca ISO kodu + geometri,
// tembel yüklenen ~145KB ayrı chunk). Projeksiyon equirectangular: viewBox 360×150,
// yani 1 birim = 1 derece → x = boylam+180, y = 90-enlem (Antarktika kırpılır).

type Ring = [number, number][];
interface Feature {
  iso: string;
  g: { t: 'P' | 'M'; c: Ring[] | Ring[][] };
}

const world = worldData as { features: Feature[] };

const ringToPath = (ring: Ring): string =>
  ring.map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'}${(lon + 180).toFixed(1)},${(90 - lat).toFixed(1)}`).join(' ') + 'Z';

const featurePath = (f: Feature): string => {
  if (f.g.t === 'P') return (f.g.c as Ring[]).map(ringToPath).join(' ');
  return (f.g.c as Ring[][]).flat().map(ringToPath).join(' ');
};

// Renk yoğunluğu ziyaretçi sayısıyla artar. Karekök ölçek, birkaç büyük ülkenin
// gerisini ezmesini engeller (Umami'deki gibi az ziyaretli ülke de görünür kalır).
const fillFor = (visitors: number, max: number): string => {
  if (visitors <= 0) return 'hsl(var(--muted))';
  const t = Math.sqrt(visitors / max); // 0..1
  const alpha = (0.2 + t * 0.8).toFixed(2);
  return `hsl(var(--primary) / ${alpha})`;
};

interface HoverState {
  iso: string;
  visitors: number;
  x: number;
  y: number;
}

export default function WorldMap({ countries }: { countries: BreakdownItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const byIso = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of countries) if (c.key && c.key.length === 2) m.set(c.key.toUpperCase(), c.visitors);
    return m;
  }, [countries]);

  const max = Math.max(1, ...countries.map((c) => c.visitors));

  const paths = useMemo(
    () => world.features.map((f) => ({ iso: f.iso, d: featurePath(f) })),
    [],
  );

  const onMove = (iso: string, visitors: number) => (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ iso, visitors, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div ref={containerRef} className="relative w-full" onMouseLeave={() => setHover(null)}>
      <svg viewBox="0 0 360 150" className="w-full" style={{ aspectRatio: '360 / 150' }}>
        {paths.map(({ iso, d }) => {
          const visitors = byIso.get(iso) ?? 0;
          return (
            <path
              key={iso}
              d={d}
              fill={fillFor(visitors, max)}
              stroke="hsl(var(--border))"
              strokeWidth={0.2}
              fillRule="evenodd"
              className="transition-[fill] duration-150"
              onMouseEnter={onMove(iso, visitors)}
              onMouseMove={onMove(iso, visitors)}
            />
          );
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          <span className="mr-1.5">{countryFlag(hover.iso)}</span>
          <span className="font-medium text-foreground">{countryName(hover.iso)}</span>
          <span className="ml-2 text-muted-foreground tabular-nums">
            {new Intl.NumberFormat('tr-TR').format(hover.visitors)} ziyaretçi
          </span>
        </div>
      )}
    </div>
  );
}
