"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CommitDetailSkeleton() {
  return (
    <div className="rail-bounded">
      <div className="space-y-6 px-6 py-8">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
