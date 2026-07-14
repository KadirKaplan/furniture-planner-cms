import { api } from './api';

export type ModuleType = 'generic' | 'door';

export interface Module {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  modelUrl: string;
  type: ModuleType;
  priceModifier: number;
  isActive: boolean;
}

export const getModules = async () => {
  const { data } = await api.get('/modules');
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
