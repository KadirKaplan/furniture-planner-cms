import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Tag, Layers, Box, ShoppingBag, Users, LogOut, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Logo } from '../common/Logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kategoriler', href: '/categories', icon: Tag },
  { name: 'Materyaller', href: '/materials', icon: Layers },
  { name: 'Modüller', href: '/modules', icon: Box },
  { name: 'Modül Kuralları', href: '/module-rules', icon: SlidersHorizontal },
  { name: 'Ürünler', href: '/products', icon: ShoppingBag },
  { name: 'Kullanıcılar', href: '/users', icon: Users },
];

interface SidebarProps {
  /** Daraltılmış mod: yalnızca ikon rayı (planner'ın sol rayı gibi). Mobil çekmecede kullanılmaz. */
  collapsed?: boolean;
  /** Mobil çekmecede bir bağlantıya basınca çekmeceyi kapatmak için. */
  onNavigate?: () => void;
}

export const Sidebar = ({ collapsed = false, onNavigate }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-sidebar-border',
          collapsed ? 'justify-center px-0' : 'px-6',
        )}
      >
        {collapsed ? (
          <div className="w-4 h-4 bg-sidebar-primary rotate-45 rounded-[2px]" />
        ) : (
          <Logo markClassName="bg-sidebar-primary" className="text-white" />
        )}
      </div>

      <div className={cn('flex flex-1 flex-col overflow-y-auto overflow-x-hidden pt-6', collapsed ? 'px-2' : 'px-4')}>
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href);
            const link = (
              <Link key={item.name} href={item.href} className="block" onClick={onNavigate}>
                <div
                  className={cn(
                    'group flex items-center text-sm font-medium transition-all duration-200 cursor-pointer border-l-4',
                    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary'
                      : 'text-sidebar-foreground/80 border-transparent hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      collapsed ? '' : 'mr-3',
                      isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                    )}
                    aria-hidden="true"
                  />
                  {!collapsed && item.name}
                </div>
              </Link>
            );

            // Daraltılmışken etiket görünmediği için adı tooltip'te veriyoruz.
            return collapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            ) : link;
          })}
        </nav>
      </div>

      <div className={cn('border-t border-sidebar-border', collapsed ? 'p-2' : 'p-4')}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-9 w-9 bg-sidebar-accent border border-sidebar-border">
              <AvatarFallback className="bg-transparent text-xs text-sidebar-foreground/80">{initials}</AvatarFallback>
            </Avatar>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                  aria-label="Çıkış Yap"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Çıkış Yap</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 bg-sidebar-accent border border-sidebar-border">
              <AvatarFallback className="bg-transparent text-xs text-sidebar-foreground/80">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/60">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
