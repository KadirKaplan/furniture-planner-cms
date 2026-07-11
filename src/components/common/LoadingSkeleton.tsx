import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="rounded-md border border-border">
      <div className="border-b border-border p-4 bg-muted/20">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border-b border-border last:border-0 flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <Skeleton className="h-5 w-1/3 mb-4" />
      <Skeleton className="h-10 w-1/2 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
};
