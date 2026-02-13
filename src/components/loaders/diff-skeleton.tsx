"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DiffSkeleton() {
  return (
    <div className="space-y-4 px-6 py-8">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
