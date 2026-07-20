import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useModules, useDeleteModule } from '@/hooks/use-modules';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, Box } from 'lucide-react';
import { Link } from 'wouter';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { motion } from 'framer-motion';
import { MODULE_TYPE_LABELS } from '@/lib/moduleTypes';

export const ModulesPage = () => {
  const { data: modules, isLoading } = useModules();
  const deleteModule = useDeleteModule();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredModules = modules?.filter(m => 
    (m.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.slug ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout title="Modüller">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Modül ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <Link href="/modules/new" className="block w-full sm:w-auto">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Yeni Modül
            </Button>
          </Link>
        </div>

        <div className="rounded-md border border-border bg-card overflow-x-auto">
          {isLoading ? (
            <TableSkeleton columns={8} rows={5} />
          ) : filteredModules.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[56px]"></TableHead>
                  <TableHead className="w-[250px]">İsim</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Fiyat Etkisi</TableHead>
                  <TableHead>Özelleştirilebilir</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map((mod, i) => (
                  <motion.tr
                    key={mod.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border transition-colors hover:bg-muted/20 data-[state=selected]:bg-muted"
                  >
                    <TableCell>
                      {mod.assets?.icon ? (
                        <img
                          src={mod.assets.icon}
                          alt={mod.name}
                          className="h-8 w-8 rounded object-contain border border-border bg-background"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded border border-border"
                          style={{ backgroundColor: mod.swatchColor || 'transparent' }}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {mod.name}
                      {mod.submodules && mod.submodules.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({mod.submodules.length} alt modül)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{mod.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {MODULE_TYPE_LABELS[mod.type] ?? mod.type ?? '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-primary">₺{mod.priceModifier}</TableCell>
                    <TableCell>
                      {mod.isCustom ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">Evet</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground font-medium">Hayır</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {mod.isActive ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-medium">Aktif</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground font-medium">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/modules/${mod.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(mod.id)}
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
                <Box className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Modül Bulunamadı</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                Arama kriterlerinize uygun modül bulunamadı veya henüz hiç modül eklenmemiş.
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
            deleteModule.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </Layout>
  );
};
