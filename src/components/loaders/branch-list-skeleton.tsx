"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BranchListSkeleton() {
  return (
    <div>
      {/* Local section header */}
      <div className="px-6 pb-1 pt-4">
        <Skeleton className="h-3 w-10" />
      </div>

      {/* Local branches */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`local-${i}`}
          className={`flex items-center gap-4 px-6 py-4 ${
            i !== 0 ? "border-t border-dashed border-border" : ""
          }`}
        >
          {/* Branch icon */}
          <Skeleton className="size-5 rounded-full" />

          {/* Name + hash */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              {i === 0 && <Skeleton className="h-4 w-14 rounded-full" />}
            </div>
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Action buttons */}
          {i !== 0 && (
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          )}
        </div>
      ))}

      {/* Remote section header */}
      <div className="mt-2 border-t border-border px-6 pb-1 pt-4">
        <Skeleton className="h-3 w-14" />
      </div>

      {/* Remote branches */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`remote-${i}`}
          className={`flex items-center gap-4 px-6 py-4 ${
            i !== 0 ? "border-t border-dashed border-border" : ""
          }`}
        >
          <Skeleton className="size-5 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
