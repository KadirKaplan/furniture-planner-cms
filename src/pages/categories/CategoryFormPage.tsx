import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCategory, useCreateCategory, useUpdateCategory } from '@/hooks/use-categories';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { FileUploadField } from '@/components/common/FileUploadField';

const categorySchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  icon: z.string().min(1, 'İkon zorunludur'),
  modelUrl: z.string().min(1, '3D model zorunludur'),
  order: z.coerce.number().int().min(0),
  isActive: z.boolean().default(true),
});

type CategoryForm = z.infer<typeof categorySchema>;

export const CategoryFormPage = () => {
  const params = useParams();
  const id = params.id;
  const isEdit = !!id && id !== 'new';
  const [, setLocation] = useLocation();

  const { data: category, isLoading } = useCategory(isEdit ? id : null);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      modelUrl: '',
      order: 0,
      isActive: true,
    }
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');

  useEffect(() => {
    if (category && isEdit) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '',
        modelUrl: category.modelUrl || '',
        order: category.order,
        isActive: category.isActive,
      });
    }
  }, [category, isEdit, reset]);

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

  const onSubmit = (data: CategoryForm) => {
    if (isEdit) {
      updateCategory.mutate({ id: id!, data });
    } else {
      createCategory.mutate(data);
    }
  };

  if (isEdit && isLoading) {
    return (
      <Layout title="Kategori Düzenle">
        <div className="flex justify-center p-12">Yükleniyor...</div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? "Kategori Düzenle" : "Yeni Kategori"}>
      <div className="max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/categories')} 
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Kategorilere Dön
        </Button>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Kategori Adı *</Label>
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

              <div className="grid gap-4 md:grid-cols-2">
                <FileUploadField
                  label="İkon"
                  kind="icon"
                  slug={slugValue}
                  value={watch('icon')}
                  onUploaded={(url) => setValue('icon', url, { shouldValidate: true })}
                  onUploadingChange={setIsUploading}
                  error={errors.icon?.message}
                />

                <FileUploadField
                  label="3D Model"
                  kind="model"
                  slug={slugValue}
                  value={watch('modelUrl')}
                  onUploaded={(url) => setValue('modelUrl', url, { shouldValidate: true })}
                  onUploadingChange={setIsUploading}
                  error={errors.modelUrl?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Sıralama</Label>
                <Input id="order" type="number" {...register('order')} />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="isActive" 
                  checked={watch('isActive')} 
                  onCheckedChange={(checked) => setValue('isActive', checked)} 
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">
                  Kategori Aktif
                </Label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                <Button type="button" variant="outline" onClick={() => setLocation('/categories')}>
                  İptal
                </Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending || isUploading}>
                  {createCategory.isPending || updateCategory.isPending ? 'Kaydediliyor...' : isUploading ? 'Dosya yükleniyor...' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
