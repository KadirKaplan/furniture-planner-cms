import { api } from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export const getCategories = async () => {
  const { data } = await api.get('/categories');
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
