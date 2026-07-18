import { api } from './api';

export interface ProductDimensions {
  defaultWidth?: number;
  defaultHeight?: number;
  defaultDepth?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minDepth?: number;
  maxDepth?: number;
}

export interface ProductAssets {
  icon?: string;
  modelUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  assets?: ProductAssets;
  category: { id: string; name: string; slug: string } | string;
  allowedMaterials: (string | { id: string; name: string; slug?: string })[];
  basePrice: number;
  isActive: boolean;
  parametric?: boolean;
  // Tek kapağın maksimum genişliği (cm) — dolu ise ürün kapak destekler: planner kapak
  // sayısını ceil(genişlik / maxDoorWidth) ile hesaplar ve kapak slotu/stil atamasını açar.
  // null/boş ise üründe kapak sistemi yoktur.
  maxDoorWidth?: number | null;
  // Dimension constraints (cm)
  dimensions?: ProductDimensions;
  // Colors
  availableColors?: string[];
}

/** Extract a plain string ID from a populated or plain reference */
export const extractId = (ref: string | { id: string }): string =>
  typeof ref === 'object' && ref !== null ? ref.id : ref;

export const getProducts = async () => {
  const { data } = await api.get('/products', { params: { all: 'true' } });
  return data.data as Product[];
};

export const getProduct = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data.data as Product;
};

export const createProduct = async (product: Omit<Product, 'id'>) => {
  const { data } = await api.post('/products', product);
  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
