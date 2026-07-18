import { api } from './api';
import type { ModuleType } from '@/lib/moduleTypes';

// Kategori slug → izinli modül tipleri (API'deki "moduleCategoryRules" Setting kaydı).
// İki eksen de kapalı küme (kategori slug'ları + MODULE_TYPES) olduğu için matris
// ekranından güvenle düzenlenir — serbest metin girişi yoktur.
export type ModuleCategoryRules = Record<string, ModuleType[]>;

export const getModuleCategoryRules = async () => {
  const { data } = await api.get('/settings/moduleCategoryRules');
  return (data.data ?? {}) as ModuleCategoryRules;
};

export const updateModuleCategoryRules = async (rules: ModuleCategoryRules) => {
  const { data } = await api.put('/settings/moduleCategoryRules', { value: rules });
  return data;
};
