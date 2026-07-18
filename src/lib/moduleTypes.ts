// Modül DAVRANIŞ tipleri — API'deki config/moduleTypes.js ile birebir aynı kapalı küme.
// Slug yalnızca kimlik/URL amaçlıdır; planner'ın 3D/etkileşim davranışı ve kategori
// kuralları bu tipe göre eşleşir. Admin tipi bu listeden seçer (serbest metin değil),
// böylece yazım hatası davranışı asla bozamaz.
export const MODULE_TYPES = ['door', 'drawer', 'shelf', 'mattress', 'generic'] as const;

export type ModuleType = (typeof MODULE_TYPES)[number];

export const MODULE_TYPE_LABELS: Record<ModuleType, string> = {
  door: 'Kapak',
  drawer: 'Çekmece',
  shelf: 'Raf',
  mattress: 'Yatak',
  generic: 'Genel Eklenti',
};

export const MODULE_TYPE_DESCRIPTIONS: Record<ModuleType, string> = {
  door: 'Kapak sistemi — planner kapak sayısını ürün genişliğinden hesaplar, alt modüller kapak stilleri olarak sunulur.',
  drawer: 'Çekmece sistemi — planner kolon başına çekmece adedini yönetir.',
  shelf: 'Raf sistemi — planner kolon başına raf adedini yönetir.',
  mattress: 'Yatak — karyola iç ölçüsünden otomatik hesaplanır.',
  generic: '3D davranışı olmayan eklenti (ör. askılık) — planner\'da adet + fiyat kartı olarak görünür.',
};
