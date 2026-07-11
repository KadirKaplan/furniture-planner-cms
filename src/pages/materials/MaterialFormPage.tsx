import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useMaterial, useCreateMaterial, useUpdateMaterial } from '@/hooks/use-materials';
import { materialTypes } from '@/services/materials';
import { useLocation, useParams } from 'wouter';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const colorSchema = z.object({
  name: z.string().min(1, 'Renk adı gereklidir'),
  hex: z.string().optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  code: z.string().optional(),
  priceModifier: z.coerce.number().default(0),
});

const materialSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır'),
  type: z.string().min(1, 'Lütfen bir tip seçin'),
  description: z.string().optional(),
  priceModifier: z.coerce.number().default(0),
  isActive: z.boolean().default(true),
  colors: z.array(colorSchema),
});

type MaterialForm = z.infer<typeof materialSchema>;

export const MaterialFormPage = () => {
  const params = useParams();
  const id = params.id;
  const isEdit = !!id && id !== 'new';
  const [, setLocation] = useLocation();

  const { data: material, isLoading } = useMaterial(isEdit ? id : null);
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, control } = useForm<MaterialForm>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: '',
      description: '',
      priceModifier: 0,
      isActive: true,
      colors: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'colors' });

  const nameValue = watch('name');

  useEffect(() => {
    if (material && isEdit) {
      reset({
        name: material.name,
        slug: material.slug,
        type: material.type,
        description: material.description || '',
        priceModifier: material.priceModifier,
        isActive: material.isActive,
        colors: material.colors ?? [],
      });
    }
  }, [material, isEdit, reset]);

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

  const onSubmit = (data: MaterialForm) => {
    if (isEdit) {
      updateMaterial.mutate({ id: id!, data });
    } else {
      createMaterial.mutate(data as any);
    }
  };

  if (isEdit && isLoading) {
    return (
      <Layout title="Malzeme Düzenle">
        <div className="flex justify-center p-12">Yükleniyor...</div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? 'Malzeme Düzenle' : 'Yeni Malzeme'}>
      <div className="max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setLocation('/materials')}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Malzemelere Dön
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Genel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Malzeme Adı *</Label>
                  <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input id="slug" {...register('slug')} className={errors.slug ? 'border-destructive' : ''} />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tip *</Label>
                  <Select
                    onValueChange={(value) => {
                      // Radix Select can fire onValueChange('') internally while
                      // syncing dynamically-loaded items; ignore non-selections.
                      if (value) setValue('type', value, { shouldValidate: true });
                    }}
                    value={watch('type')}
                  >
                    <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Tip seçin">
                        {materialTypes[watch('type') as keyof typeof materialTypes]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(materialTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceModifier">Fiyat Etkisi (₺) *</Label>
                  <Input id="priceModifier" type="number" {...register('priceModifier')} className={errors.priceModifier ? 'border-destructive' : ''} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea id="description" {...register('description')} className="min-h-[100px]" />
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-border">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">
                  Malzeme Aktif
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Renkler</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => append({ name: '', hex: '', imageUrl: '', category: '', code: '', priceModifier: 0 })}
              >
                <Plus className="h-4 w-4" /> Renk Ekle
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">Henüz renk eklenmedi.</p>
              )}
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 md:grid-cols-[auto_1fr_1fr_1fr_1fr_auto] items-end p-3 border border-border rounded-md">
                  <div
                    className="w-8 h-8 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: watch(`colors.${index}.hex`) || '#e2ece8' }}
                  />
                  <div className="space-y-1">
                    <Label className="text-xs">Ad *</Label>
                    <Input
                      {...register(`colors.${index}.name` as const)}
                      className={errors.colors?.[index]?.name ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Hex</Label>
                    <Input placeholder="#ffffff" {...register(`colors.${index}.hex` as const)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kod</Label>
                    <Input {...register(`colors.${index}.code` as const)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fiyat Etkisi (₺)</Label>
                    <Input type="number" {...register(`colors.${index}.priceModifier` as const)} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setLocation('/materials')}>
              İptal
            </Button>
            <Button type="submit" disabled={createMaterial.isPending || updateMaterial.isPending}>
              {createMaterial.isPending || updateMaterial.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
