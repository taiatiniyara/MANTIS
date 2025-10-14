export function MapSkeleton() {
  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
      <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading map...</p>
        </div>
      </div>
    </div>
  );
}
