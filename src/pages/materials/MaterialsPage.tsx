import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useMaterials, useDeleteMaterial } from '@/hooks/use-materials';
import { materialTypes } from '@/services/materials';
import type { MaterialType } from '@/services/materials';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { motion } from 'framer-motion';

export const MaterialsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: materials, isLoading } = useMaterials(activeTab === 'all' ? undefined : activeTab);
  // Sekmeler yalnızca gerçekten var olan materyal tiplerini gösterir — materialTypes'taki
  // tüm tipler (ör. Cam, Metal, Supramat, Akrilik) DB'de o tipte hiç materyal yoksa
  // sekme olarak çıkmaz (Malzeme Ekle formundaki tip seçeneklerini etkilemez).
  const { data: allMaterials } = useMaterials();
  const existingTypes = new Set((allMaterials ?? []).map((m) => m.type));
  const tabs = {
    all: 'Tümü',
    ...Object.fromEntries(
      Object.entries(materialTypes).filter(([key]) => existingTypes.has(key as MaterialType))
    ),
  };
  const deleteMaterial = useDeleteMaterial();

  const filteredMaterials = materials?.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout title="Materyaller">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-card border border-border h-11 p-1 flex-wrap h-auto">
              {Object.entries(tabs).map(([key, label]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Materyal ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>
            <Link href="/materials/new" className="shrink-0">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Yeni Materyal
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMaterials.map((material, i) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="overflow-hidden border-border shadow-sm group hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] w-full relative border-b border-border bg-muted flex items-center overflow-hidden">
                    {material.colors?.length > 0 ? (
                      <div className="flex w-full h-full">
                        {material.colors.slice(0, 5).map((color, idx) => (
                          <div
                            key={color.id ?? idx}
                            className="flex-1 h-full"
                            style={{ backgroundColor: color.hex || '#e2ece8' }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                    {!material.isActive && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                        <Badge variant="secondary">Pasif</Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Link href={`/materials/${material.id}/edit`}>
                        <Button variant="secondary" size="icon" className="h-7 w-7 shadow-sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 shadow-sm text-destructive"
                        onClick={() => setDeleteId(material.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-medium truncate" title={material.name}>{material.name}</h3>
                      <Badge variant="outline" className="shrink-0 text-xs py-0 h-5">
                        {materialTypes[material.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{material.slug}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {material.colors?.length ?? 0} renk
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center border border-border border-dashed rounded-lg bg-card/50">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Materyal Bulunamadı</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Seçili filtre ve arama kriterlerine uygun materyal bulunmuyor.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMaterial.mutate(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </Layout>
  );
};
