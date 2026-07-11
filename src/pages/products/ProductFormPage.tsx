import React, { useEffect, useState, KeyboardEvent } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useMaterials } from '@/hooks/use-materials';
import { extractId } from '@/services/products';
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
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const productSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  category: z.string().min(1, 'Lütfen bir kategori seçin'),
  allowedMaterials: z.array(z.string()).min(1, 'En az bir materyal seçmelisiniz'),
  basePrice: z.coerce.number().min(0, 'Fiyat negatif olamaz'),
  isActive: z.boolean().default(true),
  parametric: z.boolean().default(true),
  // Dimension constraints (cm) — zorunlu ve 0'dan büyük olmalı
  minWidth: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  maxWidth: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  minHeight: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  maxHeight: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  minDepth: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  maxDepth: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  defaultWidth: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  defaultHeight: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),
  defaultDepth: z.coerce.number().positive('Bu alan zorunludur ve 0\'dan büyük olmalıdır'),

  // Colors stored as an array of strings
  availableColors: z.array(z.string()).optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export const ProductFormPage = () => {
  const params = useParams();
  const id = params.id;
  const isEdit = !!id && id !== 'new';
  const [, setLocation] = useLocation();

  // Color tag-input state
  const [colorInput, setColorInput] = useState('');

  const { data: product, isLoading: loadingProduct } = useProduct(isEdit ? id : null);
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: materials, isLoading: loadingMaterials } = useMaterials();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category: '',
      allowedMaterials: [],
      basePrice: 0,
      isActive: true,
      parametric: true,
      minWidth: undefined,
      maxWidth: undefined,
      minHeight: undefined,
      maxHeight: undefined,
      minDepth: undefined,
      maxDepth: undefined,
      availableColors: [],
    },
  });

  const nameValue = watch('name');
  const availableColors = watch('availableColors') ?? [];
  const allowedMaterials = watch('allowedMaterials') ?? [];

  // Populate form when editing
  useEffect(() => {
    if (product && isEdit) {
      reset({
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        // category may be a populated object or a plain ID string
        category: extractId(product.category as string | { id: string }),
        // allowedMaterials may be populated objects; extract IDs
        allowedMaterials: (product.allowedMaterials ?? []).map((m) =>
          extractId(m as string | { id: string })
        ),
        basePrice: product.basePrice ?? 0,
        isActive: product.isActive ?? true,
        parametric: product.parametric ?? true,
        minWidth: product.minWidth,
        maxWidth: product.maxWidth,
        minHeight: product.minHeight,
        maxHeight: product.maxHeight,
        minDepth: product.minDepth,
        maxDepth: product.maxDepth,
        defaultWidth: product.defaultWidth,
        defaultHeight: product.defaultHeight,
        defaultDepth: product.defaultDepth,
        availableColors: product.availableColors ?? [],
      });
    }
  }, [product, isEdit, reset]);

  // Auto-generate slug from name (only in create mode)
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

  // Color tag helpers
  const addColor = () => {
    const trimmed = colorInput.trim();
    if (!trimmed || availableColors.includes(trimmed)) return;
    setValue('availableColors', [...availableColors, trimmed]);
    setColorInput('');
  };

  const removeColor = (color: string) => {
    setValue('availableColors', availableColors.filter((c) => c !== color));
  };

  const handleColorKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  const onSubmit = (data: ProductForm) => {
    if (isEdit) {
      updateProduct.mutate({ id: id!, data });
    } else {
      createProduct.mutate(data);
    }
  };

  const isLoading =
    (isEdit && loadingProduct) || loadingCategories || loadingMaterials;

  if (isLoading) {
    return (
      <Layout title={isEdit ? 'Ürün Düzenle' : 'Yeni Ürün'}>
        <div className="flex justify-center p-12 text-muted-foreground">
          Yükleniyor...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEdit ? 'Ürün Düzenle' : 'Yeni Ürün'}>
      <div className="max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => setLocation('/products')}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Ürünlere Dön
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* ── Left column ── */}
            <div className="md:col-span-2 space-y-6">

              {/* General info */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Genel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ürün Adı *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL) *</Label>
                      <Input
                        id="slug"
                        {...register('slug')}
                        className={errors.slug ? 'border-destructive' : ''}
                      />
                      {errors.slug && (
                        <p className="text-sm text-destructive">
                          {errors.slug.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dimension constraints */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Boyut Kısıtları (cm)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    {/* Width */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Genişlik
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="minWidth" className="text-xs">Min</Label>
                          <Input
                            id="minWidth"
                            type="number"
                            min="0"
                            placeholder="0"
                            className={errors.minWidth ? 'border-destructive' : ''}
                            {...register('minWidth')}
                          />
                          {errors.minWidth && (
                            <p className="text-sm text-destructive">{errors.minWidth.message}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="maxWidth" className="text-xs">Max</Label>
                          <Input
                            id="maxWidth"
                            type="number"
                            min="0"
                            placeholder="—"
                            className={errors.maxWidth ? 'border-destructive' : ''}
                            {...register('maxWidth')}
                          />
                          {errors.maxWidth && (
                            <p className="text-sm text-destructive">{errors.maxWidth.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Height */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Yükseklik
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="minHeight" className="text-xs">Min</Label>
                          <Input
                            id="minHeight"
                            type="number"
                            min="0"
                            placeholder="0"
                            className={errors.minHeight ? 'border-destructive' : ''}
                            {...register('minHeight')}
                          />
                          {errors.minHeight && (
                            <p className="text-sm text-destructive">{errors.minHeight.message}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="maxHeight" className="text-xs">Max</Label>
                          <Input
                            id="maxHeight"
                            type="number"
                            min="0"
                            placeholder="—"
                            className={errors.maxHeight ? 'border-destructive' : ''}
                            {...register('maxHeight')}
                          />
                          {errors.maxHeight && (
                            <p className="text-sm text-destructive">{errors.maxHeight.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Depth */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Derinlik
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="minDepth" className="text-xs">Min</Label>
                          <Input
                            id="minDepth"
                            type="number"
                            min="0"
                            placeholder="0"
                            className={errors.minDepth ? 'border-destructive' : ''}
                            {...register('minDepth')}
                          />
                          {errors.minDepth && (
                            <p className="text-sm text-destructive">{errors.minDepth.message}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="maxDepth" className="text-xs">Max</Label>
                          <Input
                            id="maxDepth"
                            type="number"
                            min="0"
                            placeholder="—"
                            className={errors.maxDepth ? 'border-destructive' : ''}
                            {...register('maxDepth')}
                          />
                          {errors.maxDepth && (
                            <p className="text-sm text-destructive">{errors.maxDepth.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>


               {/* default dimension */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Default Ölçüler (cm)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    {/* Width */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Genişlik
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Input
                            id="defaultWidth"
                            type="number"
                            min="0"
                            placeholder="—"
                            className={errors.defaultWidth ? 'border-destructive' : ''}
                            {...register('defaultWidth')}
                          />
                          {errors.defaultWidth && (
                            <p className="text-sm text-destructive">{errors.defaultWidth.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Height */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Yükseklik
                      </Label>
                      <div className="grid grid-cols-2 gap-2">

                        <div className="space-y-1">

                          <Input
                            id="defaultHeight"
                            type="number"
                            min="0"
                            placeholder="—"
                            className={errors.defaultHeight ? 'border-destructive' : ''}
                            {...register('defaultHeight')}
                          />
                          {errors.defaultHeight && (
                            <p className="text-sm text-destructive">{errors.defaultHeight.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Depth */}
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Derinlik
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">

                          <Input
                            id="defaultDepth"
                            type="number"
                            min="0"
                            placeholder="0"
                            className={errors.defaultDepth ? 'border-destructive' : ''}
                            {...register('defaultDepth')}
                          />
                          {errors.defaultDepth && (
                            <p className="text-sm text-destructive">{errors.defaultDepth.message}</p>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Materials */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">İzin Verilen Materyaller *</CardTitle>
                </CardHeader>
                <CardContent>
                  {errors.allowedMaterials && (
                    <p className="text-sm text-destructive mb-4">
                      {errors.allowedMaterials.message}
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {materials?.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center space-x-2 p-2 border border-border rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <Checkbox
                          id={`material-${material.id}`}
                          checked={allowedMaterials.includes(material.id)}
                          onCheckedChange={(checked) => {
                            setValue(
                              'allowedMaterials',
                              checked
                                ? [...allowedMaterials, material.id]
                                : allowedMaterials.filter((v) => v !== material.id),
                              { shouldValidate: true }
                            );
                          }}
                        />
                        <Label
                          htmlFor={`material-${material.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {material.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Right column ── */}
            <div className="space-y-6">

              {/* Category */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Kategorizasyon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori *</Label>
                    <Select
                      onValueChange={(value) => {
                        // Radix Select can fire onValueChange('') internally while
                        // syncing dynamically-loaded items; ignore non-selections.
                        if (value) setValue('category', value, { shouldValidate: true });
                      }}
                      value={watch('category')}
                    >
                      <SelectTrigger
                        className={errors.category ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Kategori seçin">
                          {categories?.find((cat) => cat.id === watch('category'))?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Price & Status */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Fiyatlandırma & Durum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Taban Fiyat (₺) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      {...register('basePrice')}
                      className={errors.basePrice ? 'border-destructive' : ''}
                    />
                    {errors.basePrice && (
                      <p className="text-sm text-destructive">
                        {errors.basePrice.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <Switch
                      id="isActive"
                      checked={watch('isActive')}
                      onCheckedChange={(checked) =>
                        setValue('isActive', checked)
                      }
                    />
                    <Label htmlFor="isActive" className="font-medium cursor-pointer">
                      Ürün Aktif
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <Switch
                      id="parametric"
                      checked={watch('parametric')}
                      onCheckedChange={(checked) =>
                        setValue('parametric', checked)
                      }
                    />
                    <Label htmlFor="parametric" className="font-medium cursor-pointer">
                      Parametrik (Özel Ölçü)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Available Colors */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Mevcut Renkler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Renk ekle (örn: #ffffff)"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={handleColorKeyDown}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addColor}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {availableColors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {availableColors.map((color) => (
                        <Badge
                          key={color}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          {/* Swatch for hex colors */}
                          {color.startsWith('#') && (
                            <span
                              className="inline-block w-3 h-3 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            />
                          )}
                          <span className="text-xs">{color}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="ml-0.5 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter'a basarak veya + butonuyla ekleyin
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/products')}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={createProduct.isPending || updateProduct.isPending}
            >
              {createProduct.isPending || updateProduct.isPending
                ? 'Kaydediliyor...'
                : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
