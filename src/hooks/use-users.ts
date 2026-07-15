import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../services/users';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { getApiErrorMessage } from '@/lib/utils';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
};

export const useUser = (id: string | null) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id!),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Başarıyla oluşturuldu');
      setLocation('/users');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Oluşturulurken bir hata oluştu'));
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Başarıyla güncellendi');
      setLocation('/users');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Güncellenirken bir hata oluştu'));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Başarıyla silindi');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Silinirken bir hata oluştu'));
    },
  });
};
