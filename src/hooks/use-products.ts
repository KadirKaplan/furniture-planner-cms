import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../services/products';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { getApiErrorMessage } from '@/lib/utils';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });
};

export const useProduct = (id: string | null) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Başarıyla oluşturuldu');
      setLocation('/products');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Oluşturulurken bir hata oluştu'));
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Başarıyla güncellendi');
      setLocation('/products');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Güncellenirken bir hata oluştu'));
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Başarıyla silindi');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Silinirken bir hata oluştu'));
    },
  });
};
