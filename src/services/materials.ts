import { api } from './api';

export const materialTypes = {
  mdflam: 'MDF Lam',
  mdflake: 'MDF Lake',
  glass: 'Cam',
  metal: 'Metal',
  supramat: 'Supramat',
  akrilik: 'Akrilik',
} as const;

export type MaterialType = keyof typeof materialTypes;

export interface MaterialColor {
  id?: string;
  name: string;
  hex?: string;
  imageUrl?: string;
  category?: string;
  code?: string;
  priceModifier: number;
}

export interface Material {
  id: string;
  name: string;
  slug: string;
  type: MaterialType;
  description?: string;
  priceModifier: number;
  colors: MaterialColor[];
  isActive: boolean;
}

export const getMaterials = async (type?: string) => {
  const { data } = await api.get('/materials', {
    params: { type: type === 'all' ? undefined : type, all: 'true' },
  });
  return data.data as Material[];
};

export const getMaterial = async (id: string) => {
  const { data } = await api.get(`/materials/${id}`);
  return data.data as Material;
};

export const createMaterial = async (material: Omit<Material, 'id'>) => {
  const { data } = await api.post('/materials', material);
  return data;
};

export const updateMaterial = async (id: string, material: Partial<Material>) => {
  const { data } = await api.put(`/materials/${id}`, material);
  return data;
};

export const deleteMaterial = async (id: string) => {
  const { data } = await api.delete(`/materials/${id}`);
  return data;
};
