import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getModuleCategoryRules, updateModuleCategoryRules, type ModuleCategoryRules } from '@/services/settings';
import { useCategories } from '@/hooks/use-categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils';
import { MODULE_TYPES, MODULE_TYPE_LABELS, type ModuleType } from '@/lib/moduleTypes';

// Kategori × modül tipi kural matrisi. Hangi modül tipinin hangi ürün kategorisinde
// kullanılabileceğini belirler — hem planner (client) hem API pricing bu kurala uyar.
// İki eksen de kapalı küme olduğu için (kategoriler DB'den, tipler MODULE_TYPES'tan)
// yanlış yazım/uydurma değer girilmesi mümkün değildir.
export const ModuleRulesPage = () => {
  const queryClient = useQueryClient();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: rules, isLoading: loadingRules } = useQuery({
    queryKey: ['settings', 'moduleCategoryRules'],
    queryFn: getModuleCategoryRules,
  });

  const [draft, setDraft] = useState<ModuleCategoryRules>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (rules) {
      setDraft(rules);
      setDirty(false);
    }
  }, [rules]);

  const saveRules = useMutation({
    mutationFn: updateModuleCategoryRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'moduleCategoryRules'] });
      toast.success('Modül kuralları kaydedildi');
      setDirty(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Kurallar kaydedilirken bir hata oluştu'));
    },
  });

  const isAllowed = (categorySlug: string, type: ModuleType) =>
    (draft[categorySlug] ?? []).includes(type);

  const toggle = (categorySlug: string, type: ModuleType, checked: boolean) => {
    setDraft((prev) => {
      const current = new Set(prev[categorySlug] ?? []);
      if (checked) current.add(type);
      else current.delete(type);
      return { ...prev, [categorySlug]: MODULE_TYPES.filter((t) => current.has(t)) };
    });
    setDirty(true);
  };

  const isLoading = loadingCategories || loadingRules;

  return (
    <Layout title="Modül Kuralları">
      <div className="max-w-4xl space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Kategori × Modül Tipi Matrisi</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Hangi modül tipinin hangi ürün kategorisinde kullanılabileceğini belirler.
              Hem planner (müşteri arayüzü) hem fiyatlama servisi bu kurala uyar — işaretli
              olmayan tip, o kategorideki ürünlere eklenemez.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-12 text-muted-foreground">Yükleniyor...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[200px]">Kategori</TableHead>
                      {MODULE_TYPES.map((t) => (
                        <TableHead key={t} className="text-center">
                          {MODULE_TYPE_LABELS[t]}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((cat) => (
                      <TableRow key={cat.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">
                          {cat.name}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {cat.slug}
                          </span>
                        </TableCell>
                        {MODULE_TYPES.map((t) => (
                          <TableCell key={t} className="text-center">
                            <Checkbox
                              checked={isAllowed(cat.slug, t)}
                              onCheckedChange={(checked) => toggle(cat.slug, t, checked === true)}
                              aria-label={`${cat.name} — ${MODULE_TYPE_LABELS[t]}`}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
          <Button
            variant="outline"
            disabled={!dirty || saveRules.isPending}
            onClick={() => {
              setDraft(rules ?? {});
              setDirty(false);
            }}
          >
            Geri Al
          </Button>
          <Button
            disabled={!dirty || saveRules.isPending}
            onClick={() => saveRules.mutate(draft)}
          >
            {saveRules.isPending ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};
