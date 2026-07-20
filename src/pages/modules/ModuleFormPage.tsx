import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useModule, useCreateModule, useUpdateModule } from '@/hooks/use-modules';
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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadField } from '@/components/common/FileUploadField';
import { GlbPreview } from '@/components/common/GlbPreview';
import { MODULE_TYPES, MODULE_TYPE_LABELS, MODULE_TYPE_DESCRIPTIONS, type ModuleType } from '@/lib/moduleTypes';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const submoduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'İsim gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir'),
  description: z.string().optional(),
  isCustom: z.boolean().default(false),
  assets: z.object({
    icon: z.string().optional(),
    modelUrl: z.string().optional(),
  }),
  swatchColor: z.string().optional(),
  swatchTextColor: z.string().optional(),
  priceModifier: z.coerce.number().min(0, 'Fiyat negatif olamaz').default(0),
  isActive: z.boolean().default(true),
});

const moduleSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  slug: z.string().min(2, 'Slug en az 2 karakter olmalıdır'),
  // Davranış tipi kapalı kümeden seçilir — planner'ın 3D mantığı buna göre eşleşir
  type: z.enum(MODULE_TYPES, { errorMap: () => ({ message: 'Lütfen bir modül tipi seçin' }) }),
  description: z.string().optional(),
  isCustom: z.boolean().default(false),
  assets: z.object({
    icon: z.string().optional(),
    modelUrl: z.string().optional(),
  }),
  swatchColor: z.string().optional(),
  swatchTextColor: z.string().optional(),
  submodules: z.array(submoduleSchema).default([]),
  priceModifier: z.coerce.number().min(0, 'Fiyat negatif olamaz'),
  isActive: z.boolean().default(true),
});

type ModuleForm = z.infer<typeof moduleSchema>;

const emptySubmodule = () => ({
  name: '',
  slug: '',
  description: '',
  isCustom: false,
  assets: { icon: '', modelUrl: '' },
  swatchColor: '',
  swatchTextColor: '',
  priceModifier: 0,
  isActive: true,
});

export const ModuleFormPage = () => {
  const params = useParams();
  const id = params.id;
  const isEdit = !!id && id !== 'new';
  const [, setLocation] = useLocation();

  const { data: module, isLoading } = useModule(isEdit ? id : null);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const [isUploading, setIsUploading] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: 'generic',
      description: '',
      isCustom: false,
      assets: {
        icon: '',
        modelUrl: '',
      },
      swatchColor: '',
      swatchTextColor: '',
      submodules: [],
      priceModifier: 0,
      isActive: true,
    }
  });

  const { fields: submoduleFields, append: appendSubmodule, remove: removeSubmodule } = useFieldArray({
    control,
    name: 'submodules',
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');
  const isCustomValue = watch('isCustom');
  const typeValue = watch('type');

  useEffect(() => {
    if (module && isEdit) {
      reset({
        name: module.name,
        slug: module.slug,
        type: module.type ?? 'generic',
        description: module.description || '',
        isCustom: module.isCustom ?? false,
        assets: {
          icon: module.assets?.icon ?? '',
          modelUrl: module.assets?.modelUrl ?? '',
        },
        swatchColor: module.swatchColor ?? '',
        swatchTextColor: module.swatchTextColor ?? '',
        submodules: (module.submodules ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description ?? '',
          isCustom: s.isCustom ?? false,
          assets: { icon: s.assets?.icon ?? '', modelUrl: s.assets?.modelUrl ?? '' },
          swatchColor: s.swatchColor ?? '',
          swatchTextColor: s.swatchTextColor ?? '',
          priceModifier: s.priceModifier ?? 0,
          isActive: s.isActive ?? true,
        })),
        priceModifier: module.priceModifier,
        isActive: module.isActive,
      });
    }
  }, [module, isEdit, reset]);

  // Auto-generate slug from name if not manually edited
  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', slugify(nameValue), { shouldValidate: true });
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
                  <Input id="name" disabled={isEdit} {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input id="slug" disabled={isEdit} {...register('slug')} className={errors.slug ? 'border-destructive' : ''} />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Modül Tipi *</Label>
                {isEdit ? (
                  // Tip, davranış sözleşmesinin parçası — mevcut modülde değiştirilemez
                  // (değiştirmek client'taki 3D davranışını sessizce başka şeye çevirirdi).
                  <Input value={MODULE_TYPE_LABELS[typeValue] ?? typeValue} disabled />
                ) : (
                  <Select
                    onValueChange={(value) => {
                      if (value) setValue('type', value as ModuleType, { shouldValidate: true });
                    }}
                    value={typeValue || undefined}
                  >
                    <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Modül tipi seçin">
                        {typeValue ? MODULE_TYPE_LABELS[typeValue] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {MODULE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {MODULE_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                <p className="text-xs text-muted-foreground">
                  {MODULE_TYPE_DESCRIPTIONS[typeValue] ??
                    'Planner\'ın 3D davranışı ve kategori kuralları bu tipe göre eşleşir — isim ve slug serbesttir.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  disabled={isEdit}
                  {...register('description')}
                  className="min-h-[100px]"
                />
              </div>

              {isEdit ? (
                // Düzenleme modunda modül tanımı (isim/slug/açıklama/özelleştirilebilirlik/ikon/model)
                // sabittir — admin bu modülde yalnızca fiyat, aktiflik ve (özelleştirilebilirse)
                // alt modülleri değiştirebilir. Bu alanlar bilgi amaçlı salt-okunur gösterilir.
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Bu modül {isCustomValue ? 'özelleştirilebilir' : 'özelleştirilemez'} olarak tanımlanmış
                  {isCustomValue ? ' — aşağıdan alt modül ekleyip düzenleyebilirsiniz.' : '.'}
                  {' '}İsim, slug, tip, açıklama ve özelleştirme durumu burada değiştirilemez.
                </p>
              ) : (
                <>
                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <Switch
                      id="isCustom"
                      checked={isCustomValue ?? false}
                      onCheckedChange={(checked) => setValue('isCustom', checked)}
                    />
                    <Label htmlFor="isCustom" className="font-medium cursor-pointer">
                      Özelleştirilebilir (CDN İkon/Model)
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-4">
                    Kapalı durumda bu modülün 3B modeli planner içinde kod ile çiziliyor demektir (ör. raf, çekmece) —
                    ikon/model yüklemesi yapılamaz. Açıksa ikon ve 3B model CDN'e yüklenir.
                  </p>

                  {isCustomValue && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 pt-2">
                        <FileUploadField
                          label="İkon"
                          kind="icon"
                          slug={slugValue}
                          value={watch('assets.icon')}
                          onUploaded={(url) => setValue('assets.icon', url, { shouldValidate: true })}
                          onUploadingChange={setIsUploading}
                          error={errors.assets?.icon?.message}
                        />

                        <FileUploadField
                          label="3D Model"
                          kind="model"
                          slug={slugValue}
                          value={watch('assets.modelUrl')}
                          onUploaded={(url) => setValue('assets.modelUrl', url, { shouldValidate: true })}
                          onUploadingChange={setIsUploading}
                          error={errors.assets?.modelUrl?.message}
                        />
                      </div>
                      {!!watch('assets.modelUrl') && <GlbPreview url={watch('assets.modelUrl')!} />}
                    </>
                  )}
                </>
              )}
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
          {isCustomValue && (
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Alt Modüller</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Ör. Kapak modülünün altına Düz/Kare/Rustik kapak stilleri gibi varyantlar ekleyin.
                  Her alt modül kendi ikon/3B modelini CDN'e yükleyebilir.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
                onClick={() => appendSubmodule(emptySubmodule())}
              >
                <Plus className="h-4 w-4" /> Alt Modül Ekle
              </Button>
            </CardHeader>
            {submoduleFields.length > 0 && (
              <CardContent className="space-y-4">
                {submoduleFields.map((field, index) => {
                  const subIsCustom = watch(`submodules.${index}.isCustom`);
                  const subSlug = watch(`submodules.${index}.slug`);
                  const subErrors = errors.submodules?.[index];
                  return (
                    <div key={field.id} className="rounded-md border border-border p-4 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid gap-4 md:grid-cols-2 flex-1">
                          <div className="space-y-2">
                            <Label>İsim *</Label>
                            <Input
                              {...register(`submodules.${index}.name`)}
                              onChange={(e) => {
                                setValue(`submodules.${index}.name`, e.target.value);
                                setValue(`submodules.${index}.slug`, slugify(e.target.value), { shouldValidate: true });
                              }}
                              className={subErrors?.name ? 'border-destructive' : ''}
                            />
                            {subErrors?.name && <p className="text-sm text-destructive">{subErrors.name.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label>Slug *</Label>
                            <Input
                              {...register(`submodules.${index}.slug`)}
                              className={subErrors?.slug ? 'border-destructive' : ''}
                            />
                            {subErrors?.slug && <p className="text-sm text-destructive">{subErrors.slug.message}</p>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => removeSubmodule(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Açıklama</Label>
                          <Textarea {...register(`submodules.${index}.description`)} className="min-h-[70px]" />
                        </div>
                        <div className="space-y-2">
                          <Label>Fiyat Farkı (₺)</Label>
                          <Input
                            type="number"
                            {...register(`submodules.${index}.priceModifier`)}
                            className={subErrors?.priceModifier ? 'border-destructive' : ''}
                          />
                          {subErrors?.priceModifier && (
                            <p className="text-sm text-destructive">{subErrors.priceModifier.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Bu stil seçildiğinde ana modülün fiyatına eklenen fark (varsayılan 0 = ek ücret yok).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={subIsCustom ?? false}
                          onCheckedChange={(checked) => setValue(`submodules.${index}.isCustom`, checked)}
                        />
                        <Label className="font-medium cursor-pointer">Özelleştirilebilir (CDN İkon/Model)</Label>
                      </div>

                      {subIsCustom && (
                        <>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FileUploadField
                              label="İkon"
                              kind="icon"
                              slug={subSlug}
                              value={watch(`submodules.${index}.assets.icon`)}
                              onUploaded={(url) => setValue(`submodules.${index}.assets.icon`, url, { shouldValidate: true })}
                              onUploadingChange={setIsUploading}
                              error={subErrors?.assets?.icon?.message}
                            />
                            <FileUploadField
                              label="3D Model"
                              kind="model"
                              slug={subSlug}
                              value={watch(`submodules.${index}.assets.modelUrl`)}
                              onUploaded={(url) => setValue(`submodules.${index}.assets.modelUrl`, url, { shouldValidate: true })}
                              onUploadingChange={setIsUploading}
                              error={subErrors?.assets?.modelUrl?.message}
                            />
                          </div>
                          {!!watch(`submodules.${index}.assets.modelUrl`) && (
                            <GlbPreview url={watch(`submodules.${index}.assets.modelUrl`)!} />
                          )}
                        </>
                      )}

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Rozet Zemin Rengi</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-14 p-1"
                              value={watch(`submodules.${index}.swatchColor`) || '#e4d9c9'}
                              onChange={(e) => setValue(`submodules.${index}.swatchColor`, e.target.value)}
                            />
                            <Input {...register(`submodules.${index}.swatchColor`)} placeholder="#e4d9c9" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Rozet Yazı Rengi</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-14 p-1"
                              value={watch(`submodules.${index}.swatchTextColor`) || '#4a3f30'}
                              onChange={(e) => setValue(`submodules.${index}.swatchTextColor`, e.target.value)}
                            />
                            <Input {...register(`submodules.${index}.swatchTextColor`)} placeholder="#4a3f30" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-2 border-t border-border">
                        <Switch
                          checked={watch(`submodules.${index}.isActive`) ?? true}
                          onCheckedChange={(checked) => setValue(`submodules.${index}.isActive`, checked)}
                        />
                        <Label className="font-medium cursor-pointer">Aktif</Label>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            )}
          </Card>
          )}


          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
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
