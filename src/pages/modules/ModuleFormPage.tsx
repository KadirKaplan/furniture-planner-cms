import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useModule, useCreateModule, useUpdateModule } from '@/hooks/use-modules';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const moduleSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  type: z.enum(['generic', 'door']).default('generic'),
  priceModifier: z.coerce.number().min(0, 'Fiyat negatif olamaz'),
  isActive: z.boolean().default(true),
});

type ModuleForm = z.infer<typeof moduleSchema>;

export const ModuleFormPage = () => {
  const params = useParams();
  const id = params.id;
  const isEdit = !!id && id !== 'new';
  const [, setLocation] = useLocation();

  const { data: module, isLoading } = useModule(isEdit ? id : null);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: 'generic',
      priceModifier: 0,
      isActive: true,
    }
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (module && isEdit) {
      reset({
        name: module.name,
        slug: module.slug,
        description: module.description || '',
        type: module.type || 'generic',
        priceModifier: module.priceModifier,
        isActive: module.isActive,
      });
    }
  }, [module, isEdit, reset]);

  // Auto-generate slug from name if not manually edited
  useEffect(() => {
    if (!isEdit && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, setValue]);

  const onSubmit = (data: ModuleForm) => {
    if (isEdit) {
      updateModule.mutate({ id: id!, data });
    } else {
      createModule.mutate(data);
    }
  };

  if (isEdit && isLoading) {
    return (
      <Layout title="Modül Düzenle">
        <div className="flex justify-center p-12">Yükleniyor...</div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? "Modül Düzenle" : "Yeni Modül"}>
      <div className="max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/modules')} 
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Modüllere Dön
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Genel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Modül Adı *</Label>
                  <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input id="slug" {...register('slug')} className={errors.slug ? 'border-destructive' : ''} />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Modül Tipi *</Label>
                <Select
                  onValueChange={(value) => setValue('type', value as 'generic' | 'door', { shouldValidate: true })}
                  value={watch('type')}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tip seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">Genel Modül</SelectItem>
                    <SelectItem value="door">Kapı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Fiyatlandırma ve Durum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="priceModifier">Fiyat Etkisi (₺) *</Label>
                <Input id="priceModifier" type="number" {...register('priceModifier')} className={errors.priceModifier ? 'border-destructive' : ''} />
                {errors.priceModifier && <p className="text-sm text-destructive">{errors.priceModifier.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-border">
                <Switch
                  id="isActive"
                  checked={watch('isActive') ?? true}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">
                  Modül Aktif
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setLocation('/modules')}>
              İptal
            </Button>
            <Button type="submit" disabled={createModule.isPending || updateModule.isPending}>
              {createModule.isPending || updateModule.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
