import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

export const Layout: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {title && (
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-8 shadow-sm z-10">
            <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              {user?.name}
            </div>
          </header>
        )}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
