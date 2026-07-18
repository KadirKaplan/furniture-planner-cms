import { api } from './api';
import type { ModuleType } from '@/lib/moduleTypes';

export interface Submodule {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  // true: assets.icon/modelUrl CDN'e yüklenip özelleştirilebilir (ör. kapak stilleri).
  // false: model planner'da kod içinde çiziliyor — yükleme yapılamaz.
  isCustom: boolean;
  assets?: {
    icon?: string;
    modelUrl?: string;
  };
  // Yalnızca isCustom modüller için: seçici rozetinin zemin/yazı rengi.
  swatchColor?: string;
  swatchTextColor?: string;
  priceModifier: number;
  isActive: boolean;
}

export interface Module {
  id: string;
  name: string;
  slug: string;
  // DAVRANIŞ tipi — planner'ın 3D mantığı ve kategori kuralları slug'a değil buna göre
  // eşleşir (bkz. lib/moduleTypes.ts).
  type: ModuleType;
  description?: string;
  // true: assets.icon/modelUrl CDN'e yüklenip özelleştirilebilir.
  // false: model planner'da kod içinde çiziliyor (ör. raf, çekmece) — yükleme yapılamaz.
  isCustom: boolean;
  assets?: {
    icon?: string;
    modelUrl?: string;
  };
  swatchColor?: string;
  swatchTextColor?: string;
  // Ana modülün varyantları — ör. Kapak modülünün altına Düz/Kare/Rustik kapak stilleri
  // birer alt modül olarak eklenir.
  submodules?: Submodule[];
  priceModifier: number;
  isActive: boolean;
}

export const getModules = async () => {
  const { data } = await api.get('/modules', { params: { all: 'true' } });
  return data.data as Module[];
};

export const getModule = async (id: string) => {
  const { data } = await api.get(`/modules/${id}`);
  return data.data as Module;
};

export const createModule = async (module: Omit<Module, 'id'>) => {
  const { data } = await api.post('/modules', module);
  return data;
};

export const updateModule = async (id: string, module: Partial<Module>) => {
  const { data } = await api.put(`/modules/${id}`, module);
  return data;
};

export const deleteModule = async (id: string) => {
  const { data } = await api.delete(`/modules/${id}`);
  return data;
};
