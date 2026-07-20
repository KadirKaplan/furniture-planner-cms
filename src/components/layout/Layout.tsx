import React, { useEffect, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const COLLAPSE_KEY = 'cms-sidebar-collapsed';

export const Layout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Masaüstünde ray daraltma tercihi kalıcı; mobilde bunun yerine çekmece açılır.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  // Masaüstüne dönüldüğünde açık kalmış çekmece ekranın üstünde asılı kalmasın.
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const ToggleIcon = isMobile ? Menu : collapsed ? PanelLeft : PanelLeftClose;

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {!isMobile && <Sidebar collapsed={collapsed} />}

      {/* Mobil: aynı menü, soldan kayan çekmecede */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-64 p-0 border-sidebar-border bg-sidebar">
          <SheetTitle className="sr-only">Menü</SheetTitle>
          <SheetDescription className="sr-only">Yönetim paneli gezinme menüsü</SheetDescription>
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6 lg:px-8 shadow-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed((c) => !c))}
              aria-label={isMobile ? 'Menüyü aç' : collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
              className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ToggleIcon className="h-5 w-5" />
            </button>
            {title && (
              <h1 className="truncate text-base sm:text-xl font-semibold text-foreground tracking-tight">
                {title}
              </h1>
            )}
          </div>
          <div className="hidden sm:flex items-center text-sm font-medium text-muted-foreground shrink-0">
            {user?.name}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
