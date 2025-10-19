import { TableSkeleton } from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-[300px] bg-muted animate-pulse rounded" />
        <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
      </div>
      <TableSkeleton />
    </div>
  );
}
