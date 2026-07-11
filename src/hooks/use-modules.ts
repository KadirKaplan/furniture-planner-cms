import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getModules, getModule, createModule, updateModule, deleteModule } from '../services/modules';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: getModules,
  });
};

export const useModule = (id: string | null) => {
  return useQuery({
    queryKey: ['modules', id],
    queryFn: () => getModule(id!),
    enabled: !!id,
  });
};

export const useCreateModule = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: createModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Başarıyla oluşturuldu');
      setLocation('/modules');
    },
    onError: () => {
      toast.error('Oluşturulurken bir hata oluştu');
    },
  });
};

export const useUpdateModule = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Başarıyla güncellendi');
      setLocation('/modules');
    },
    onError: () => {
      toast.error('Güncellenirken bir hata oluştu');
    },
  });
};

export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Başarıyla silindi');
    },
    onError: () => {
      toast.error('Silinirken bir hata oluştu');
    },
  });
};
