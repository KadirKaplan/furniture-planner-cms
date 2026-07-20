import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCategories, useDeleteCategory } from '@/hooks/use-categories';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, Tag } from 'lucide-react';
import { Link } from 'wouter';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { motion } from 'framer-motion';

export const CategoriesPage = () => {
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCategories = categories?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout title="Kategoriler">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Kategori ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <Link href="/categories/new" className="block w-full sm:w-auto">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Yeni Kategori
            </Button>
          </Link>
        </div>

        <div className="rounded-md border border-border bg-card overflow-x-auto">
          {isLoading ? (
            <TableSkeleton columns={5} rows={5} />
          ) : filteredCategories.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">İsim</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category, i) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border transition-colors hover:bg-muted/20 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{category.order}</TableCell>
                    <TableCell>
                      {category.isActive ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">Aktif</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground font-medium">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Kategori Bulunamadı</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Arama kriterlerinize uygun kategori bulunamadı veya henüz hiç kategori eklenmemiş.
              </p>
              {searchTerm && (
                <Button variant="link" onClick={() => setSearchTerm('')} className="mt-4">
                  Aramayı Temizle
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog 
        open={!!deleteId} 
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteCategory.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </Layout>
  );
};
