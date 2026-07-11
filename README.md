# Furniture Planner CMS

Mobilya planlayıcı uygulaması için içerik yönetim paneli (admin CMS). Ürünler, kategoriler, materyaller ve modüllerin yönetildiği React tabanlı bir yönetim arayüzüdür.

## Teknolojiler

- **React 19** + **TypeScript**
- **Vite 7** — build ve dev sunucusu
- **Tailwind CSS 4** — stillendirme
- **Radix UI** — erişilebilir UI bileşenleri
- **TanStack Query** — sunucu state yönetimi
- **React Hook Form** + **Zod** — form yönetimi ve doğrulama
- **Wouter** — routing
- **Axios** — HTTP istemcisi

## Kurulum

```bash
npm install
```

`.env.example` dosyasını `.env` olarak kopyalayıp kendi değerlerinizi girin:

```bash
cp .env.example .env
```

| Değişken | Açıklama |
| --- | --- |
| `VITE_API_URL` | Backend API'nin base URL'i |

## Kullanılabilir Komutlar

```bash
npm run dev        # Geliştirme sunucusunu başlatır
npm run build       # Production build alır
npm run preview     # Production build'i önizler
npm run typecheck   # TypeScript tip kontrolü yapar
```

## Proje Yapısı

```
src/
├── components/    # Ortak, layout ve UI bileşenleri
├── contexts/      # React context'leri
├── hooks/         # Custom hook'lar
├── lib/           # Yardımcı fonksiyonlar
├── pages/         # Sayfa bileşenleri (dashboard, login, ürünler, kategoriler, materyaller, modüller)
└── services/      # API servis katmanı (auth, products, categories, materials, modules)
```

## Özellikler

- Giriş / kimlik doğrulama
- Dashboard
- Ürün yönetimi
- Kategori yönetimi
- Materyal yönetimi
- Modül yönetimi
