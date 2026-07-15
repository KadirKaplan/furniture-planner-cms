import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../services/categories';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { getApiErrorMessage } from '@/lib/utils';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};

export const useCategory = (id: string | null) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategory(id!),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Başarıyla oluşturuldu');
      setLocation('/categories');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Oluşturulurken bir hata oluştu'));
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Başarıyla güncellendi');
      setLocation('/categories');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Güncellenirken bir hata oluştu'));
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Başarıyla silindi');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Silinirken bir hata oluştu'));
    },
  });
};
