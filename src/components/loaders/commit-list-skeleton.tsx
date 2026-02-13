"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function CommitListSkeleton() {
  const widths = ["w-3/4", "w-2/3", "w-4/5", "w-1/2", "w-3/5", "w-2/3", "w-4/5", "w-3/4"];

  return (
    <div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`flex items-start gap-4 px-6 py-4 ${
            i !== 0 ? "border-t border-dashed border-border" : ""
          }`}
        >
          {/* Abbreviated hash */}
          <Skeleton className="mt-0.5 h-5 w-16 shrink-0 rounded" />

          {/* Message + meta */}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={`h-4 ${widths[i]} rounded`} />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-2 rounded-full" />
              <Skeleton className="h-3 w-16" />
              {i < 2 && (
                <>
                  <Skeleton className="h-3 w-2 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </>
              )}
            </div>
          </div>

          {/* More menu */}
          <Skeleton className="size-8 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}
