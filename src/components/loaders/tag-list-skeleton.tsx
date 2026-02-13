"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TagListSkeleton() {
  return (
    <div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-4 px-6 py-4 ${
            i !== 0 ? "border-t border-dashed border-border" : ""
          }`}
        >
          {/* Tag icon */}
          <Skeleton className="size-5 shrink-0 rounded" />

          {/* Name + badge + hash + message + date */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              {i % 2 === 0 && <Skeleton className="h-4 w-16 rounded-full" />}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-2 rounded-full" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Action buttons: Copy + more menu */}
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-8 w-14 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
