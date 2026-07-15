import { api } from './api';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin';
  isActive: boolean;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name?: string;
  isActive?: boolean;
}

export interface UserUpdateInput {
  email?: string;
  // Boş bırakılırsa şifre değiştirilmez — UserFormPage bu alanı doluysa gönderir.
  password?: string;
  name?: string;
  isActive?: boolean;
}

export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data.data as User[];
};

export const getUser = async (id: string) => {
  const { data } = await api.get(`/users/${id}`);
  return data.data as User;
};

export const createUser = async (user: UserCreateInput) => {
  const { data } = await api.post('/users', user);
  return data;
};

export const updateUser = async (id: string, user: UserUpdateInput) => {
  const { data } = await api.put(`/users/${id}`, user);
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};
