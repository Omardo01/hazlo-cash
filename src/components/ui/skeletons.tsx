import { Skeleton } from "@/components/ui/skeleton";

// ── Bloques reutilizables ─────────────────────────────────────────────────────

function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function SkeletonChartCard({ height = 220 }: { height?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
      <Skeleton className="w-full rounded-xl" style={{ height }} />
    </div>
  );
}

function SkeletonListRow({ showAvatar = true }: { showAvatar?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {showAvatar && <Skeleton className="h-9 w-9 rounded-xl shrink-0" />}
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-4 w-14" />
    </div>
  );
}

function SkeletonTableHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
      {[48, 80, 60, 56, 40].map((w, i) => (
        <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
      ))}
    </div>
  );
}

// ── Recomendador Dashboard ────────────────────────────────────────────────────

export function RecomendadorDashboardSkeleton() {
  return (
    <div className="flex flex-1 min-h-0 gap-0">
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 min-w-0 overflow-auto">
        {/* Breadcrumb */}
        <Skeleton className="h-3.5 w-48" />

        {/* Profile header */}
        <div className="flex items-center gap-3 -mt-1">
          <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
          <Skeleton className="h-7 w-36" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
        </div>

        {/* Chart */}
        <SkeletonChartCard height={200} />

        {/* Distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonChartCard height={160} />
          <SkeletonChartCard height={160} />
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex w-[270px] xl:w-[290px] shrink-0 flex-col border-l border-border bg-background overflow-auto p-5 gap-4">
        <Skeleton className="h-4 w-24" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Comisiones ────────────────────────────────────────────────────────────────

export function ComisionesSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
      </div>

      {/* Chart */}
      <SkeletonChartCard height={180} />

      {/* Filter pills */}
      <div className="flex gap-2">
        {[64, 48, 72, 56].map((w, i) => (
          <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <SkeletonTableHeader />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border-b border-border last:border-0">
            <SkeletonListRow />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Negocio Dashboard ─────────────────────────────────────────────────────────

export function NegocioDashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
      </div>

      {/* Chart + solicitudes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChartCard height={200} />
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-border last:border-0">
              <SkeletonListRow />
            </div>
          ))}
        </div>
      </div>

      {/* Embajadores */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border last:border-0">
            <SkeletonListRow />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Solicitudes ───────────────────────────────────────────────────────────────

export function SolicitudesSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-auto">
      {/* Search + filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="flex gap-2">
        {[64, 72, 80, 72, 68].map((w, i) => (
          <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <SkeletonTableHeader />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b border-border last:border-0">
            <SkeletonListRow />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Embajadores ───────────────────────────────────────────────────────────────

export function EmbajadoresSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-auto">
      {/* Stats top */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => <SkeletonStatCard key={i} />)}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[56, 60, 52].map((w, i) => (
          <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border-b border-border last:border-0">
            <SkeletonListRow />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
      </div>

      {/* Chart + pending actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SkeletonChartCard height={220} />
        </div>
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="p-4 border-b border-border">
            <Skeleton className="h-4 w-36" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-b border-border last:border-0">
              <SkeletonListRow showAvatar={false} />
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border last:border-0">
            <SkeletonListRow showAvatar={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Table genérico (negocios, users, finanzas) ─────────────────────────

export function AdminTableSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 overflow-auto">
      {/* Search + action */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-white overflow-hidden">
        <SkeletonTableHeader />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="border-b border-border last:border-0">
            <SkeletonListRow />
          </div>
        ))}
      </div>
    </div>
  );
}
