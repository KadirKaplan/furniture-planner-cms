import React from 'react';
import { cn } from '@/lib/utils';

export const Logo: React.FC<{ className?: string; markClassName?: string }> = ({ className, markClassName }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("w-4 h-4 bg-primary rotate-45 rounded-[2px]", markClassName)} />
      <div className="flex items-baseline tracking-tight">
        <span className="font-bold text-xl">eyce</span>
        <span className="font-normal text-xl text-muted-foreground ml-1.5">studio</span>
      </div>
    </div>
  );
};
