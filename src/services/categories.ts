import { api } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  modelUrl?: string;
  order: number;
  isActive: boolean;
}

export const getCategories = async () => {
  // Admin CMS always needs the full list (active + inactive) so categories
  // that were toggled off don't silently vanish and become unmanageable —
  // mirrors the `all=true` convention used by getMaterials().
  const { data } = await api.get('/categories', { params: { all: 'true' } });
  return data.data as Category[];
};

export const getCategory = async (id: string) => {
  const { data } = await api.get(`/categories/${id}`);
  return data.data as Category;
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const { data } = await api.post('/categories', category);
  return data;
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const { data } = await api.put(`/categories/${id}`, category);
  return data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};
