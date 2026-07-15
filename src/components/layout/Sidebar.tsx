import React from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Tag, Layers, Box, ShoppingBag, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Logo } from '../common/Logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kategoriler', href: '/categories', icon: Tag },
  { name: 'Materyaller', href: '/materials', icon: Layers },
  { name: 'Modüller', href: '/modules', icon: Box },
  { name: 'Ürünler', href: '/products', icon: ShoppingBag },
  { name: 'Kullanıcılar', href: '/users', icon: Users },
];

export const Sidebar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border">
        <Logo markClassName="bg-sidebar-primary" className="text-white" />
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-6 px-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className="block">
                <div
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer border-l-4',
                    isActive
                      ? 'bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary'
                      : 'text-sidebar-foreground/80 border-transparent hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-4">
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
      </div>
    </div>
  );
};
