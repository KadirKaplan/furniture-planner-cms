import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useUser, useCreateUser, useUpdateUser } from '@/hooks/use-users';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';

const baseUserSchema = {
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  name: z.string().optional(),
  isActive: z.boolean().default(true),
};

// Oluştururken şifre zorunlu; düzenlerken boş bırakılırsa mevcut şifre değişmez.
const createUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const editUserSchema = z.object({
  ...baseUserSchema,
  password: z.union([z.string().min(6, 'Şifre en az 6 karakter olmalıdır'), z.literal('')]).optional(),
});

type UserForm = z.infer<typeof editUserSchema>;

export const UserFormPage = () => {
  const params = useParams();
  const id = params.id;
  const isEdit = !!id && id !== 'new';
  const [, setLocation] = useLocation();

  const { data: userData, isLoading } = useUser(isEdit ? id : null);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<UserForm>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (userData && isEdit) {
      reset({
        email: userData.email,
        name: userData.name ?? '',
        password: '',
        isActive: userData.isActive,
      });
    }
  }, [userData, isEdit, reset]);

  const onSubmit = (data: UserForm) => {
    if (isEdit) {
      const { password, ...rest } = data;
      updateUser.mutate({ id: id!, data: password ? { ...rest, password } : rest });
    } else {
      createUser.mutate(data as { email: string; password: string; name?: string; isActive?: boolean });
    }
  };

  if (isEdit && isLoading) {
    return (
      <Layout title="Kullanıcı Düzenle">
        <div className="flex justify-center p-12">Yükleniyor...</div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}>
      <div className="max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => setLocation('/users')}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kullanıcılara Dön
        </Button>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">İsim</Label>
                  <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input id="email" type="email" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{isEdit ? 'Yeni Şifre' : 'Şifre *'}</Label>
                <Input id="password" type="password" autoComplete="new-password" {...register('password')} className={errors.password ? 'border-destructive' : ''} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                {isEdit && (
                  <p className="text-xs text-muted-foreground">Şifreyi değiştirmek istemiyorsanız boş bırakın.</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">
                  Kullanıcı Aktif
                </Label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                <Button type="button" variant="outline" onClick={() => setLocation('/users')}>
                  İptal
                </Button>
                <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
                  {createUser.isPending || updateUser.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
