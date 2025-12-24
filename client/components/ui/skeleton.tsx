import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function SessionCardSkeleton() {
  return (
    <div className="w-full border rounded-lg p-4 sm:p-6 bg-white">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="p-3 bg-muted/50 rounded-lg mb-4">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <div />
          <div className="text-right">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2">
        <Skeleton className="flex-1 h-11" />
        <Skeleton className="flex-1 h-11" />
        <Skeleton className="flex-1 h-11" />
      </div>
    </div>
  );
}

function CommentSkeleton({ nested = false }: { nested?: boolean }) {
  return (
    <div className={cn("flex gap-2 sm:gap-3 py-2 sm:py-3", nested && "ml-2 sm:ml-6")}>
      <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function SessionDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Response section */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="flex-1 h-11" />
          <Skeleton className="flex-1 h-11" />
          <Skeleton className="flex-1 h-11" />
        </div>
        <Skeleton className="h-20 w-full" />
      </div>

      {/* Comments section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton nested />
          <CommentSkeleton />
        </div>
      </div>
    </div>
  );
}

export { 
  Skeleton,
  SessionCardSkeleton,
  CommentSkeleton,
  SessionDetailSkeleton
};