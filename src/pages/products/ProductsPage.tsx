import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useProducts, useDeleteProduct } from '@/hooks/use-products';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { motion } from 'framer-motion';

export const ProductsPage = () => {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredProducts = products?.filter(p => 
    (p.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.slug ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout title="Ürünler">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Ürün ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <Link href="/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Yeni Ürün
            </Button>
          </Link>
        </div>

        <div className="rounded-md border border-border bg-card overflow-hidden">
          {isLoading ? (
            <TableSkeleton columns={5} rows={5} />
          ) : filteredProducts.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">İsim</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border transition-colors hover:bg-muted/20 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {typeof product.category === 'object' && product.category ? (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium">
                          {product.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Belirtilmemiş</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-primary">₺{product.basePrice}</TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">Aktif</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground font-medium">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(product.id)}
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
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Ürün Bulunamadı</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Arama kriterlerinize uygun ürün bulunamadı veya henüz hiç ürün eklenmemiş.
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
            deleteProduct.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </Layout>
  );
};
