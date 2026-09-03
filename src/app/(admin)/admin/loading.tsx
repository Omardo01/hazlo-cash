import { Skeleton } from "@/components/ui/skeleton";

// Cubre /admin y todas sus subrutas mientras cargan los datos de Supabase.
export default function AdminLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
        <Skeleton className="h-6 w-28" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-4 bg-[#fbfbfd] p-4 sm:p-6">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
