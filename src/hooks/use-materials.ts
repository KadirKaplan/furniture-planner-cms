import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, getMaterial, createMaterial, updateMaterial, deleteMaterial } from '../services/materials';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export const useMaterials = (type?: string) => {
  return useQuery({
    queryKey: ['materials', type],
    queryFn: () => getMaterials(type),
  });
};

export const useMaterial = (id: string | null) => {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () => getMaterial(id!),
    enabled: !!id,
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Başarıyla oluşturuldu');
      setLocation('/materials');
    },
    onError: () => {
      toast.error('Oluşturulurken bir hata oluştu');
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Başarıyla güncellendi');
      setLocation('/materials');
    },
    onError: () => {
      toast.error('Güncellenirken bir hata oluştu');
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('Başarıyla silindi');
    },
    onError: () => {
      toast.error('Silinirken bir hata oluştu');
    },
  });
};
