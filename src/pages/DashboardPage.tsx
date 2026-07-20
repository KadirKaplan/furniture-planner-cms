import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCategories } from '@/hooks/use-categories';
import { useMaterials } from '@/hooks/use-materials';
import { useModules } from '@/hooks/use-modules';
import { useProducts } from '@/hooks/use-products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Layers, Box, ShoppingBag, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { CardSkeleton, TableSkeleton } from '@/components/common/LoadingSkeleton';
import { motion } from 'framer-motion';

export const DashboardPage = () => {
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: materials, isLoading: loadingMaterials } = useMaterials();
  const { data: modules, isLoading: loadingModules } = useModules();
  const { data: products, isLoading: loadingProducts } = useProducts();

  const today = new Intl.DateTimeFormat('tr-TR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  const stats = [
    { name: 'Kategoriler', value: categories?.length || 0, icon: Tag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Materyaller', value: materials?.length || 0, icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Modüller', value: modules?.length || 0, icon: Box, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'Ürünler', value: products?.length || 0, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const recentCategories = categories?.slice(0, 5) || [];
  const recentModules = modules?.slice(0, 5) || [];

  return (
    <Layout title={`Genel Bakış — ${today}`}>
      <div className="space-y-8">
        {/* Actions Row */}
        <div className="flex flex-wrap gap-3">
          <Link href="/categories/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Kategori Ekle</Button>
          </Link>
          <Link href="/modules/new">
            <Button variant="secondary" className="gap-2"><Plus className="w-4 h-4" /> Modül Ekle</Button>
          </Link>
          <Link href="/products/new">
            <Button variant="secondary" className="gap-2"><Plus className="w-4 h-4" /> Ürün Ekle</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(loadingCategories || loadingMaterials || loadingModules || loadingProducts) ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            stats.map((stat, i) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.name}
                    </CardTitle>
                    <div className={`p-2 rounded-md ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Recent Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Categories */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Son Eklenen Kategoriler</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <TableSkeleton rows={3} columns={2} />
              ) : recentCategories.length > 0 ? (
                <div className="divide-y divide-border border border-border rounded-md">
                  {recentCategories.map((cat, i) => (
                    <div key={cat.id} className="flex justify-between items-center p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-sm text-muted-foreground">{cat.slug}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${cat.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {cat.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-border rounded-md border-dashed">
                  Henüz kategori bulunmuyor.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Modules */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Son Eklenen Modüller</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingModules ? (
                <TableSkeleton rows={3} columns={2} />
              ) : recentModules.length > 0 ? (
                <div className="divide-y divide-border border border-border rounded-md">
                  {recentModules.map((mod) => (
                    <div key={mod.id} className="flex justify-between items-center p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{mod.name}</span>
                        <span className="text-sm text-muted-foreground">{mod.slug}</span>
                      </div>
                      <span className="font-medium text-primary">₺{mod.priceModifier}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-border rounded-md border-dashed">
                  Henüz modül bulunmuyor.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
